import "server-only";

import type { Kysely } from "@schemavaults/dbh";
import type { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import type { MailDatabase } from "./mail-database-type";

/**
 * Admin-managed runtime settings for mail transports, stored in the
 * MAIL_TRANSPORT_SETTINGS table. A transport with no row uses the defaults
 * (enabled). Currently only the test-database-transport is toggled through
 * here (from /admin/transports); env vars remain the source of truth for
 * whether a transport is configured at all.
 */
export class MailTransportSettingsRegistry {
  private readonly dbh: ServerlessDatabase;

  private get db(): Kysely<MailDatabase> {
    return this.dbh.db;
  }

  public constructor(dbh: ServerlessDatabase) {
    this.dbh = dbh;
  }

  /** True unless an admin has explicitly disabled the transport. */
  public async isTransportEnabled(transport_id: string): Promise<boolean> {
    const row = await this.db
      .selectFrom("mail_transport_settings")
      .select("enabled")
      .where("transport_id", "=", transport_id)
      .executeTakeFirst();
    return row === undefined ? true : row.enabled;
  }

  public async setTransportEnabled(
    transport_id: string,
    enabled: boolean,
    updated_by_user_id: string,
  ): Promise<void> {
    const updated_at = Date.now();
    await this.db
      .insertInto("mail_transport_settings")
      .values({ transport_id, enabled, updated_at, updated_by_user_id })
      .onConflict((oc) =>
        oc.column("transport_id").doUpdateSet({
          enabled,
          updated_at,
          updated_by_user_id,
        }),
      )
      .execute();
  }
}

export default MailTransportSettingsRegistry;
