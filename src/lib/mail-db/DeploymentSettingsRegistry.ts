import "server-only";

import type { Kysely } from "@schemavaults/dbh";
import type { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import type { MailDatabase } from "./mail-database-type";
import {
  DEFAULT_DEPLOYMENT_SETTINGS,
  DEPLOYMENT_SETTINGS_ROW_ID,
  type DeploymentSettings,
} from "./deployment-settings-table";
import { isInvalidParameterValue } from "./is-invalid-parameter-value";
import { sql } from "./sql";

/**
 * Reader/writer for the single-row DEPLOYMENT_SETTINGS table, the
 * deployment-wide settings admins manage at /admin/settings.
 */
export class DeploymentSettingsRegistry {
  private readonly dbh: ServerlessDatabase;

  private get db(): Kysely<MailDatabase> {
    return this.dbh.db;
  }

  public constructor(dbh: ServerlessDatabase) {
    this.dbh = dbh;
  }

  /** The current settings (all defaults until an admin saves some). */
  public async getSettings(): Promise<DeploymentSettings> {
    const row = await this.db
      .selectFrom("deployment_settings")
      .select(["default_time_zone", "updated_at"])
      .where("deployment_settings_id", "=", DEPLOYMENT_SETTINGS_ROW_ID)
      .executeTakeFirst();
    if (row === undefined) return DEFAULT_DEPLOYMENT_SETTINGS;
    // Neon returns BIGINT columns as strings; coerce back to a number.
    const updated_at: number | string = row.updated_at;
    return {
      default_time_zone: row.default_time_zone,
      updated_at:
        typeof updated_at === "number"
          ? updated_at
          : Number.parseInt(updated_at),
    };
  }

  /** Saves the given settings, leaving any omitted setting as it was. */
  public async updateSettings(
    update: Partial<Pick<DeploymentSettings, "default_time_zone">>,
    updated_by_user_id: string,
  ): Promise<DeploymentSettings> {
    const current = await this.getSettings();
    const default_time_zone =
      update.default_time_zone === undefined
        ? current.default_time_zone
        : update.default_time_zone;
    const updated_at = Date.now();
    await this.db
      .insertInto("deployment_settings")
      .values({
        deployment_settings_id: DEPLOYMENT_SETTINGS_ROW_ID,
        default_time_zone,
        updated_at,
        updated_by_user_id,
      })
      .onConflict((oc) =>
        oc.column("deployment_settings_id").doUpdateSet({
          default_time_zone,
          updated_at,
          updated_by_user_id,
        }),
      )
      .execute();
    return { default_time_zone, updated_at };
  }

  /**
   * Whether Postgres knows `timeZone`, so traffic can be grouped by it. Its
   * zone database can lag the browser's, so a name valid in one may not be
   * in the other.
   */
  public async isTimeZoneKnownToDatabase(timeZone: string): Promise<boolean> {
    try {
      await sql`SELECT now() AT TIME ZONE ${timeZone}::text`.execute(this.db);
      return true;
    } catch (e: unknown) {
      if (isInvalidParameterValue(e)) return false;
      throw e;
    }
  }
}

export default DeploymentSettingsRegistry;
