import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/zod-openapi";
import {
  jsonRequestBody,
  jsonResponse,
  messageResponse,
  errorResponses,
  successDataResponseSchema,
  adminAuthSecurity,
  uuidPathParam,
  OPENAPI_TAGS,
} from "@/lib/openapi";

export interface IApiKeyScopeOpenApiOptions {
  /** Trailing path segment under /api/admin/api-keys/{api_key_id}/. */
  segment: "allowlist" | "recipients" | "senders" | "transports";
  /** Schema for the POST/DELETE mutation body. */
  bodySchema: z.ZodType;
  /** Schema describing one listed entry (defaults to a plain string). */
  entrySchema?: z.ZodType;
  /** Human name of the scope, e.g. "audience mailing-list allowlist". */
  scopeName: string;
  /** What one entry is, e.g. "mailing list". */
  entryName: string;
  /** Extra description appended to every operation in this scope. */
  description?: string;
}

/**
 * OpenAPI counterpart of ./scope-route-factory: registers the GET/POST/
 * DELETE trio for one of the four structurally identical API-key scope
 * routes.
 */
export function registerApiKeyScopePaths(
  registry: OpenAPIRegistry,
  opts: IApiKeyScopeOpenApiOptions,
): void {
  const path = `/api/admin/api-keys/{api_key_id}/${opts.segment}`;
  const params = z.object({
    api_key_id: uuidPathParam("api_key_id", "ID of the API key."),
  });
  const listSchema = successDataResponseSchema(
    z.array(opts.entrySchema ?? z.string()),
  );

  registry.registerPath({
    method: "get",
    path,
    tags: [OPENAPI_TAGS.adminApiKeys],
    summary: `List an API key's ${opts.scopeName} entries`,
    description: opts.description,
    security: adminAuthSecurity,
    request: { params },
    responses: {
      200: jsonResponse(
        `The key's ${opts.scopeName} entries.`,
        listSchema,
      ),
      ...errorResponses({
        400: "Invalid api_key_id.",
        401: "Missing or invalid admin credentials.",
        500: `Failed to list the key's ${opts.scopeName} entries.`,
      }),
    },
  });

  registry.registerPath({
    method: "post",
    path,
    tags: [OPENAPI_TAGS.adminApiKeys],
    summary: `Add a ${opts.entryName} to an API key's ${opts.scopeName}`,
    description: opts.description,
    security: adminAuthSecurity,
    request: { params, body: jsonRequestBody(opts.bodySchema) },
    responses: {
      200: messageResponse(`The ${opts.entryName} was added.`),
      ...errorResponses({
        400: "Invalid api_key_id, invalid body, or unknown referenced resource.",
        401: "Missing or invalid admin credentials.",
        500: `Failed to add the ${opts.entryName}.`,
      }),
    },
  });

  registry.registerPath({
    method: "delete",
    path,
    tags: [OPENAPI_TAGS.adminApiKeys],
    summary: `Remove a ${opts.entryName} from an API key's ${opts.scopeName}`,
    description: opts.description,
    security: adminAuthSecurity,
    request: { params, body: jsonRequestBody(opts.bodySchema) },
    responses: {
      200: messageResponse(`The ${opts.entryName} was removed.`),
      ...errorResponses({
        400: "Invalid api_key_id or invalid body.",
        401: "Missing or invalid admin credentials.",
        500: `Failed to remove the ${opts.entryName}.`,
      }),
    },
  });
}
