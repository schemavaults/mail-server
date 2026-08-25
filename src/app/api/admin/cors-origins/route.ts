import "server-only";

import { handle } from "hono/vercel";
import { createRouteApp } from "@/lib/hono/create-route-app";
import { runWithAdminGuard } from "@/lib/hono/admin-guard";
import { parseJsonBody } from "@/lib/hono/parse-json-body";
import {
  internalServerError,
  jsonData,
  jsonDataMessage,
  jsonError,
} from "@/lib/hono/responses";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { CorsOriginsRegistry } from "@/lib/mail-db/CorsOriginsRegistry";
import { addCorsOriginBodySchema } from "./cors-origin-body-schema";

const app = createRouteApp("/api/admin/cors-origins");

app.get("/", (c) =>
  runWithAdminGuard(c, async () => {
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new CorsOriginsRegistry(dbh);
      const origins = await registry.listOrigins();
      return jsonData(c, origins);
    } catch (e: unknown) {
      console.error("Failed to list allowed CORS origins: ", e);
      return internalServerError(c, "Failed to list allowed CORS origins!");
    }
  }),
);

app.post("/", (c) =>
  runWithAdminGuard(c, async ({ user }) => {
    const body = await parseJsonBody(c, addCorsOriginBodySchema, {
      logLabel: "add-cors-origin request body",
    });
    if (!body.ok) return body.response;
    const { origin, description } = body.data;

    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new CorsOriginsRegistry(dbh);
      if (await registry.isAllowedOrigin(origin)) {
        return jsonError(c, 409, `Origin '${origin}' is already allowed.`);
      }
      const created = await registry.addOrigin({
        origin,
        description,
        created_by_user_id: user.uid,
      });
      return jsonDataMessage(
        c,
        created,
        `Successfully allowed CORS origin '${created.origin}'.`,
      );
    } catch (e: unknown) {
      console.error("Failed to add allowed CORS origin: ", e);
      return internalServerError(c, "Failed to add allowed CORS origin!");
    }
  }),
);

export const GET = handle(app);
export const POST = handle(app);
