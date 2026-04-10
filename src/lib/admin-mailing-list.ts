// NOTE: These three constants are mirrored (inlined) in
// src/lib/mail-db/migrations/00002-admin-mailing-list.ts. If you change any
// value here, update the migration file too.

// Stable, reserved sentinel UUID for the SchemaVaults admin mailing list.
export const ADMIN_MAILING_LIST_ID =
  "00000000-0000-0000-0000-000000000000" as const satisfies string;

export const ADMIN_MAILING_LIST_NAME =
  "SchemaVaults Admins" as const satisfies string;

export const ADMIN_MAILING_LIST_DESCRIPTION =
  "Internal SchemaVaults administrator notifications." as const satisfies string;
