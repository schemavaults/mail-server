// Audience scope evaluation for API-key authenticated `/api/send` calls.
//
// Shared by the /api/send enforcement path and the /admin/keys view (for the
// "what can this key reach?" summary labels) — deliberately NOT server-only,
// and deliberately free of any DB or request types so it stays unit-testable.
//
// An API key's audience is governed by ONE explicit switch plus ONE combined
// allowlist:
//
//   allowAnyAudience = true   -> the key may send to any recipient; the
//                               allowlists below are not consulted.
//   allowAnyAudience = false  -> the key may only reach its allowlisted
//                               mailing lists and individual recipients. A
//                               key with no entries at all can reach nobody,
//                               which is the default for new keys.

/** One API key's audience configuration, as stored. */
export interface ApiKeyAudienceScope {
  /** Explicit "may send to anyone" switch (API_KEYS.allow_any_audience). */
  allowAnyAudience: boolean;
  /** Mailing list UUIDs the key may pass in `to`. */
  allowedMailingListIds: readonly string[];
  /** Individual addresses the key may pass in to/cc/bcc. */
  allowedRecipientEmails: readonly string[];
}

/** The audience a single `/api/send` request is asking to reach. */
export interface RequestedAudience {
  /**
   * The request's `to` value: either a single mailing list UUID (when
   * `toIsMailingListId` is true) or one or more individual addresses.
   */
  to: string | string[];
  toIsMailingListId: boolean;
  cc: string | string[] | undefined;
  bcc: string | string[] | undefined;
}

export type AudienceScopeDecision =
  | { allowed: true }
  | { allowed: false; message: string };

const ALLOWED: AudienceScopeDecision = { allowed: true };

function denied(message: string): AudienceScopeDecision {
  return { allowed: false, message };
}

/** Flattens an optional cc/bcc value into a list of addresses. */
export function toAddressList(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * True iff the key has no way to reach anyone: it is not allowed to send to
 * any audience and has no allowlist entries. Newly created keys start here
 * until an admin configures their audience.
 */
export function hasNoAudienceAccess(scope: ApiKeyAudienceScope): boolean {
  return (
    !scope.allowAnyAudience &&
    scope.allowedMailingListIds.length === 0 &&
    scope.allowedRecipientEmails.length === 0
  );
}

/**
 * Decides whether an API key may send to the audience a request asks for.
 * Returns a message suitable for a 403 body when it may not.
 */
export function evaluateAudienceScope(
  scope: ApiKeyAudienceScope,
  requested: RequestedAudience,
): AudienceScopeDecision {
  if (scope.allowAnyAudience) return ALLOWED;

  if (hasNoAudienceAccess(scope)) {
    return denied(
      "This API key has no audience configured, so it may not send to any recipient. An admin must allowlist a mailing list or recipient address for this key, or grant it access to any recipient.",
    );
  }

  const allowedRecipients = new Set<string>(
    scope.allowedRecipientEmails.map((email) => email.trim().toLowerCase()),
  );

  // cc/bcc addresses must all be allowlisted individuals.
  const copiedAddresses: string[] = [
    ...toAddressList(requested.cc),
    ...toAddressList(requested.bcc),
  ];
  for (const address of copiedAddresses) {
    if (!allowedRecipients.has(address.trim().toLowerCase())) {
      return denied(`This API key is not permitted to cc/bcc '${address}'.`);
    }
  }

  if (requested.toIsMailingListId) {
    // `to` is a mailing list: it must be in the allowlist.
    const mailingListId: string = requested.to as string;
    if (!scope.allowedMailingListIds.includes(mailingListId)) {
      return denied(
        "This API key is not permitted to send to that mailing list.",
      );
    }
    return ALLOWED;
  }

  // `to` is one or more individual addresses: all must be allowlisted.
  const toAddresses: string[] = Array.isArray(requested.to)
    ? requested.to
    : [requested.to];
  for (const address of toAddresses) {
    if (!allowedRecipients.has(address.trim().toLowerCase())) {
      return denied(`This API key is not permitted to send to '${address}'.`);
    }
  }
  return ALLOWED;
}
