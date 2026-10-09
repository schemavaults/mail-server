// 00013-test-email-attachments.ts
//
// Adds TEST_EMAIL_ATTACHMENTS, which stores the file attachments of emails
// "sent" through the fake-send `test-database-transport` (one row per
// attachment of a TEST_EMAILS row), so E2E tests can verify that
// attachments survive the whole /api/send flow byte for byte.
//
// Attachments live in their own table rather than in a TEST_EMAILS column
// because they are large (up to 25 MiB per email once decoded): the list
// endpoint reads only the metadata columns here, and the content is read
// only when a single email is fetched by ID.
//
// - attachment_index: the attachment's position in the send request's
//   `attachments` array, so they read back in the order they were sent.
// - content_type / content_id: exactly as the sender passed them (NULL when
//   omitted); the real transports derive a missing content type from the
//   filename, but this table records what the transport was handed.
// - size_bytes: decoded size of the content.
// - content_base64: the bytes, base64-encoded in a TEXT column so they
//   round-trip cleanly through the serverless Postgres driver.
//
// The test_email_id FK cascades on delete so removing a test email clears
// its attachments.

import { sql } from "@/sql";
import type { Kysely } from "@schemavaults/dbh";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS TEST_EMAIL_ATTACHMENTS (
      test_email_id    UUID NOT NULL,
      attachment_index INTEGER NOT NULL,
      filename         TEXT NOT NULL,
      content_type     TEXT,
      content_id       TEXT,
      size_bytes       INTEGER NOT NULL,
      content_base64   TEXT NOT NULL,
      PRIMARY KEY (test_email_id, attachment_index),
      CONSTRAINT fk_test_email_attachments_test_email
        FOREIGN KEY (test_email_id) REFERENCES TEST_EMAILS(test_email_id) ON DELETE CASCADE
    );
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TABLE IF EXISTS TEST_EMAIL_ATTACHMENTS;`.execute(db);
}
