// 00002-admin-mailing-list.ts
//
// NOTE: The three constants below are intentionally inlined and MUST stay in
// sync with src/lib/admin-mailing-list.ts. They are duplicated here so this
// migration file has no project-relative imports and bundles cleanly via
// `bun run build:migrations`.

import { sql } from "@/sql";
import type { Kysely } from "@schemavaults/dbh";

const ADMIN_MAILING_LIST_ID = "00000000-0000-0000-0000-000000000000";
const ADMIN_MAILING_LIST_NAME = "SchemaVaults Admins";
const ADMIN_MAILING_LIST_DESCRIPTION =
  "Internal SchemaVaults administrator notifications.";

export async function up(db: Kysely<any>): Promise<void> {
  const created_at = Date.now();
  await sql`
    INSERT INTO MAILING_LISTS (mailing_list_id, name, description, public, created_at)
    VALUES (
      ${ADMIN_MAILING_LIST_ID}::uuid,
      ${ADMIN_MAILING_LIST_NAME},
      ${ADMIN_MAILING_LIST_DESCRIPTION},
      FALSE,
      ${created_at}
    )
    ON CONFLICT (mailing_list_id) DO NOTHING;
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // subscribers/unsubscribe_records cascade via FK (see 00001)
  await sql`
    DELETE FROM MAILING_LISTS
    WHERE mailing_list_id = ${ADMIN_MAILING_LIST_ID}::uuid;
  `.execute(db);
}
