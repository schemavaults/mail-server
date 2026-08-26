import "server-only";

import { handle } from "hono/vercel";
import { createRouteApp } from "@/lib/hono/create-route-app";
import { runWithAdminGuard } from "@/lib/hono/admin-guard";
import { internalServerError, jsonData } from "@/lib/hono/responses";
import {
  loadMailTransportsAvailability,
  MAIL_TRANSPORT_KINDS,
} from "@/lib/mail-transport";
import type { TransportStatus } from "./transport-status-schema";

export type { TransportStatus } from "./transport-status-schema";

const app = createRouteApp("/api/admin/transports");

app.get("/", (c) =>
  runWithAdminGuard(c, async () => {
    try {
      const availability = loadMailTransportsAvailability();
      const data: TransportStatus[] = MAIL_TRANSPORT_KINDS.map((id) => ({
        id,
        configured: availability.configured.includes(id),
        is_default: availability.defaultTransport === id,
      }));
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
