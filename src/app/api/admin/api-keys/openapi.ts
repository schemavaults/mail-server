import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/zod-openapi";
import {
  jsonRequestBody,
  jsonResponse,
  errorResponses,
  successDataResponseSchema,
  successDataMessageResponseSchema,
  adminAuthSecurity,
  OPENAPI_TAGS,
} from "@/lib/openapi";
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

export function registerApiKeysPaths(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: "get",
    path: "/api/admin/api-keys",
    tags: [OPENAPI_TAGS.adminApiKeys],
    summary: "List active API keys",
    security: adminAuthSecurity,
    responses: {
      200: jsonResponse(
        "The active (non-revoked) API keys.",
        successDataResponseSchema(z.array(apiKeyRecordSchema)),
      ),
      ...errorResponses({
        401: "Missing or invalid admin credentials.",
        500: "Failed to list API keys.",
      }),
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/admin/api-keys",
    tags: [OPENAPI_TAGS.adminApiKeys],
    summary: "Create an API key",
    description:
      "Creates a key with allow_any_audience=false and no scope entries, so it can send to nobody until its audience is configured. The plaintext token is returned exactly once.",
    security: adminAuthSecurity,
    request: { body: jsonRequestBody(createApiKeyBodySchema) },
    responses: {
      200: jsonResponse(
        "The created key, including its plaintext token (shown only this once).",
        successDataMessageResponseSchema(createdApiKeySchema),
      ),
      ...errorResponses({
        400: "Invalid request body.",
        401: "Missing or invalid admin credentials.",
        500: "Failed to create the API key.",
      }),
    },
  });
}
