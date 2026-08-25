import "server-only";

import { handle } from "hono/vercel";
import { createRouteApp } from "@/lib/hono/create-route-app";
import { runWithAdminGuard } from "@/lib/hono/admin-guard";
import { parseUuidParam } from "@/lib/hono/parse-uuid-param";
import { internalServerError, jsonMessage } from "@/lib/hono/responses";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { CorsOriginsRegistry } from "@/lib/mail-db/CorsOriginsRegistry";

const app = createRouteApp("/api/admin/cors-origins/:cors_origin_id");

app.delete("/", (c) =>
  runWithAdminGuard(c, async () => {
    const originId = parseUuidParam(c, "cors_origin_id");
    if (!originId.ok) return originId.response;
    const cors_origin_id = originId.value;

    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new CorsOriginsRegistry(dbh);
      await registry.removeOrigin(cors_origin_id);
    } catch (e: unknown) {
      console.error("Failed to remove allowed CORS origin: ", e);
      return internalServerError(c, "Failed to remove allowed CORS origin!");
    }

    return jsonMessage(
      c,
      `Successfully removed allowed CORS origin with ID: '${cors_origin_id}'.`,
    );
  }),
);

export const DELETE = handle(app);
