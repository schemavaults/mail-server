import "server-only";

import { handle } from "hono/vercel";
import { createRouteApp } from "@/lib/hono/create-route-app";
import { runWithAdminGuard } from "@/lib/hono/admin-guard";
import { internalServerError, jsonData } from "@/lib/hono/responses";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { loadTransportStatuses } from "./load-transport-statuses";
import type { TransportStatus } from "./transport-status-schema";

export type { TransportStatus } from "./transport-status-schema";

const app = createRouteApp("/api/admin/transports");

app.get("/", (c) =>
  runWithAdminGuard(c, async () => {
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const data: TransportStatus[] = await loadTransportStatuses(dbh);
      return jsonData(c, data);
    } catch (e: unknown) {
      console.error("Failed to resolve mail transport availability: ", e);
      return internalServerError(
        c,
        "Failed to resolve mail transport availability!",
      );
    }
  }),
);

export const GET = handle(app);
