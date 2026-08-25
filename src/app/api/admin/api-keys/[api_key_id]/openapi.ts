import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/zod-openapi";
import {
  jsonRequestBody,
  jsonResponse,
  messageResponse,
  errorResponses,
  successDataMessageResponseSchema,
  adminAuthSecurity,
  uuidPathParam,
  OPENAPI_TAGS,
} from "@/lib/openapi";
import { apiKeyRecordSchema } from "@/lib/mail-db/api-keys-table";
import { updateApiKeyBodySchema } from "../api-key-body-schemas";

export function registerApiKeyItemPaths(registry: OpenAPIRegistry): void {
  const params = z.object({
    api_key_id: uuidPathParam("api_key_id", "ID of the API key."),
  });

  registry.registerPath({
    method: "patch",
    path: "/api/admin/api-keys/{api_key_id}",
    tags: [OPENAPI_TAGS.adminApiKeys],
    summary: "Update an API key",
    description:
      "`name` renames the key's label; `allow_any_audience` toggles the key's permission to send to any recipient. The key's ID, secret and scope entries are unchanged either way.",
    security: adminAuthSecurity,
    request: {
      params,
      body: jsonRequestBody(updateApiKeyBodySchema),
    },
    responses: {
      200: jsonResponse(
        "The updated key.",
        successDataMessageResponseSchema(apiKeyRecordSchema),
      ),
      ...errorResponses({
        400: "Invalid api_key_id or request body.",
        401: "Missing or invalid admin credentials.",
        404: "No active API key with this ID.",
        500: "Failed to update the API key.",
      }),
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/api/admin/api-keys/{api_key_id}",
    tags: [OPENAPI_TAGS.adminApiKeys],
    summary: "Revoke an API key",
    security: adminAuthSecurity,
    request: { params },
    responses: {
      200: messageResponse("The key was revoked."),
      ...errorResponses({
        400: "Invalid api_key_id.",
        401: "Missing or invalid admin credentials.",
        500: "Failed to revoke the API key.",
      }),
    },
  });
}
