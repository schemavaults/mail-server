/**
 * Kysely row type for the MAIL_TRANSPORT_SETTINGS table: admin-managed
 * runtime settings for mail transports, keyed by transport id. A transport
 * with no row uses the defaults (enabled). Currently the only setting is the
 * enable/disable kill switch used by the test-database-transport so admins
 * can shut off fake sending from /admin/transports without a redeploy.
 */
export interface MailTransportSettingsTable {
  transport_id: string;
  enabled: boolean;
  updated_at: number;
  updated_by_user_id: string;
}

export type MailTransportSetting = MailTransportSettingsTable;
