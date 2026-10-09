import "server-only";

import { headers } from "next/headers";
import {
  AccessTokenCookieName,
  getSchemaVaultsAuthServerUrl,
  introspectToken,
  loadJwksAccessPrivateKey,
  type TokenIntrospectionResult,
} from "@schemavaults/auth-server-sdk";
import {
  accessTokenFromCookieValue,
  bearerTokenFromAuthorizationHeader,
  readCookie,
} from "@schemavaults/auth-server-sdk/openapi-operations";
import type {
  DecodedTokenClaims,
  IsTokenRevokedFn,
} from "@schemavaults/auth-server-sdk/route_guards";
import { getAppId } from "@/lib/getAppId";

// Token revocation for the SDK's `is_token_revoked` / `isTokenRevoked` hook.
//
// Local verification proves an access token is authentic and unexpired, but
// not what happened since it was issued. Revocations (logout, password
// reset), disabled accounts and de-authorized or disconnected apps are only
// known to the auth server, which reports them through RFC 7662 token
// introspection. The hook receives just the verified token's claims, so it
// introspects the raw access token(s) the request presented and requires
// one of them to come back active as THAT token (same jti and user).

export interface TokenRevocationCheckDependencies {
  /** The incoming request's headers (Authorization and Cookie). */
  requestHeaders: () => Promise<Pick<Headers, "get">>;
  /** Introspects one access token minted for this API server. */
  introspect: (token: string) => Promise<TokenIntrospectionResult>;
  /** Name of this API server's access-token cookie. */
  accessTokenCookieName: () => string;
}

/**
 * The raw access tokens a request presents, in the order the credential
 * resolvers try them: the Authorization bearer token, then the cookie.
 */
function presentedAccessTokens(
  requestHeaders: Pick<Headers, "get">,
  cookieName: string,
): string[] {
  const tokens: string[] = [];
  const bearer = bearerTokenFromAuthorizationHeader(
    requestHeaders.get("authorization") ?? undefined,
  );
  if (bearer.kind === "token") tokens.push(bearer.token);
  const cookieValue = readCookie(requestHeaders.get("cookie"), cookieName);
  const fromCookie =
    cookieValue === undefined ? null : accessTokenFromCookieValue(cookieValue);
  if (fromCookie !== null && !tokens.includes(fromCookie)) {
    tokens.push(fromCookie);
  }
  return tokens;
}

/** Whether an introspection result reports `claims`' token as active. */
function isActiveIntrospectionOf(
  result: TokenIntrospectionResult,
  claims: DecodedTokenClaims,
): boolean {
  if (!result.active || result.uid !== claims.uid) return false;
  // Legacy tokens carry no jti; fall back to the issue time.
  return claims.jti !== null
    ? result.jti === claims.jti
    : result.iat === claims.iat;
}

/**
 * Builds the revocation hook. A verified token counts as revoked unless a
 * presented access token introspects active as that same token. A failed
 * introspection throws, which the SDK treats as revoked (fail closed): an
 * auth server outage must never widen access.
 */
export function createTokenRevocationCheck(
  deps: TokenRevocationCheckDependencies,
): IsTokenRevokedFn {
  return async function isTokenRevoked(
    claims: DecodedTokenClaims,
  ): Promise<boolean> {
    if (claims.type !== "access") {
      // Resource servers only ever accept access tokens.
      return true;
    }
    const tokens = presentedAccessTokens(
      await deps.requestHeaders(),
      deps.accessTokenCookieName(),
    );
    for (const token of tokens) {
      if (isActiveIntrospectionOf(await deps.introspect(token), claims)) {
        return false;
      }
    }
    return true;
  };
}

let jwksAccessPrivateKey: Promise<CryptoKey> | null = null;

/** Introspects an access token minted for this mail server. */
async function introspectMailServerAccessToken(
  token: string,
): Promise<TokenIntrospectionResult> {
  jwksAccessPrivateKey ??= loadJwksAccessPrivateKey().catch((e: unknown) => {
    // Retry on the next request rather than caching the failure.
    jwksAccessPrivateKey = null;
    throw e;
  });
  return await introspectToken({
    auth_server_url: getSchemaVaultsAuthServerUrl(),
    api_server_id: getAppId(),
    jwks_access_private_key: await jwksAccessPrivateKey,
    token,
  });
}

/**
 * The mail server's revocation hook, for both the operations' access-token
 * resolvers and the admin server-component guard. Costs one round trip to
 * the auth server per request authenticated with an access token.
 */
export const isMailServerTokenRevoked: IsTokenRevokedFn =
  createTokenRevocationCheck({
    requestHeaders: () => headers(),
    introspect: introspectMailServerAccessToken,
    accessTokenCookieName: () => AccessTokenCookieName(getAppId()),
  });
