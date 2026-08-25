import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
  jsonRequestBody,
  messageResponse,
  errorResponses,
  OPENAPI_TAGS,
} from "@/lib/openapi";
import { joinMailingListRequestBodySchema } from "./join-mailing-list-request-body-schema";

export function registerJoinMailingListPaths(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: "post",
    path: "/api/mailing-lists/join",
    tags: [OPENAPI_TAGS.mailingLists],
    summary: "Start a mailing list subscription (double opt-in)",
    description:
      "Sends a confirmation email to the address; the subscription only becomes active once the emailed link is confirmed via POST /api/mailing-lists/confirm. The response does not reveal whether the address was already subscribed. Subject to the CORS origin allowlist for cross-origin browser calls.",
    request: {
      body: jsonRequestBody(joinMailingListRequestBodySchema),
    },
    responses: {
      200: messageResponse(
        "A confirmation email has been sent (or the address was already subscribed).",
      ),
      ...errorResponses({
        400: "Invalid request body.",
        500: "Failed to start the subscription.",
      }),
    },
  });
}
