import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/zod-openapi";
import {
  jsonResponse,
  errorResponses,
  successDataResponseSchema,
  adminOrApiKeySecurity,
  uuidPathParam,
  OPENAPI_TAGS,
} from "@/lib/openapi";
import { testEmailSchema } from "@/lib/mail-db/test-emails-table";

export function registerTestEmailItemPaths(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: "get",
    path: "/api/test-emails/{test_email_id}",
    tags: [OPENAPI_TAGS.testEmails],
    summary: "Read one email captured by the test-database transport",
    description:
      "Reads a single fake-sent email by ID (the ID is also returned as the transport's message ID). Same authorization as the list endpoint.",
    security: adminOrApiKeySecurity,
    request: {
      params: z.object({
        test_email_id: uuidPathParam(
          "test_email_id",
          "ID of the captured test email.",
        ),
      }),
    },
    responses: {
      200: jsonResponse(
        "The captured test email.",
        successDataResponseSchema(testEmailSchema),
      ),
      ...errorResponses({
        400: "Invalid test_email_id; must be a valid UUID.",
        401: "Missing or invalid credentials.",
        403: "The API key's transport scope does not permit the test-database transport.",
        404: "No test email exists with this ID.",
        500: "Failed to read the test email.",
      }),
    },
  });
}
