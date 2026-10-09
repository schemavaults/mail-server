import "server-only";

import { z } from "@/lib/zod-openapi";
import { defineOperation } from "@/lib/api/define-operation";
import { adminAuth } from "@/lib/api/auth-schemes";
import { internalError, notFound } from "@/lib/api/errors";
import { uuidParam } from "@/lib/api/params";
import {
  dataMessageResponse,
  errorResponses,
  messageResponse,
} from "@/lib/api/responses";
import { OPENAPI_TAGS } from "@/lib/api/tags";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailKeysRegistry } from "@/lib/mail-db/MailKeysRegistry";
import {
  apiKeyRecordSchema,
  type ApiKeyRecord,
} from "@/lib/mail-db/api-keys-table";
import { updateApiKeyBodySchema } from "../api-key-body-schemas";

const params = z.object({
  api_key_id: uuidParam("api_key_id", "ID of the API key."),
});

export const updateApiKey = defineOperation({
  method: "patch",
  path: "/api/admin/api-keys/{api_key_id}",
  operationId: "updateApiKey",
  tags: [OPENAPI_TAGS.adminApiKeys],
  summary: "Update an API key",
  description:
    "`name` renames the key's label; `allow_any_audience` toggles the key's permission to send to any recipient. The key's ID, secret and scope entries are unchanged either way.",
  auth: adminAuth(),
  request: {
    params,
    body: {
      contentType: "application/json",
      schema: updateApiKeyBodySchema,
      lenientContentType: true,
    },
  },
  responses: {
    200: dataMessageResponse("The updated key.", apiKeyRecordSchema),
    ...errorResponses({
      404: "No active API key with this ID.",
      500: "Failed to update the API key.",
    }),
  },
  handler: async (ctx) => {
    const { api_key_id } = ctx.params;
    const { name, allow_any_audience } = ctx.body;

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
      throw internalError("Failed to update API key!");
    }

    if (!updated) {
      throw notFound(`No active API key found with ID: '${api_key_id}'.`);
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

    return ctx.json(200, {
      success: true,
      data: updated,
      message: `Successfully updated API key: ${changes.join(" and ")}.`,
    });
  },
});

export const revokeApiKey = defineOperation({
  method: "delete",
  path: "/api/admin/api-keys/{api_key_id}",
  operationId: "revokeApiKey",
  tags: [OPENAPI_TAGS.adminApiKeys],
  summary: "Revoke an API key",
  auth: adminAuth(),
  request: { params },
  responses: {
    200: messageResponse("The key was revoked."),
    ...errorResponses({ 500: "Failed to revoke the API key." }),
  },
  handler: async (ctx) => {
    const { api_key_id } = ctx.params;
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new MailKeysRegistry(dbh);
      await registry.revokeApiKey(api_key_id);
    } catch (e: unknown) {
      console.error("Failed to revoke API key: ", e);
      throw internalError("Failed to revoke API key!");
    }

    return ctx.json(200, {
      success: true,
      message: `Successfully revoked API key with ID: '${api_key_id}'.`,
    });
  },
});
