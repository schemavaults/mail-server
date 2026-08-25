import "server-only";

import { handle } from "hono/vercel";
import { createRouteApp } from "@/lib/hono/create-route-app";
import { runWithAdminGuard } from "@/lib/hono/admin-guard";
import { parseJsonBody } from "@/lib/hono/parse-json-body";
import {
  internalServerError,
  jsonData,
  jsonDataMessage,
} from "@/lib/hono/responses";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailKeysRegistry } from "@/lib/mail-db/MailKeysRegistry";
import { createApiKeyBodySchema } from "./api-key-body-schemas";

const app = createRouteApp("/api/admin/api-keys");

app.get("/", (c) =>
  runWithAdminGuard(c, async () => {
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new MailKeysRegistry(dbh);
      const keys = await registry.listApiKeys({ includeRevoked: false });
      return jsonData(c, keys);
    } catch (e: unknown) {
      console.error("Failed to list API keys: ", e);
      return internalServerError(c, "Failed to list API keys!");
    }
  }),
);

app.post("/", (c) =>
  runWithAdminGuard(c, async ({ user }) => {
    const body = await parseJsonBody(c, createApiKeyBodySchema, {
      logLabel: "create-api-key request body",
    });
    if (!body.ok) return body.response;
    const { name } = body.data;

    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new MailKeysRegistry(dbh);
      const created = await registry.createApiKey({
        name,
        created_by_user_id: user.uid,
      });
      return jsonDataMessage(
        c,
        created,
        `Successfully created API key '${created.name}'.`,
      );
    } catch (e: unknown) {
      console.error("Failed to create API key: ", e);
      return internalServerError(c, "Failed to create API key!");
    }
  }),
);

export const GET = handle(app);
export const POST = handle(app);
