// 00014-email-send-log.ts
//
// Adds EMAIL_SEND_LOG: one row per outbound send attempt (every call that
// reaches a mail transport — /api/send, double-opt-in confirmation emails,
// and any other internal send), viewable by admins at /admin/email-send-log.
//
// The log deliberately records NO message content: no subject, body,
// attachments, or addresses. Each row only says when the send was attempted,
// and either when the transport accepted it (delivered_at) or why it failed
// (error_message), plus the delivery metadata needed to make sense of it:
//
// - transport: the transport the send was dispatched through, or NULL when
//   no transport could be resolved at all (e.g. an invalid MAIL_TRANSPORT).
// - status: 'delivered' (the transport accepted the message) or 'failed'.
// - provider_message_id: the message ID the transport reported (e.g. the
//   Resend email ID), for cross-referencing with the provider's own logs.
// - api_key_id: the API key that requested the send; NULL for admin and
//   internal sends. Not a foreign key: log rows are historical records and
//   must never block or cascade with changes to API_KEYS.
//
// Timestamps are BIGINT unix epoch milliseconds, like the other tables.

import { sql } from "@/sql";
import type { Kysely } from "@schemavaults/dbh";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS EMAIL_SEND_LOG (
      email_send_log_id   UUID PRIMARY KEY,
      transport           TEXT,
      status              TEXT NOT NULL CHECK (status IN ('delivered', 'failed')),
      attempted_at        BIGINT NOT NULL,
      delivered_at        BIGINT,
      error_message       TEXT,
      provider_message_id TEXT,
      api_key_id          UUID
    );
  `.execute(db);

  // The admin list reads newest-first, optionally filtered by status.
  await sql`
    CREATE INDEX IF NOT EXISTS idx_email_send_log_attempted_at
      ON EMAIL_SEND_LOG (attempted_at DESC);
  `.execute(db);
  await sql`
    CREATE INDEX IF NOT EXISTS idx_email_send_log_status_attempted_at
      ON EMAIL_SEND_LOG (status, attempted_at DESC);
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP INDEX IF EXISTS idx_email_send_log_status_attempted_at;`.execute(
    db,
  );
  await sql`DROP INDEX IF EXISTS idx_email_send_log_attempted_at;`.execute(db);
  await sql`DROP TABLE IF EXISTS EMAIL_SEND_LOG;`.execute(db);
}
