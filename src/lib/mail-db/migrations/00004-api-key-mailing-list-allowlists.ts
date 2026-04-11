// 00004-api-key-mailing-list-allowlists.ts
//
// Adds the API_KEY_MAILING_LIST_ALLOWLISTS join table that scopes individual
// API keys to a fixed set of mailing list audiences. A key with zero rows in
// this table is *unrestricted* (legacy behavior — can send to any recipient
// or mailing list). A key with one or more rows is *restricted* and may only
// send to a mailing list UUID present in its allowlist (raw emails and
// cc/bcc are blocked entirely; enforcement lives in `/api/send`).
//
// Both FKs cascade on delete so revoking a key (hard delete) or removing a
// mailing list automatically clears related rows. The composite primary key
// makes (api_key_id, mailing_list_id) uniquely identifying.

import { sql } from "@/sql";
import type { Kysely } from "@schemavaults/dbh";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS API_KEY_MAILING_LIST_ALLOWLISTS (
      api_key_id      UUID NOT NULL,
      mailing_list_id UUID NOT NULL,
      created_at      BIGINT NOT NULL,
      PRIMARY KEY (api_key_id, mailing_list_id),
      CONSTRAINT fk_allowlist_api_key
        FOREIGN KEY (api_key_id) REFERENCES API_KEYS(api_key_id) ON DELETE CASCADE,
      CONSTRAINT fk_allowlist_mailing_list
        FOREIGN KEY (mailing_list_id) REFERENCES MAILING_LISTS(mailing_list_id) ON DELETE CASCADE
    );
  `.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS idx_allowlist_api_key_id
      ON API_KEY_MAILING_LIST_ALLOWLISTS (api_key_id);
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP INDEX IF EXISTS idx_allowlist_api_key_id;`.execute(db);
  await sql`DROP TABLE IF EXISTS API_KEY_MAILING_LIST_ALLOWLISTS;`.execute(db);
}
