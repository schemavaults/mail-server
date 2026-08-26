import "server-only";

import type { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailTransportSettingsRegistry } from "@/lib/mail-db";
import {
  loadMailTransportsAvailability,
  MAIL_TRANSPORT_KINDS,
  TEST_DATABASE_MAIL_TRANSPORT,
} from "@/lib/mail-transport";
import type { TransportStatus } from "./transport-status-schema";

/**
 * Builds the transport status rows shown by GET /api/admin/transports and
 * the /admin/transports page: env-driven configured/default state plus the
 * admin-managed runtime enable switch. Only the test-database-transport can
 * be admin-disabled, so only its setting is looked up; every other
 * transport reports `enabled: true`.
 *
 * @throws {MailTransportConfigError} when MAIL_TRANSPORT names an unknown
 * transport kind (propagated from loadMailTransportsAvailability).
 */
export async function loadTransportStatuses(
  dbh: ServerlessDatabase,
  env: Record<string, string | undefined> = process.env,
): Promise<TransportStatus[]> {
  const availability = loadMailTransportsAvailability(env);
  const settings = new MailTransportSettingsRegistry(dbh);
  const testDatabaseTransportEnabled = await settings.isTransportEnabled(
    TEST_DATABASE_MAIL_TRANSPORT,
  );
  return MAIL_TRANSPORT_KINDS.map((id) => ({
    id,
    configured: availability.configured.includes(id),
    is_default: availability.defaultTransport === id,
    enabled:
      id === TEST_DATABASE_MAIL_TRANSPORT
        ? testDatabaseTransportEnabled
        : true,
  }));
}

export default loadTransportStatuses;
