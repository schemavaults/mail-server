import "server-only";

import { defineOperation } from "@/lib/api/define-operation";
import { adminAuth } from "@/lib/api/auth-schemes";
import { badRequest, internalError } from "@/lib/api/errors";
import {
  dataMessageResponse,
  dataResponse,
  errorResponses,
} from "@/lib/api/responses";
import { OPENAPI_TAGS } from "@/lib/api/tags";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import {
  DeploymentSettingsRegistry,
  type DeploymentSettings,
} from "@/lib/mail-db";
import { deploymentSettingsSchema } from "@/lib/mail-db/deployment-settings-table";
import { updateDeploymentSettingsBodySchema } from "./update-settings-body-schema";

export const getDeploymentSettings = defineOperation({
  method: "get",
  path: "/api/admin/settings",
  operationId: "getDeploymentSettings",
  tags: [OPENAPI_TAGS.adminSettings],
  summary: "Read the deployment settings",
  auth: adminAuth(),
  responses: {
    200: dataResponse("The deployment settings.", deploymentSettingsSchema),
    ...errorResponses({
      500: "Failed to load the deployment settings.",
    }),
  },
  handler: async (ctx) => {
    let settings: DeploymentSettings;
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      settings = await new DeploymentSettingsRegistry(dbh).getSettings();
    } catch (e: unknown) {
      console.error("Failed to load the deployment settings: ", e);
      throw internalError("Failed to load the deployment settings!");
    }
    return ctx.json(200, { success: true, data: settings });
  },
});

// Changes deployment-wide settings. Currently the default time zone, which
// the admin pages show times in and /admin/email-traffic groups traffic by.
export const updateDeploymentSettings = defineOperation({
  method: "patch",
  path: "/api/admin/settings",
  operationId: "updateDeploymentSettings",
  tags: [OPENAPI_TAGS.adminSettings],
  summary: "Change the deployment settings",
  description:
    "Changes the given deployment settings; omitted settings keep their values. `default_time_zone` sets the IANA time zone the admin pages show times in and email traffic is grouped by (null = each viewer's browser time zone); it must be known to both the runtime and the database.",
  auth: adminAuth(),
  request: {
    body: {
      contentType: "application/json",
      schema: updateDeploymentSettingsBodySchema,
      lenientContentType: true,
    },
  },
  responses: {
    200: dataMessageResponse(
      "The updated deployment settings.",
      deploymentSettingsSchema,
    ),
    ...errorResponses({
      400: "No setting to change, or a time zone the database does not know.",
      500: "Failed to save the deployment settings.",
    }),
  },
  handler: async (ctx) => {
    const { default_time_zone } = ctx.body;
    if (default_time_zone === undefined) {
      throw badRequest("No settings to update.", "nothing_to_update");
    }

    let settings: DeploymentSettings | null;
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new DeploymentSettingsRegistry(dbh);
      // Traffic is grouped by this zone in SQL, so Postgres must know it.
      settings =
        default_time_zone !== null &&
        !(await registry.isTimeZoneKnownToDatabase(default_time_zone))
          ? null
          : await registry.updateSettings(
              { default_time_zone },
              ctx.auth.user.uid,
            );
    } catch (e: unknown) {
      console.error("Failed to save the deployment settings: ", e);
      throw internalError("Failed to save the deployment settings!");
    }
    if (settings === null) {
      throw badRequest(
        `The database does not recognise the time zone '${default_time_zone}'.`,
        "invalid_timezone",
      );
    }

    return ctx.json(200, {
      success: true,
      data: settings,
      message:
        settings.default_time_zone === null
          ? "Times are now shown in each viewer's browser time zone."
          : `Times are now shown in ${settings.default_time_zone}.`,
    });
  },
});
