// 00012-test-emails-and-transport-settings.ts
//
// Adds the two tables behind the fake-send `test-database-transport`:
//
// TEST_EMAILS stores every email "sent" through the test-database transport
// instead of delivering it. One row per send; the recipient list columns
// (to/cc/bcc/replyTo) hold JSON-encoded string arrays in TEXT columns (empty
// array = '[]') so they round-trip cleanly through the serverless Postgres
// driver. Rows are read back via GET /api/test-emails[/:test_email_id] so
// E2E tests can verify the full /api/send flow without any real SMTP/Resend
// delivery in the loop.
//
// MAIL_TRANSPORT_SETTINGS stores admin-managed runtime transport settings,
// keyed by transport id. A transport with no row uses the defaults
// (enabled = TRUE). Currently its only use is the kill switch that lets an
// admin disable the test-database transport from /admin/transports, so a
// deployment that shipped with TEST_DATABASE_MAIL_TRANSPORT_ENABLED set by
// mistake can be locked down without a redeploy.

import { sql } from "@/sql";
import type { Kysely } from "@schemavaults/dbh";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS TEST_EMAILS (
      test_email_id UUID PRIMARY KEY,
      from_address TEXT NOT NULL,
      to_addresses TEXT NOT NULL,
      cc_addresses TEXT NOT NULL DEFAULT '[]',
      bcc_addresses TEXT NOT NULL DEFAULT '[]',
      reply_to_addresses TEXT NOT NULL DEFAULT '[]',
      subject TEXT NOT NULL,
      html TEXT,
      text TEXT,
      created_at BIGINT NOT NULL
    );
  `.execute(db);

  // The list endpoint reads newest-first.
  await sql`
    CREATE INDEX IF NOT EXISTS idx_test_emails_created_at
      ON TEST_EMAILS (created_at DESC);
  `.execute(db);

  await sql`
    CREATE TABLE IF NOT EXISTS MAIL_TRANSPORT_SETTINGS (
      transport_id TEXT PRIMARY KEY,
      enabled BOOLEAN NOT NULL,
      updated_at BIGINT NOT NULL,
      updated_by_user_id TEXT NOT NULL
    );
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TABLE IF EXISTS MAIL_TRANSPORT_SETTINGS;`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_test_emails_created_at;`.execute(db);
  await sql`DROP TABLE IF EXISTS TEST_EMAILS;`.execute(db);
}
