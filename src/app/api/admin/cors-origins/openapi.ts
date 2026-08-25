import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/zod-openapi";
import {
  jsonRequestBody,
  jsonResponse,
  messageResponse,
  errorResponses,
  successDataResponseSchema,
  successDataMessageResponseSchema,
  adminAuthSecurity,
  uuidPathParam,
  OPENAPI_TAGS,
} from "@/lib/openapi";
import { corsAllowedOriginRowSchema } from "@/lib/mail-db/cors-allowed-origins-table";
import { addCorsOriginBodySchema } from "./cors-origin-body-schema";

export function registerCorsOriginsPaths(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: "get",
    path: "/api/admin/cors-origins",
    tags: [OPENAPI_TAGS.adminCors],
    summary: "List allowed CORS origins",
    security: adminAuthSecurity,
    responses: {
      200: jsonResponse(
        "The allowed CORS origins.",
        successDataResponseSchema(z.array(corsAllowedOriginRowSchema)),
      ),
      ...errorResponses({
        401: "Missing or invalid admin credentials.",
        500: "Failed to list allowed CORS origins.",
      }),
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/admin/cors-origins",
    tags: [OPENAPI_TAGS.adminCors],
    summary: "Allow a CORS origin",
    security: adminAuthSecurity,
    request: { body: jsonRequestBody(addCorsOriginBodySchema) },
    responses: {
      200: jsonResponse(
        "The origin was allowed.",
        successDataMessageResponseSchema(corsAllowedOriginRowSchema),
      ),
      ...errorResponses({
        400: "Invalid request body.",
        401: "Missing or invalid admin credentials.",
        409: "The origin is already allowed.",
        500: "Failed to allow the CORS origin.",
      }),
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/api/admin/cors-origins/{cors_origin_id}",
    tags: [OPENAPI_TAGS.adminCors],
    summary: "Remove an allowed CORS origin",
    security: adminAuthSecurity,
    request: {
      params: z.object({
        cors_origin_id: uuidPathParam(
          "cors_origin_id",
          "ID of the allowed-origin entry.",
        ),
      }),
    },
    responses: {
      200: messageResponse("The origin was removed."),
      ...errorResponses({
        400: "Invalid cors_origin_id.",
        401: "Missing or invalid admin credentials.",
        500: "Failed to remove the CORS origin.",
      }),
    },
  });
}
