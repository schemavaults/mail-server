import "server-only";

import { handle } from "hono/vercel";
import { createRouteApp } from "@/lib/hono/create-route-app";
import { runWithAdminGuard } from "@/lib/hono/admin-guard";
import { parseJsonBody } from "@/lib/hono/parse-json-body";
import {
  badRequest,
  internalServerError,
  jsonDataMessage,
} from "@/lib/hono/responses";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailTransportSettingsRegistry } from "@/lib/mail-db";
import {
  isMailTransportKind,
  MAIL_TRANSPORT_KINDS,
  TEST_DATABASE_MAIL_TRANSPORT,
} from "@/lib/mail-transport";
import { loadTransportStatuses } from "../load-transport-statuses";
import type { TransportStatus } from "../transport-status-schema";
import { updateTransportBodySchema } from "./update-transport-body-schema";

const app = createRouteApp("/api/admin/transports/:transport_id");

// Enables/disables a transport at runtime. Only the fake-send
// test-database-transport supports this: it is the one transport a
// deployment may want reachable for E2E testing yet locked away from real
// use, so admins get a kill switch that works without a redeploy. The real
// delivery transports (resend, smtp) are governed by env vars alone.
app.patch("/", (c) =>
  runWithAdminGuard(c, async ({ user }) => {
    const transportIdParam = c.req.param("transport_id") ?? "";
    if (!isMailTransportKind(transportIdParam)) {
      return badRequest(
        c,
        `Unknown transport '${transportIdParam}'! Expected one of: ${MAIL_TRANSPORT_KINDS.join(", ")}.`,
      );
    }
    if (transportIdParam !== TEST_DATABASE_MAIL_TRANSPORT) {
      return badRequest(
        c,
        `Only the '${TEST_DATABASE_MAIL_TRANSPORT}' transport can be enabled or disabled from the admin API; '${transportIdParam}' is controlled by environment variables.`,
      );
    }

    const body = await parseJsonBody(c, updateTransportBodySchema, {
      logLabel: "update-transport request body",
    });
    if (!body.ok) return body.response;
    const { enabled } = body.data;

    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const settings = new MailTransportSettingsRegistry(dbh);
      await settings.setTransportEnabled(
        TEST_DATABASE_MAIL_TRANSPORT,
        enabled,
        user.uid,
      );
      const statuses = await loadTransportStatuses(dbh);
      const updated: TransportStatus | undefined = statuses.find(
        (status) => status.id === TEST_DATABASE_MAIL_TRANSPORT,
      );
      if (updated === undefined) {
        throw new Error(
          "Transport status list is missing the test-database transport!",
        );
      }
      return jsonDataMessage(
        c,
        updated,
        enabled
          ? `Enabled the '${TEST_DATABASE_MAIL_TRANSPORT}' mail transport.`
          : `Disabled the '${TEST_DATABASE_MAIL_TRANSPORT}' mail transport.`,
      );
    } catch (e: unknown) {
      console.error(
        `Failed to update the '${TEST_DATABASE_MAIL_TRANSPORT}' transport setting: `,
        e,
      );
      return internalServerError(c, "Failed to update transport setting!");
    }
  }),
);

export const PATCH = handle(app);
