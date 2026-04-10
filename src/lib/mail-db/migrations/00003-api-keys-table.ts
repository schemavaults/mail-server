// 00003-api-keys-table.ts
//
// Adds the API_KEYS table that stores hashed API keys used to authenticate
// programmatic callers of /api/send (in addition to the existing admin JWT
// path). Plaintext keys are NEVER persisted — only a SHA-256 hex digest in
// `key_hash`. The `key_prefix` column stores the first ~20 chars of the
// plaintext so the admin UI can identify a key without seeing the secret.

import { sql } from "@/sql";
import type { Kysely } from "@schemavaults/dbh";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS API_KEYS (
      api_key_id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      key_hash TEXT NOT NULL UNIQUE,
      key_prefix TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      created_by_user_id TEXT NOT NULL,
      last_used_at BIGINT,
      revoked_at BIGINT
    );
  `.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON API_KEYS (key_hash);
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP INDEX IF EXISTS idx_api_keys_key_hash;`.execute(db);
  await sql`DROP TABLE IF EXISTS API_KEYS;`.execute(db);
}
