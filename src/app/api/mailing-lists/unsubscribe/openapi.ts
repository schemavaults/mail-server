import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
  jsonRequestBody,
  messageResponse,
  errorResponses,
  OPENAPI_TAGS,
} from "@/lib/openapi";
import { leaveMailingListRequestBodySchema } from "./leave-mailing-list-request-body-schema";

export function registerUnsubscribeMailingListPaths(
  registry: OpenAPIRegistry,
): void {
  registry.registerPath({
    method: "post",
    path: "/api/mailing-lists/unsubscribe",
    tags: [OPENAPI_TAGS.mailingLists],
    summary: "Unsubscribe from a mailing list",
    description:
      "Records an unsubscribe for the address on the given mailing list; future sends to that list skip the address.",
    request: {
      body: jsonRequestBody(leaveMailingListRequestBodySchema),
    },
    responses: {
      200: messageResponse("The address was unsubscribed."),
      ...errorResponses({
        400: "Invalid request body.",
        500: "Failed to unsubscribe the address.",
      }),
    },
  });
}
