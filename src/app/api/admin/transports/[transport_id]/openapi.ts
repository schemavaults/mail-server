import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/zod-openapi";
import {
  jsonRequestBody,
  jsonResponse,
  errorResponses,
  successDataMessageResponseSchema,
  adminAuthSecurity,
  OPENAPI_TAGS,
} from "@/lib/openapi";
import { mailTransportKindSchema } from "@/lib/mail-transport/transport-kind-schema";
import { transportStatusSchema } from "../transport-status-schema";
import { updateTransportBodySchema } from "./update-transport-body-schema";

export function registerAdminTransportItemPaths(
  registry: OpenAPIRegistry,
): void {
  registry.registerPath({
    method: "patch",
    path: "/api/admin/transports/{transport_id}",
    tags: [OPENAPI_TAGS.adminTransports],
    summary: "Enable or disable the test-database transport",
    description:
      "Toggles a transport's runtime kill switch. Only the fake-send `test-database-transport` supports this — it lets an admin stop fake sending in production without a redeploy. The real delivery transports (`resend`, `smtp`) are controlled by environment variables and reject this call.",
    security: adminAuthSecurity,
    request: {
      params: z.object({
        transport_id: mailTransportKindSchema.openapi({
          param: { name: "transport_id", in: "path", required: true },
          description: "The transport to update.",
          example: "test-database-transport",
        }),
      }),
      body: jsonRequestBody(updateTransportBodySchema),
    },
    responses: {
      200: jsonResponse(
        "The transport's updated status.",
        successDataMessageResponseSchema(transportStatusSchema),
      ),
      ...errorResponses({
        400: "Unknown transport, a transport that cannot be toggled, or an invalid request body.",
        401: "Missing or invalid admin credentials.",
        500: "Failed to update the transport setting.",
      }),
    },
  });
}
