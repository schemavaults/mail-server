import "server-only";

import { z } from "@/lib/zod-openapi";
import { defineOperation } from "@/lib/api/define-operation";
import { adminAuth } from "@/lib/api/auth-schemes";
import { internalError } from "@/lib/api/errors";
import {
  dataMessageResponse,
  dataResponse,
  errorResponses,
} from "@/lib/api/responses";
import { OPENAPI_TAGS } from "@/lib/api/tags";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailKeysRegistry } from "@/lib/mail-db/MailKeysRegistry";
import { apiKeyRecordSchema } from "@/lib/mail-db/api-keys-table";
import { createApiKeyBodySchema } from "./api-key-body-schemas";

const createdApiKeySchema = apiKeyRecordSchema
  .omit({ last_used_at: true, revoked_at: true, allow_any_audience: true })
  .extend({
    plaintext: z.string().openapi({
      description:
        "The full API key token. Returned EXACTLY ONCE, on creation — it is stored only as a hash.",
      example: "svlts_mail_pk_...",
    }),
  })
  .openapi("CreatedApiKey");

export const listApiKeys = defineOperation({
  method: "get",
  path: "/api/admin/api-keys",
  operationId: "listApiKeys",
  tags: [OPENAPI_TAGS.adminApiKeys],
  summary: "List active API keys",
  auth: adminAuth(),
  responses: {
    200: dataResponse(
      "The active (non-revoked) API keys.",
      z.array(apiKeyRecordSchema),
    ),
    ...errorResponses({ 500: "Failed to list API keys." }),
  },
  handler: async (ctx) => {
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new MailKeysRegistry(dbh);
      const keys = await registry.listApiKeys({ includeRevoked: false });
      return ctx.json(200, { success: true, data: [...keys] });
    } catch (e: unknown) {
      console.error("Failed to list API keys: ", e);
      throw internalError("Failed to list API keys!");
    }
  },
});

export const createApiKey = defineOperation({
  method: "post",
  path: "/api/admin/api-keys",
  operationId: "createApiKey",
  tags: [OPENAPI_TAGS.adminApiKeys],
  summary: "Create an API key",
  description:
    "Creates a key with allow_any_audience=false and no scope entries, so it can send to nobody until its audience is configured. The plaintext token is returned exactly once.",
  auth: adminAuth(),
  request: {
    body: {
      contentType: "application/json",
      schema: createApiKeyBodySchema,
      lenientContentType: true,
    },
  },
  responses: {
    200: dataMessageResponse(
      "The created key, including its plaintext token (shown only this once).",
      createdApiKeySchema,
    ),
    ...errorResponses({ 500: "Failed to create the API key." }),
  },
  handler: async (ctx) => {
    const { name } = ctx.body;
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new MailKeysRegistry(dbh);
      const created = await registry.createApiKey({
        name,
        created_by_user_id: ctx.auth.user.uid,
      });
      return ctx.json(200, {
        success: true,
        data: created,
        message: `Successfully created API key '${created.name}'.`,
      });
    } catch (e: unknown) {
      console.error("Failed to create API key: ", e);
      throw internalError("Failed to create API key!");
    }
  },
});
