import "server-only";

import { z } from "@/lib/zod-openapi";
import { apiKeyIdOf, defineOperation } from "@/lib/api/define-operation";
import { apiKeyOrAdminAuth } from "@/lib/api/auth-schemes";
import { internalError } from "@/lib/api/errors";
import { dataResponse, errorResponses } from "@/lib/api/responses";
import { OPENAPI_TAGS } from "@/lib/api/tags";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { TestEmailsRegistry, type TestEmail } from "@/lib/mail-db";
import { testEmailSchema } from "@/lib/mail-db/test-emails-table";
import {
  assertTestEmailsAccess,
  TEST_EMAILS_ACCESS_NOTES,
} from "./test-emails-access";
import {
  DEFAULT_TEST_EMAILS_PAGE_SIZE,
  MAX_TEST_EMAILS_PAGE_SIZE,
} from "./page-size";

// Lists emails captured by the test-database-transport, newest first.
// Accepts an admin access token, or an API key whose transport scope
// permits the test-database transport (see ./test-emails-access.ts) — the
// same callers that can fake-send through it can read back what was stored.
export const listTestEmails = defineOperation({
  method: "get",
  path: "/api/test-emails",
  operationId: "listTestEmails",
  tags: [OPENAPI_TAGS.testEmails],
  summary: "List emails captured by the test-database transport",
  description:
    "Lists emails 'sent' through the fake test-database-transport, newest first. Intended for E2E tests verifying the full /api/send flow without real delivery.",
  auth: apiKeyOrAdminAuth(TEST_EMAILS_ACCESS_NOTES),
  request: {
    query: z.object({
      limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(MAX_TEST_EMAILS_PAGE_SIZE)
        .default(DEFAULT_TEST_EMAILS_PAGE_SIZE)
        .openapi({
          description: `Page size (default ${DEFAULT_TEST_EMAILS_PAGE_SIZE}, max ${MAX_TEST_EMAILS_PAGE_SIZE}).`,
          example: DEFAULT_TEST_EMAILS_PAGE_SIZE,
        }),
      offset: z.coerce.number().int().min(0).default(0).openapi({
        description: "Rows to skip, for paging (default 0).",
        example: 0,
      }),
    }),
  },
  responses: {
    200: dataResponse(
      "The captured test emails, newest first.",
      z.array(testEmailSchema),
    ),
    ...errorResponses({
      403: "The API key's transport scope does not permit the test-database transport.",
      500: "Failed to list test emails.",
    }),
  },
  handler: async (ctx) => {
    await assertTestEmailsAccess(apiKeyIdOf(ctx.auth));
    const { limit, offset } = ctx.query;

    let emails: readonly TestEmail[];
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new TestEmailsRegistry(dbh);
      emails = await registry.listEmails({ limit, offset });
    } catch (e: unknown) {
      console.error("Failed to list test emails: ", e);
      throw internalError("Failed to list test emails!");
    }

    return ctx.json(200, { success: true, data: [...emails] });
  },
});
