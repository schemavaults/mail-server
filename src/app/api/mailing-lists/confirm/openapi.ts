import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/zod-openapi";
import {
  jsonRequestBody,
  jsonResponse,
  errorResponses,
  OPENAPI_TAGS,
} from "@/lib/openapi";
import { confirmSubscriptionRequestBodySchema } from "./confirm-subscription-request-body-schema";

const confirmSubscriptionSuccessSchema = z
  .object({
    success: z.literal(true),
    mailing_list_id: z.string().uuid(),
    email: z.string().email(),
  })
  .openapi("ConfirmSubscriptionSuccessResponse");

export function registerConfirmSubscriptionPaths(
  registry: OpenAPIRegistry,
): void {
  registry.registerPath({
    method: "post",
    path: "/api/mailing-lists/confirm",
    tags: [OPENAPI_TAGS.mailingLists],
    summary: "Confirm a pending mailing list subscription",
    description:
      "Completes the double opt-in started by POST /api/mailing-lists/join, using the token from the confirmation email. Confirming an already-confirmed subscription succeeds idempotently.",
    request: {
      body: jsonRequestBody(confirmSubscriptionRequestBodySchema),
    },
    responses: {
      200: jsonResponse(
        "The subscription is confirmed.",
        confirmSubscriptionSuccessSchema,
      ),
      ...errorResponses({
        400: "The confirmation link is invalid.",
        410: "The confirmation link has expired.",
        500: "Failed to confirm the subscription.",
      }),
    },
  });
}
