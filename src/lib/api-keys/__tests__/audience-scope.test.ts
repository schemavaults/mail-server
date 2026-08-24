import { describe, expect, test } from "bun:test";
import {
  evaluateAudienceScope,
  hasNoAudienceAccess,
  toAddressList,
  type ApiKeyAudienceScope,
  type RequestedAudience,
} from "../audience-scope";

const MAILING_LIST_ID = "11111111-1111-1111-1111-111111111111";
const OTHER_MAILING_LIST_ID = "22222222-2222-2222-2222-222222222222";

function scope(
  overrides: Partial<ApiKeyAudienceScope> = {},
): ApiKeyAudienceScope {
  return {
    allowAnyAudience: false,
    allowedMailingListIds: [],
    allowedRecipientEmails: [],
    ...overrides,
  };
}

function request(overrides: Partial<RequestedAudience> = {}): RequestedAudience {
  return {
    to: "someone@example.com",
    toIsMailingListId: false,
    cc: undefined,
    bcc: undefined,
    ...overrides,
  };
}

describe("toAddressList", () => {
  test("normalizes undefined, a single address, and an array", () => {
    expect(toAddressList(undefined)).toEqual([]);
    expect(toAddressList("a@example.com")).toEqual(["a@example.com"]);
    expect(toAddressList(["a@example.com", "b@example.com"])).toEqual([
      "a@example.com",
      "b@example.com",
    ]);
  });
});

describe("hasNoAudienceAccess", () => {
  test("is true for a freshly created key with nothing configured", () => {
    expect(hasNoAudienceAccess(scope())).toBe(true);
  });

  test("is false once any audience entry or the any-recipient flag exists", () => {
    expect(hasNoAudienceAccess(scope({ allowAnyAudience: true }))).toBe(false);
    expect(
      hasNoAudienceAccess(scope({ allowedMailingListIds: [MAILING_LIST_ID] })),
    ).toBe(false);
    expect(
      hasNoAudienceAccess(
        scope({ allowedRecipientEmails: ["someone@example.com"] }),
      ),
    ).toBe(false);
  });
});

describe("evaluateAudienceScope", () => {
  test("denies a key with no audience configured", () => {
    const decision = evaluateAudienceScope(scope(), request());
    expect(decision.allowed).toBe(false);
    if (decision.allowed) throw new Error("expected denial");
    expect(decision.message).toContain("no audience configured");
  });

  test("denies a key with no audience configured even for a mailing list", () => {
    const decision = evaluateAudienceScope(
      scope(),
      request({ to: MAILING_LIST_ID, toIsMailingListId: true }),
    );
    expect(decision.allowed).toBe(false);
  });

  test("allows any recipient when the key is granted any audience", () => {
    const anyAudience = scope({ allowAnyAudience: true });
    expect(
      evaluateAudienceScope(anyAudience, request()).allowed,
    ).toBe(true);
    expect(
      evaluateAudienceScope(
        anyAudience,
        request({
          to: ["a@example.com", "b@example.com"],
          cc: "c@example.com",
          bcc: ["d@example.com"],
        }),
      ).allowed,
    ).toBe(true);
    expect(
      evaluateAudienceScope(
        anyAudience,
        request({ to: MAILING_LIST_ID, toIsMailingListId: true }),
      ).allowed,
    ).toBe(true);
  });

  test("ignores the allowlists entirely when any audience is granted", () => {
    const decision = evaluateAudienceScope(
      scope({
        allowAnyAudience: true,
        allowedMailingListIds: [OTHER_MAILING_LIST_ID],
        allowedRecipientEmails: ["allowed@example.com"],
      }),
      request({ to: MAILING_LIST_ID, toIsMailingListId: true }),
    );
    expect(decision.allowed).toBe(true);
  });

  test("allows an allowlisted mailing list and denies any other", () => {
    const restricted = scope({ allowedMailingListIds: [MAILING_LIST_ID] });
    expect(
      evaluateAudienceScope(
        restricted,
        request({ to: MAILING_LIST_ID, toIsMailingListId: true }),
      ).allowed,
    ).toBe(true);
    const decision = evaluateAudienceScope(
      restricted,
      request({ to: OTHER_MAILING_LIST_ID, toIsMailingListId: true }),
    );
    expect(decision.allowed).toBe(false);
    if (decision.allowed) throw new Error("expected denial");
    expect(decision.message).toContain("that mailing list");
  });

  test("denies individual recipients for a mailing-list-only key", () => {
    const decision = evaluateAudienceScope(
      scope({ allowedMailingListIds: [MAILING_LIST_ID] }),
      request({ to: "someone@example.com" }),
    );
    expect(decision.allowed).toBe(false);
  });

  test("matches allowlisted recipients case-insensitively and trims them", () => {
    const restricted = scope({
      allowedRecipientEmails: ["Allowed@Example.com"],
    });
    expect(
      evaluateAudienceScope(restricted, request({ to: " allowed@example.COM " }))
        .allowed,
    ).toBe(true);
  });

  test("requires every `to` address to be allowlisted", () => {
    const decision = evaluateAudienceScope(
      scope({ allowedRecipientEmails: ["allowed@example.com"] }),
      request({ to: ["allowed@example.com", "stranger@example.com"] }),
    );
    expect(decision.allowed).toBe(false);
    if (decision.allowed) throw new Error("expected denial");
    expect(decision.message).toContain("stranger@example.com");
  });

  test("requires cc/bcc addresses to be allowlisted individuals", () => {
    const restricted = scope({
      allowedMailingListIds: [MAILING_LIST_ID],
      allowedRecipientEmails: ["allowed@example.com"],
    });
    expect(
      evaluateAudienceScope(
        restricted,
        request({
          to: MAILING_LIST_ID,
          toIsMailingListId: true,
          cc: "allowed@example.com",
        }),
      ).allowed,
    ).toBe(true);
    const decision = evaluateAudienceScope(
      restricted,
      request({
        to: MAILING_LIST_ID,
        toIsMailingListId: true,
        bcc: ["stranger@example.com"],
      }),
    );
    expect(decision.allowed).toBe(false);
    if (decision.allowed) throw new Error("expected denial");
    expect(decision.message).toContain("cc/bcc");
  });
});
