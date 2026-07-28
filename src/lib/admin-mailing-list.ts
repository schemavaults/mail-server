// NOTE: These three constants are mirrored (inlined) in
// src/lib/mail-db/migrations/00002-admin-mailing-list.ts. If you change any
// value here, update the migration file too.

// Stable, reserved sentinel UUID for the admin mailing list.
export const ADMIN_MAILING_LIST_ID =
  "00000000-0000-0000-0000-000000000000" as const satisfies string;

const adminMailingListNameEnvVarKey = "ADMIN_MAILING_LIST_NAME" as const;
const adminMailingListDescriptionEnvVarKey = "ADMIN_MAILING_LIST_DESCRIPTION" as const;

const DEFAULT_ADMIN_MAILING_LIST_NAME = "SchemaVaults Admins" as const;
const DEFAULT_ADMIN_MAILING_LIST_DESCRIPTION =
  "Internal SchemaVaults administrator notifications." as const satisfies string;


export function getAdminMailingListName(): string {
  const envVar: string | undefined = process.env[adminMailingListNameEnvVarKey];
  if (typeof envVar === 'string' && envVar.length > 0) {
    return envVar;
  }
  return DEFAULT_ADMIN_MAILING_LIST_NAME;
}

export function getAdminMailingListDescription(): string {
  const envVar: string | undefined = process.env[adminMailingListDescriptionEnvVarKey];
  if (typeof envVar === 'string' && envVar.length > 0) {
    return envVar;
  }
  return DEFAULT_ADMIN_MAILING_LIST_DESCRIPTION;
}
