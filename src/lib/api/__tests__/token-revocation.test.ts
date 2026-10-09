import { describe, expect, it, mock } from "bun:test";
import type { TokenIntrospectionResult } from "@schemavaults/auth-server-sdk";
import {
  evaluateTokenRevocation,
  type DecodedTokenClaims,
} from "@schemavaults/auth-server-sdk/route_guards";
import { createTokenRevocationCheck } from "../token-revocation";

const UID = "8d7f6e5c-4b3a-4291-8f7e-6d5c4b3a2910";
const JTI = "3c2b1a09-8f7e-4d6c-9b5a-4f3e2d1c0b9a";
const IAT = 1_790_000_000;
const COOKIE_NAME = "access_token_schemavaults-mail";

const claims = (overrides: Partial<DecodedTokenClaims> = {}) =>
  ({ jti: JTI, iat: IAT, uid: UID, type: "access", ...overrides }) as const;

const active = (
  overrides: Record<string, unknown> = {},
): TokenIntrospectionResult => ({
  active: true,
  client_id: "schemavaults-mail-admin",
  exp: IAT + 3600,
  iat: IAT,
  sub: `schemavaults-auth|${UID}`,
  uid: UID,
  aud: "schemavaults-mail",
  iss: "https://auth.example.com",
  jti: JTI,
  ...overrides,
});
const INACTIVE: TokenIntrospectionResult = { active: false };

/** A check over a request with the given headers and introspection answers. */
function check(
  requestHeaders: Record<string, string>,
  answers: Record<string, TokenIntrospectionResult | Error>,
) {
  const introspect = mock(async (token: string) => {
    const answer = answers[token];
    if (answer instanceof Error) throw answer;
    return answer ?? INACTIVE;
  });
  const isTokenRevoked = createTokenRevocationCheck({
    requestHeaders: async () => new Headers(requestHeaders),
    introspect,
    accessTokenCookieName: () => COOKIE_NAME,
  });
  return { isTokenRevoked, introspect };
}

describe("createTokenRevocationCheck", () => {
  it("accepts a bearer token the auth server reports active", async () => {
    const { isTokenRevoked, introspect } = check(
      { authorization: "Bearer bearer-token" },
      { "bearer-token": active() },
    );
    expect(await isTokenRevoked(claims())).toBe(false);
    expect(introspect).toHaveBeenCalledTimes(1);
    expect(introspect).toHaveBeenCalledWith("bearer-token");
  });

  it("rejects a token the auth server reports inactive", async () => {
    const { isTokenRevoked } = check(
      { authorization: "Bearer bearer-token" },
      { "bearer-token": INACTIVE },
    );
    expect(await isTokenRevoked(claims())).toBe(true);
  });

  it("rejects an active result for a different token or user", async () => {
    const otherJti = check(
      { authorization: "Bearer bearer-token" },
      { "bearer-token": active({ jti: "another-jti" }) },
    );
    expect(await otherJti.isTokenRevoked(claims())).toBe(true);

    const otherUser = check(
      { authorization: "Bearer bearer-token" },
      { "bearer-token": active({ uid: "another-user" }) },
    );
    expect(await otherUser.isTokenRevoked(claims())).toBe(true);
  });

  it("matches legacy tokens without a jti by issue time", async () => {
    const { isTokenRevoked } = check(
      { authorization: "Bearer bearer-token" },
      { "bearer-token": active({ jti: undefined }) },
    );
    expect(await isTokenRevoked(claims({ jti: null }))).toBe(false);
    expect(await isTokenRevoked(claims({ jti: null, iat: IAT - 1 }))).toBe(
      true,
    );
  });

  it("introspects the access-token cookie the auth provider writes", async () => {
    const cookie = encodeURIComponent(
      JSON.stringify({ token: "cookie-token", exp: Date.now() + 60_000 }),
    );
    const { isTokenRevoked, introspect } = check(
      { cookie: `other=1; ${COOKIE_NAME}=${cookie}` },
      { "cookie-token": active() },
    );
    expect(await isTokenRevoked(claims())).toBe(false);
    expect(introspect).toHaveBeenCalledWith("cookie-token");
  });

  it("finds the verified token among bearer and cookie tokens", async () => {
    const { isTokenRevoked, introspect } = check(
      {
        authorization: "Bearer bearer-token",
        cookie: `${COOKIE_NAME}=cookie-token`,
      },
      { "bearer-token": INACTIVE, "cookie-token": active() },
    );
    expect(await isTokenRevoked(claims())).toBe(false);
    expect(introspect).toHaveBeenCalledTimes(2);
  });

  it("rejects when the request presents no access token", async () => {
    const { isTokenRevoked, introspect } = check({}, {});
    expect(await isTokenRevoked(claims())).toBe(true);
    expect(introspect).not.toHaveBeenCalled();
  });

  it("rejects refresh tokens without asking the auth server", async () => {
    const { isTokenRevoked, introspect } = check(
      { authorization: "Bearer bearer-token" },
      { "bearer-token": active() },
    );
    expect(await isTokenRevoked(claims({ type: "refresh" }))).toBe(true);
    expect(introspect).not.toHaveBeenCalled();
  });

  it("fails closed when the auth server cannot be reached", async () => {
    const { isTokenRevoked } = check(
      { authorization: "Bearer bearer-token" },
      { "bearer-token": new Error("fetch failed") },
    );
    const result = await evaluateTokenRevocation(isTokenRevoked, [claims()]);
    expect(result.revoked).toBe(true);
    expect(result.error).toBeInstanceOf(Error);
  });
});
