import "server-only";

import { z } from "@/lib/zod-openapi";
import { defineOperation } from "@/lib/api/define-operation";
import { adminAuth } from "@/lib/api/auth-schemes";
import { badRequest, internalError } from "@/lib/api/errors";
import { dataMessageResponse, errorResponses } from "@/lib/api/responses";
import { OPENAPI_TAGS } from "@/lib/api/tags";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailTransportSettingsRegistry } from "@/lib/mail-db";
import { TEST_DATABASE_MAIL_TRANSPORT } from "@/lib/mail-transport";
import { mailTransportKindSchema } from "@/lib/mail-transport/transport-kind-schema";
import { loadTransportStatuses } from "../load-transport-statuses";
import {
  transportStatusSchema,
  type TransportStatus,
} from "../transport-status-schema";
import { updateTransportBodySchema } from "./update-transport-body-schema";

// Enables/disables a transport at runtime. Only the fake-send
// test-database-transport supports this: it is the one transport a
// deployment may want reachable for E2E testing yet locked away from real
// use, so admins get a kill switch that works without a redeploy. The real
// delivery transports (resend, smtp) are governed by env vars alone.
export const updateTransport = defineOperation({
  method: "patch",
  path: "/api/admin/transports/{transport_id}",
  operationId: "updateTransport",
  tags: [OPENAPI_TAGS.adminTransports],
  summary: "Enable or disable the test-database transport",
  description:
    "Toggles a transport's runtime kill switch. Only the fake-send `test-database-transport` supports this — it lets an admin stop fake sending in production without a redeploy. The real delivery transports (`resend`, `smtp`) are controlled by environment variables and reject this call.",
  auth: adminAuth(),
  request: {
    params: z.object({
      transport_id: mailTransportKindSchema.openapi({
        description: "The transport to update.",
        example: TEST_DATABASE_MAIL_TRANSPORT,
      }),
    }),
    body: {
      contentType: "application/json",
      schema: updateTransportBodySchema,
      lenientContentType: true,
    },
  },
  responses: {
    200: dataMessageResponse(
      "The transport's updated status.",
      transportStatusSchema,
    ),
    ...errorResponses({
      400: "Unknown transport, a transport that cannot be toggled, or an invalid request body.",
      500: "Failed to update the transport setting.",
    }),
  },
  handler: async (ctx) => {
    const { transport_id } = ctx.params;
    if (transport_id !== TEST_DATABASE_MAIL_TRANSPORT) {
      throw badRequest(
        `Only the '${TEST_DATABASE_MAIL_TRANSPORT}' transport can be enabled or disabled from the admin API; '${transport_id}' is controlled by environment variables.`,
        "transport_not_toggleable",
      );
    }
    const { enabled } = ctx.body;

    let updated: TransportStatus | undefined;
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const settings = new MailTransportSettingsRegistry(dbh);
      await settings.setTransportEnabled(
        TEST_DATABASE_MAIL_TRANSPORT,
        enabled,
        ctx.auth.user.uid,
      );
      const statuses = await loadTransportStatuses(dbh);
      updated = statuses.find(
        (status) => status.id === TEST_DATABASE_MAIL_TRANSPORT,
      );
      if (updated === undefined) {
        throw new Error(
          "Transport status list is missing the test-database transport!",
        );
      }
    } catch (e: unknown) {
      console.error(
        `Failed to update the '${TEST_DATABASE_MAIL_TRANSPORT}' transport setting: `,
        e,
      );
      throw internalError("Failed to update transport setting!");
    }

    return ctx.json(200, {
      success: true,
      data: updated,
      message: enabled
        ? `Enabled the '${TEST_DATABASE_MAIL_TRANSPORT}' mail transport.`
        : `Disabled the '${TEST_DATABASE_MAIL_TRANSPORT}' mail transport.`,
    });
  },
});
