import "server-only";

import type { Context } from "hono";
import type { ApiKeyOrAdminAuthContext } from "@/lib/hono/admin-guard";
import { forbidden, internalServerError } from "@/lib/hono/responses";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailKeysRegistry } from "@/lib/mail-db/MailKeysRegistry";
import { TEST_DATABASE_MAIL_TRANSPORT } from "@/lib/mail-transport";

/**
 * Authorization shared by the /api/test-emails read endpoints. Admin JWT
 * callers may always read. API-key callers may read only when their
 * transport scope permits the test-database transport — the same rule
 * /api/send applies to sending through it (zero transport-scope entries =
 * unrestricted). Returns null when access is granted, or the error response
 * to send otherwise.
 */
export async function checkTestEmailsAccess(
  c: Context,
  auth: ApiKeyOrAdminAuthContext,
): Promise<Response | null> {
  if (auth.apiKeyId === null) return null;

  let allowedTransportIds: readonly string[];
  try {
    await using dbh = ServerlessDatabase.getAsyncResource();
    const registry = new MailKeysRegistry(dbh);
    allowedTransportIds = await registry.listAllowedTransportIds(
      auth.apiKeyId,
    );
  } catch (e: unknown) {
    console.error(
      `Failed to load transport scope for API key '${auth.apiKeyId}': `,
      e,
    );
    return internalServerError(c, "Failed to check API key scope!");
  }

  if (
    allowedTransportIds.length > 0 &&
    !allowedTransportIds.includes(TEST_DATABASE_MAIL_TRANSPORT)
  ) {
    return forbidden(
      c,
      `This API key is not permitted to use the '${TEST_DATABASE_MAIL_TRANSPORT}' mail transport.`,
    );
  }

  return null;
}

export default checkTestEmailsAccess;
