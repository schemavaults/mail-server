import { z } from "@/lib/zod-openapi";
import { ianaTimeZoneSchema } from "@/lib/time-zone";

/**
 * Body of PATCH /api/admin/settings: the settings to change. An omitted
 * setting keeps its current value; null resets one to its default.
 * Client-safe, so the /admin/settings page validates with the same schema.
 */
export const updateDeploymentSettingsBodySchema = z
  .object({
    default_time_zone: ianaTimeZoneSchema.nullable().optional().openapi({
      description:
        "IANA time zone for the admin pages' times and email traffic grouping, e.g. `America/New_York`; null resets it to each viewer's browser time zone.",
      example: "America/New_York",
    }),
  })
  .openapi("UpdateDeploymentSettingsRequestBody");

export type UpdateDeploymentSettingsRequestBody = z.infer<
  typeof updateDeploymentSettingsBodySchema
>;
