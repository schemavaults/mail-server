// 00007-cors-allowed-origins.ts
//
// Adds the CORS_ALLOWED_ORIGINS table that stores the web origins allowed to
// make cross-origin requests against public API routes (e.g. the mailing list
// join endpoint). Origins were previously hardcoded per environment; they are
// now configuration data managed by admins at /admin/cors. An origin is
// stored exactly as browsers send it in the `Origin` header
// (scheme://host[:port], no path or trailing slash).

import { sql } from "@/sql";
import type { Kysely } from "@schemavaults/dbh";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS CORS_ALLOWED_ORIGINS (
      cors_origin_id UUID PRIMARY KEY,
      origin TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at BIGINT NOT NULL,
      created_by_user_id TEXT NOT NULL
    );
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TABLE IF EXISTS CORS_ALLOWED_ORIGINS;`.execute(db);
}
