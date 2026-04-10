import "server-only";

import type { NextRequest } from "next/server";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailKeysRegistry } from "@/lib/mail-db/MailKeysRegistry";
import type { ApiKeyRecord } from "@/lib/mail-db/api-keys-table";
import { extractBearerToken } from "./extractBearerToken";
import { API_KEY_PREFIX } from "./API_KEY_PREFIX";

export type ValidateApiKeyResult =
  | { valid: true; record: ApiKeyRecord }
  | { valid: false };

/**
 * True iff the request's `Authorization: Bearer <token>` header carries
 * something that looks like a SchemaVaults Mail Server API key. This is a
 * cheap pre-check used by routes that accept *either* an API key or an admin
 * JWT — we only want to enter the API-key code path when the caller is
 * actually presenting an API key.
 */
export function requestLooksLikeApiKeyAuth(req: NextRequest): boolean {
  const token = extractBearerToken(req);
  return token !== null && token.startsWith(API_KEY_PREFIX);
}

/**
 * Looks up the bearer token from the request as an API key. Returns
 * `{ valid: false }` for any failure (missing header, malformed token,
 * unknown key, revoked key). On success, fires a non-blocking
 * `touchLastUsed` update so admins can see when keys are actively used.
 */
export async function validateApiKeyFromRequest(
  req: NextRequest,
): Promise<ValidateApiKeyResult> {
  const token = extractBearerToken(req);
  if (!token || !token.startsWith(API_KEY_PREFIX)) {
    return { valid: false };
  }

  let record: ApiKeyRecord | null;
  {
    await using dbh = ServerlessDatabase.getAsyncResource();
    const registry = new MailKeysRegistry(dbh);
    try {
      record = await registry.findActiveByPlaintext(token);
    } catch (e: unknown) {
      console.error("Failed to look up API key in database: ", e);
      return { valid: false };
    }
  }

  if (!record) {
    return { valid: false };
  }

  // Best-effort last-used update; do NOT block the request on this.
  // Use a fresh ServerlessDatabase since the lookup's resource has been
  // disposed by the time we get here.
  const apiKeyId = record.api_key_id;
  void (async () => {
    try {
      await using dbh2 = ServerlessDatabase.getAsyncResource();
      const registry2 = new MailKeysRegistry(dbh2);
      await registry2.touchLastUsed(apiKeyId);
    } catch (e: unknown) {
      console.error(
        `Failed to update last_used_at for API key ${apiKeyId}: `,
        e,
      );
    }
  })();

  return { valid: true, record };
}

export default validateApiKeyFromRequest;
