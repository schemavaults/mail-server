// 00009-seed-admin-mailing-list-from-env.ts
//
// The admin mailing list row seeded by 00002 used hardcoded name/description
// values. The name and description are now configurable via the
// ADMIN_MAILING_LIST_NAME / ADMIN_MAILING_LIST_DESCRIPTION environment
// variables (see src/lib/admin-mailing-list.ts). This migration reconciles an
// already-seeded row with those env vars: if the admin mailing list row exists,
// its name/description are updated to the currently-configured values.
//
// NOTE: The constants and env-var fallback logic below are intentionally
// inlined and MUST stay in sync with src/lib/admin-mailing-list.ts. They are
// duplicated here so this migration file has no project-relative imports and
// bundles cleanly via `bun run build:migrations`.

import { sql } from "@/sql";
import type { Kysely } from "@schemavaults/dbh";

const ADMIN_MAILING_LIST_ID = "00000000-0000-0000-0000-000000000000";

const DEFAULT_ADMIN_MAILING_LIST_NAME = "SchemaVaults Admins";
const DEFAULT_ADMIN_MAILING_LIST_DESCRIPTION =
  "Internal SchemaVaults administrator notifications.";

function getAdminMailingListName(): string {
  const envVar: string | undefined = process.env.ADMIN_MAILING_LIST_NAME;
  if (typeof envVar === "string" && envVar.length > 0) {
    return envVar;
  }
  return DEFAULT_ADMIN_MAILING_LIST_NAME;
}

function getAdminMailingListDescription(): string {
  const envVar: string | undefined = process.env.ADMIN_MAILING_LIST_DESCRIPTION;
  if (typeof envVar === "string" && envVar.length > 0) {
    return envVar;
  }
  return DEFAULT_ADMIN_MAILING_LIST_DESCRIPTION;
}

export async function up(db: Kysely<any>): Promise<void> {
  const name = getAdminMailingListName();
  const description = getAdminMailingListDescription();
  await sql`
    UPDATE MAILING_LISTS
    SET name = ${name}, description = ${description}
    WHERE mailing_list_id = ${ADMIN_MAILING_LIST_ID}::uuid;
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Revert to the original hardcoded values seeded by 00002.
  await sql`
    UPDATE MAILING_LISTS
    SET name = ${DEFAULT_ADMIN_MAILING_LIST_NAME},
        description = ${DEFAULT_ADMIN_MAILING_LIST_DESCRIPTION}
    WHERE mailing_list_id = ${ADMIN_MAILING_LIST_ID}::uuid;
  `.execute(db);
}
