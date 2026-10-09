import "server-only";

import { forbidden, internalError } from "@/lib/api/errors";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailKeysRegistry } from "@/lib/mail-db/MailKeysRegistry";
import { TEST_DATABASE_MAIL_TRANSPORT } from "@/lib/mail-transport";

/** Who may read test emails; shared by the /api/test-emails operations. */
export const TEST_EMAILS_ACCESS_NOTES =
  "Admins may always read. API keys may read only when their transport scope permits the test-database transport (zero transport-scope entries = unrestricted), the same rule /api/send applies to sending through it.";

/**
 * Authorization shared by the /api/test-emails read endpoints. Admin access
 * token callers (`apiKeyId === null`) may always read. API-key callers may
 * read only when their transport scope permits the test-database transport
 * — the same rule /api/send applies to sending through it (zero
 * transport-scope entries = unrestricted). Throws the 403 / 500 to answer
 * with when access is not granted.
 */
export async function assertTestEmailsAccess(
  apiKeyId: string | null,
): Promise<void> {
  if (apiKeyId === null) return;

  let allowedTransportIds: readonly string[];
  try {
    await using dbh = ServerlessDatabase.getAsyncResource();
    const registry = new MailKeysRegistry(dbh);
    allowedTransportIds = await registry.listAllowedTransportIds(apiKeyId);
  } catch (e: unknown) {
    console.error(
      `Failed to load transport scope for API key '${apiKeyId}': `,
      e,
    );
    throw internalError("Failed to check API key scope!");
  }

  if (
    allowedTransportIds.length > 0 &&
    !allowedTransportIds.includes(TEST_DATABASE_MAIL_TRANSPORT)
  ) {
    throw forbidden(
      `This API key is not permitted to use the '${TEST_DATABASE_MAIL_TRANSPORT}' mail transport.`,
      "transport_not_permitted",
    );
  }
}

export default assertTestEmailsAccess;
