// 00015-deployment-settings.ts
//
// Adds DEPLOYMENT_SETTINGS: deployment-wide settings admins manage at
// /admin/settings, kept in a single row (deployment_settings_id = 1, which
// the CHECK enforces). With no row, every setting is at its default. New
// settings are added as new nullable columns.
//
// - default_time_zone: the IANA time zone the admin pages show times in and
//   group email traffic by (e.g. 'America/New_York'). NULL = each viewer's
//   own browser time zone, which is how every page behaved before this
//   setting existed.
//
// Timestamps are BIGINT unix epoch milliseconds, like the other tables.

import { sql } from "@/sql";
import type { Kysely } from "@schemavaults/dbh";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS DEPLOYMENT_SETTINGS (
      deployment_settings_id SMALLINT PRIMARY KEY
        CHECK (deployment_settings_id = 1),
      default_time_zone      TEXT,
      updated_at             BIGINT NOT NULL,
      updated_by_user_id     TEXT NOT NULL
    );
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TABLE IF EXISTS DEPLOYMENT_SETTINGS;`.execute(db);
}
