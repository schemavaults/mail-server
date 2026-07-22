// 00008-branding-assets.ts
//
// Adds the BRANDING_ASSETS table that stores admin-uploaded white-label
// assets (currently the logo and the favicon). One row per asset kind; the
// binary payload is stored base64-encoded in a TEXT column (uploads are
// size-capped at the API layer) so it round-trips cleanly through the
// serverless Postgres driver. When no row exists for a kind, the app serves
// the bundled default asset instead.

import { sql } from "@/sql";
import type { Kysely } from "@schemavaults/dbh";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS BRANDING_ASSETS (
      asset_kind TEXT PRIMARY KEY,
      content_type TEXT NOT NULL,
      data_base64 TEXT NOT NULL,
      updated_at BIGINT NOT NULL,
      updated_by_user_id TEXT NOT NULL
    );
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TABLE IF EXISTS BRANDING_ASSETS;`.execute(db);
}
