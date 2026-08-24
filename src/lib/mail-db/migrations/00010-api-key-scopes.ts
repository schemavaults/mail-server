// 00010-api-key-scopes.ts
//
// Adds the three per-key scoping tables that restrict what an API key may do
// on `/api/send`, beyond the mailing-list allowlist added in 00004. For each
// table, a key with zero rows is *unrestricted* on that dimension (legacy
// behavior); one or more rows restrict the key to exactly those entries. The
// three dimensions are independent of each other, except that
// API_KEY_RECIPIENT_ALLOWLISTS and API_KEY_MAILING_LIST_ALLOWLISTS together
// form ONE combined audience allowlist: a row in either restricts the key's
// audience as a whole (enforcement lives in `/api/send`).
//
// - API_KEY_ALLOWED_SENDERS: which `from` addresses the key may send as.
//   `sender` is a lowercase email address, or a `*@domain` wildcard matching
//   any local part at that domain. Also constrains `replyTo`.
// - API_KEY_RECIPIENT_ALLOWLISTS: individual (one-off) recipient emails the
//   key may target in to/cc/bcc, stored lowercase.
// - API_KEY_ALLOWED_TRANSPORTS: which configured mail transports ("resend",
//   "smtp") the key may deliver through.
//
// The api_key_id FKs cascade on delete so removing a key clears its rows.

import { sql } from "@/sql";
import type { Kysely } from "@schemavaults/dbh";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS API_KEY_ALLOWED_SENDERS (
      api_key_id UUID NOT NULL,
      sender     TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      PRIMARY KEY (api_key_id, sender),
      CONSTRAINT fk_allowed_senders_api_key
        FOREIGN KEY (api_key_id) REFERENCES API_KEYS(api_key_id) ON DELETE CASCADE
    );
  `.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS idx_allowed_senders_api_key_id
      ON API_KEY_ALLOWED_SENDERS (api_key_id);
  `.execute(db);

  await sql`
    CREATE TABLE IF NOT EXISTS API_KEY_RECIPIENT_ALLOWLISTS (
      api_key_id UUID NOT NULL,
      email      TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      PRIMARY KEY (api_key_id, email),
      CONSTRAINT fk_recipient_allowlist_api_key
        FOREIGN KEY (api_key_id) REFERENCES API_KEYS(api_key_id) ON DELETE CASCADE
    );
  `.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS idx_recipient_allowlist_api_key_id
      ON API_KEY_RECIPIENT_ALLOWLISTS (api_key_id);
  `.execute(db);

  await sql`
    CREATE TABLE IF NOT EXISTS API_KEY_ALLOWED_TRANSPORTS (
      api_key_id   UUID NOT NULL,
      transport_id TEXT NOT NULL,
      created_at   BIGINT NOT NULL,
      PRIMARY KEY (api_key_id, transport_id),
      CONSTRAINT fk_allowed_transports_api_key
        FOREIGN KEY (api_key_id) REFERENCES API_KEYS(api_key_id) ON DELETE CASCADE
    );
  `.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS idx_allowed_transports_api_key_id
      ON API_KEY_ALLOWED_TRANSPORTS (api_key_id);
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP INDEX IF EXISTS idx_allowed_transports_api_key_id;`.execute(db);
  await sql`DROP TABLE IF EXISTS API_KEY_ALLOWED_TRANSPORTS;`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_recipient_allowlist_api_key_id;`.execute(db);
  await sql`DROP TABLE IF EXISTS API_KEY_RECIPIENT_ALLOWLISTS;`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_allowed_senders_api_key_id;`.execute(db);
  await sql`DROP TABLE IF EXISTS API_KEY_ALLOWED_SENDERS;`.execute(db);
}
