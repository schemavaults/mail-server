import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/zod-openapi";
import {
  jsonResponse,
  errorResponses,
  successDataResponseSchema,
  adminOrApiKeySecurity,
  OPENAPI_TAGS,
} from "@/lib/openapi";
import { testEmailSchema } from "@/lib/mail-db/test-emails-table";
import {
  DEFAULT_TEST_EMAILS_PAGE_SIZE,
  MAX_TEST_EMAILS_PAGE_SIZE,
} from "./page-size";

export function registerTestEmailsPaths(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: "get",
    path: "/api/test-emails",
    tags: [OPENAPI_TAGS.testEmails],
    summary: "List emails captured by the test-database transport",
    description:
      "Lists emails 'sent' through the fake test-database-transport, newest first. Accepts an admin JWT, or a mail-server API key whose transport scope permits the test-database transport. Intended for E2E tests verifying the full /api/send flow without real delivery.",
    security: adminOrApiKeySecurity,
    request: {
      query: z.object({
        limit: z.coerce
          .number()
          .int()
          .min(1)
          .max(MAX_TEST_EMAILS_PAGE_SIZE)
          .optional()
          .openapi({
            param: { name: "limit", in: "query", required: false },
            description: `Page size (default ${DEFAULT_TEST_EMAILS_PAGE_SIZE}, max ${MAX_TEST_EMAILS_PAGE_SIZE}).`,
            example: DEFAULT_TEST_EMAILS_PAGE_SIZE,
          }),
        offset: z.coerce.number().int().min(0).optional().openapi({
          param: { name: "offset", in: "query", required: false },
          description: "Rows to skip, for paging (default 0).",
          example: 0,
        }),
      }),
    },
    responses: {
      200: jsonResponse(
        "The captured test emails, newest first.",
        successDataResponseSchema(z.array(testEmailSchema)),
      ),
      ...errorResponses({
        400: "Invalid limit/offset query parameters.",
        401: "Missing or invalid credentials.",
        403: "The API key's transport scope does not permit the test-database transport.",
        500: "Failed to list test emails.",
      }),
    },
  });
}
