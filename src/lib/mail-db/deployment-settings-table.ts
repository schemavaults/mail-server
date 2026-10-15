import { z } from "@/lib/zod-openapi";
import { ianaTimeZoneSchema } from "@/lib/time-zone";

/** The fixed primary key of the single DEPLOYMENT_SETTINGS row. */
export const DEPLOYMENT_SETTINGS_ROW_ID = 1;

/**
 * Kysely row type for the DEPLOYMENT_SETTINGS table: deployment-wide
 * settings admins manage at /admin/settings, kept in a single row (id 1).
 * No row means every setting is at its default. DeploymentSettingsRegistry
 * is the only reader/writer.
 */
export interface DeploymentSettingsTable {
  deployment_settings_id: number;
  /**
   * IANA time zone the admin pages show times in and group email traffic
   * by; null = each viewer's own browser time zone.
   */
  default_time_zone: string | null;
  updated_at: number;
  updated_by_user_id: string;
}

export const deploymentSettingsSchema = z
  .object({
    default_time_zone: ianaTimeZoneSchema.nullable().openapi({
      description:
        "IANA time zone the admin pages show times in and group email traffic by (e.g. `America/New_York`), or null to use each viewer's browser time zone.",
      example: "America/New_York",
    }),
    updated_at: z.number().nonnegative().nullable().openapi({
      description:
        "Unix epoch milliseconds when an admin last changed the settings, or null if they never have.",
    }),
  })
  .openapi("DeploymentSettings", {
    description: "Deployment-wide settings managed at /admin/settings.",
  });

export type DeploymentSettings = z.infer<typeof deploymentSettingsSchema>;

/** The settings of a deployment no admin has configured yet. */
export const DEFAULT_DEPLOYMENT_SETTINGS: DeploymentSettings = {
  default_time_zone: null,
  updated_at: null,
};
