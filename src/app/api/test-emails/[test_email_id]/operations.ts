import "server-only";

import { z } from "@/lib/zod-openapi";
import { apiKeyIdOf, defineOperation } from "@/lib/api/define-operation";
import { apiKeyOrAdminAuth } from "@/lib/api/auth-schemes";
import { internalError, notFound } from "@/lib/api/errors";
import { uuidParam } from "@/lib/api/params";
import { dataResponse, errorResponses } from "@/lib/api/responses";
import { OPENAPI_TAGS } from "@/lib/api/tags";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { TestEmailsRegistry, type TestEmail } from "@/lib/mail-db";
import { testEmailSchema } from "@/lib/mail-db/test-emails-table";
import {
  assertTestEmailsAccess,
  TEST_EMAILS_ACCESS_NOTES,
} from "../test-emails-access";

// Reads one email captured by the test-database-transport. Same
// authorization as the list operation (see ../test-emails-access.ts).
export const getTestEmail = defineOperation({
  method: "get",
  path: "/api/test-emails/{test_email_id}",
  operationId: "getTestEmail",
  tags: [OPENAPI_TAGS.testEmails],
  summary: "Read one email captured by the test-database transport",
  description:
    "Reads a single fake-sent email by ID (the ID is also returned as the transport's message ID).",
  auth: apiKeyOrAdminAuth(TEST_EMAILS_ACCESS_NOTES),
  request: {
    params: z.object({
      test_email_id: uuidParam(
        "test_email_id",
        "ID of the captured test email.",
      ),
    }),
  },
  responses: {
    200: dataResponse("The captured test email.", testEmailSchema),
    ...errorResponses({
      403: "The API key's transport scope does not permit the test-database transport.",
      404: "No test email exists with this ID.",
      500: "Failed to read the test email.",
    }),
  },
  handler: async (ctx) => {
    await assertTestEmailsAccess(apiKeyIdOf(ctx.auth));
    const { test_email_id } = ctx.params;

    let email: TestEmail | null;
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new TestEmailsRegistry(dbh);
      email = await registry.getEmail(test_email_id);
    } catch (e: unknown) {
      console.error(`Failed to read test email '${test_email_id}': `, e);
      throw internalError("Failed to read test email!");
    }

    if (email === null) {
      throw notFound(`No test email found with ID '${test_email_id}'.`);
    }

    return ctx.json(200, { success: true, data: email });
  },
});
