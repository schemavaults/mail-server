import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/zod-openapi";
import {
  jsonResponse,
  errorResponses,
  successDataResponseSchema,
  adminAuthSecurity,
  OPENAPI_TAGS,
} from "@/lib/openapi";
import { transportStatusSchema } from "./transport-status-schema";

export function registerAdminTransportsPaths(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: "get",
    path: "/api/admin/transports",
    tags: [OPENAPI_TAGS.adminTransports],
    summary: "List mail transports with configured/default status",
    security: adminAuthSecurity,
    responses: {
      200: jsonResponse(
        "The transports this server knows about.",
        successDataResponseSchema(z.array(transportStatusSchema)),
      ),
      ...errorResponses({
        401: "Missing or invalid admin credentials.",
        500: "Failed to resolve mail transport availability.",
      }),
    },
  });
}
