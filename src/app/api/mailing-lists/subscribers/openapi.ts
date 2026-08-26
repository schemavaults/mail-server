import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/zod-openapi";
import {
  jsonResponse,
  errorResponses,
  successDataResponseSchema,
  adminAuthSecurity,
  uuidQueryParam,
  OPENAPI_TAGS,
} from "@/lib/openapi";
import { mailingListSubscriberTableRowSchema } from "@/lib/mail-db/mailing-list-subscriber-table";

export function registerSubscribersPaths(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: "get",
    path: "/api/mailing-lists/subscribers",
    tags: [OPENAPI_TAGS.mailingLists],
    summary: "List a mailing list's subscribers",
    security: adminAuthSecurity,
    request: {
      query: z.object({
        mailing_list_id: uuidQueryParam(
          "mailing_list_id",
          "ID of the mailing list whose subscribers to list.",
        ),
      }),
    },
    responses: {
      200: jsonResponse(
        "The mailing list's subscribers.",
        successDataResponseSchema(
          z.array(mailingListSubscriberTableRowSchema),
        ),
      ),
      ...errorResponses({
        400: "Invalid or missing mailing_list_id query parameter.",
        401: "Missing or invalid admin credentials.",
        500: "Failed to list subscribers.",
      }),
    },
  });
}
