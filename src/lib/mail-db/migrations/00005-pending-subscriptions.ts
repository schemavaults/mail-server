// 00005-pending-subscriptions.ts
//
// Adds the PENDING_SUBSCRIPTIONS table, which records mailing-list
// subscription requests that are awaiting double opt-in confirmation. Only
// once the subscriber clicks the confirmation link from their email does
// the row in this table get marked confirmed and a corresponding row
// inserted into SUBSCRIBERS. Plaintext tokens are NEVER persisted — only a
// SHA-256 hex digest in `token_hash`.

import { sql } from "@/sql";
import type { Kysely } from "@schemavaults/dbh";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS PENDING_SUBSCRIPTIONS (
      pending_subscription_id UUID PRIMARY KEY,
      mailing_list_id UUID NOT NULL REFERENCES MAILING_LISTS(mailing_list_id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      created_at BIGINT NOT NULL,
      expires_at BIGINT NOT NULL,
      confirmed_at BIGINT
    );
  `.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS idx_pending_subscriptions_token_hash
      ON PENDING_SUBSCRIPTIONS (token_hash);
  `.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS idx_pending_subscriptions_list_email
      ON PENDING_SUBSCRIPTIONS (mailing_list_id, email);
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP INDEX IF EXISTS idx_pending_subscriptions_list_email;`.execute(
    db,
  );
  await sql`DROP INDEX IF EXISTS idx_pending_subscriptions_token_hash;`.execute(
    db,
  );
  await sql`DROP TABLE IF EXISTS PENDING_SUBSCRIPTIONS;`.execute(db);
}
