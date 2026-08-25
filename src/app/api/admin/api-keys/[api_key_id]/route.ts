import "server-only";

import { handle } from "hono/vercel";
import { createRouteApp } from "@/lib/hono/create-route-app";
import { runWithAdminGuard } from "@/lib/hono/admin-guard";
import { parseJsonBody } from "@/lib/hono/parse-json-body";
import { parseUuidParam } from "@/lib/hono/parse-uuid-param";
import {
  internalServerError,
  jsonDataMessage,
  jsonMessage,
  notFoundError,
} from "@/lib/hono/responses";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailKeysRegistry } from "@/lib/mail-db/MailKeysRegistry";
import type { ApiKeyRecord } from "@/lib/mail-db/api-keys-table";
import { updateApiKeyBodySchema } from "../api-key-body-schemas";

const app = createRouteApp("/api/admin/api-keys/:api_key_id");

app.delete("/", (c) =>
  runWithAdminGuard(c, async () => {
    const keyId = parseUuidParam(c, "api_key_id");
    if (!keyId.ok) return keyId.response;
    const api_key_id = keyId.value;

    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new MailKeysRegistry(dbh);
      await registry.revokeApiKey(api_key_id);
    } catch (e: unknown) {
      console.error("Failed to revoke API key: ", e);
      return internalServerError(c, "Failed to revoke API key!");
    }

    return jsonMessage(
      c,
      `Successfully revoked API key with ID: '${api_key_id}'.`,
    );
  }),
);

app.patch("/", (c) =>
  runWithAdminGuard(c, async () => {
    const keyId = parseUuidParam(c, "api_key_id");
    if (!keyId.ok) return keyId.response;
    const api_key_id = keyId.value;

    const body = await parseJsonBody(c, updateApiKeyBodySchema, {
      logLabel: "update-api-key request body",
    });
    if (!body.ok) return body.response;
    const { name, allow_any_audience } = body.data;

    let updated: ApiKeyRecord | null = null;
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new MailKeysRegistry(dbh);
      // Renaming only touches the NAME column, and the audience switch only
      // touches ALLOW_ANY_AUDIENCE — the key's ID, secret hash and scope
      // entries are untouched either way, so existing integrations keep
      // working.
      if (name !== undefined) {
        updated = await registry.renameApiKey(api_key_id, name);
      }
      // A null result from the rename above means there is no active key
      // with this ID, so skip the audience update and fall through to 404.
      const keyExists: boolean = name === undefined || updated !== null;
      if (allow_any_audience !== undefined && keyExists) {
        updated = await registry.setAllowAnyAudience(
          api_key_id,
          allow_any_audience,
        );
      }
    } catch (e: unknown) {
      console.error("Failed to update API key: ", e);
      return internalServerError(c, "Failed to update API key!");
    }

    if (!updated) {
      return notFoundError(
        c,
        `No active API key found with ID: '${api_key_id}'.`,
      );
    }

    const changes: string[] = [];
    if (name !== undefined) changes.push(`renamed it to '${updated.name}'`);
    if (allow_any_audience !== undefined) {
      changes.push(
        allow_any_audience
          ? "allowed it to send to any recipient"
          : "restricted it to its allowlisted audience",
      );
    }

    return jsonDataMessage(
      c,
      updated,
      `Successfully updated API key: ${changes.join(" and ")}.`,
    );
  }),
);

export const DELETE = handle(app);
export const PATCH = handle(app);
