import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/zod-openapi";
import {
  jsonResponse,
  errorResponses,
  successDataResponseSchema,
  adminAuthSecurity,
  OPENAPI_TAGS,
} from "@/lib/openapi";

export function registerAdminTemplatesPaths(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: "get",
    path: "/api/admin/templates",
    tags: [OPENAPI_TAGS.adminTemplates],
    summary: "List email template IDs",
    security: adminAuthSecurity,
    responses: {
      200: jsonResponse(
        "The template IDs in this server's catalog.",
        successDataResponseSchema(z.array(z.string())),
      ),
      ...errorResponses({ 401: "Missing or invalid admin credentials." }),
    },
  });
}
