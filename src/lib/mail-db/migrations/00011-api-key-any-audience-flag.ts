// 00011-api-key-any-audience-flag.ts
//
// Makes "this API key may send to ANY recipient" an explicit, opt-in setting
// instead of an implicit consequence of leaving the audience allowlist empty.
//
// Before this migration, a key with zero rows in
// API_KEY_MAILING_LIST_ALLOWLISTS and API_KEY_RECIPIENT_ALLOWLISTS was
// *unrestricted*: it could send to any address. That made the most permissive
// configuration also the default one, and invisible in the admin UI. After
// this migration the audience dimension is driven by a new
// API_KEYS.allow_any_audience column:
//
//   allow_any_audience = TRUE  -> the key may send to any recipient; the
//                                 audience allowlist tables are ignored.
//   allow_any_audience = FALSE -> the key may only send to its allowlisted
//                                 mailing lists / recipient addresses. With
//                                 zero allowlist entries it may send to
//                                 nobody (a newly created key's default).
//
// Grandfathering: keys that exist when this migration runs and have NO
// audience allowlist entries were unrestricted under the old rules, so they
// are flipped to allow_any_audience = TRUE and keep working until an admin
// restricts them. Keys that already carry allowlist entries were restricted
// before and stay restricted (FALSE), so no key's effective audience widens.
//
// The column default is FALSE, so every key created after this migration
// starts with no audience access until it is explicitly configured.

import { sql } from "@/sql";
import type { Kysely } from "@schemavaults/dbh";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    ALTER TABLE API_KEYS
      ADD COLUMN IF NOT EXISTS allow_any_audience BOOLEAN NOT NULL DEFAULT FALSE;
  `.execute(db);

  // Grandfather in pre-existing keys that were unrestricted under the old
  // "empty allowlist = any recipient" rules.
  await sql`
    UPDATE API_KEYS
      SET allow_any_audience = TRUE
      WHERE allow_any_audience = FALSE
        AND NOT EXISTS (
          SELECT 1 FROM API_KEY_MAILING_LIST_ALLOWLISTS
            WHERE API_KEY_MAILING_LIST_ALLOWLISTS.api_key_id = API_KEYS.api_key_id
        )
        AND NOT EXISTS (
          SELECT 1 FROM API_KEY_RECIPIENT_ALLOWLISTS
            WHERE API_KEY_RECIPIENT_ALLOWLISTS.api_key_id = API_KEYS.api_key_id
        );
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`
    ALTER TABLE API_KEYS
      DROP COLUMN IF EXISTS allow_any_audience;
  `.execute(db);
}
