// 00006-unique-subscriber-per-mailing-list.ts
//
// Enforces, at the database level, that an email address may only be
// subscribed to a given mailing list once. Comparison is case-insensitive
// (matches the dedup behavior in /api/send). Any pre-existing duplicate
// rows are removed first, keeping the row with the smallest subscribe_time
// (with ctid as a tie-breaker for identical timestamps).

import { sql } from "@/sql";
import type { Kysely } from "@schemavaults/dbh";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    DELETE FROM SUBSCRIBERS s1
    USING SUBSCRIBERS s2
    WHERE s1.mailing_list_id = s2.mailing_list_id
      AND LOWER(s1.email) = LOWER(s2.email)
      AND (
        s1.subscribe_time > s2.subscribe_time
        OR (s1.subscribe_time = s2.subscribe_time AND s1.ctid > s2.ctid)
      );
  `.execute(db);

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS subscribers_mailing_list_email_lower_unique
      ON SUBSCRIBERS (mailing_list_id, LOWER(email));
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP INDEX IF EXISTS subscribers_mailing_list_email_lower_unique;`.execute(
    db,
  );
}
