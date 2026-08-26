import "server-only";

import { handle } from "hono/vercel";
import { createRouteApp } from "@/lib/hono/create-route-app";
import { runWithApiKeyOrAdminGuard } from "@/lib/hono/admin-guard";
import { parseUuidParam } from "@/lib/hono/parse-uuid-param";
import {
  internalServerError,
  jsonData,
  notFoundError,
} from "@/lib/hono/responses";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { TestEmailsRegistry, type TestEmail } from "@/lib/mail-db";
import { checkTestEmailsAccess } from "../test-emails-access";

const app = createRouteApp("/api/test-emails/:test_email_id");

// Reads one email captured by the test-database-transport. Same
// authorization as the list endpoint (see ../test-emails-access.ts).
app.get("/", (c) =>
  runWithApiKeyOrAdminGuard(c, async (auth) => {
    const denied = await checkTestEmailsAccess(c, auth);
    if (denied !== null) return denied;

    const emailId = parseUuidParam(c, "test_email_id");
    if (!emailId.ok) return emailId.response;
    const test_email_id = emailId.value;

    let email: TestEmail | null;
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new TestEmailsRegistry(dbh);
      email = await registry.getEmail(test_email_id);
    } catch (e: unknown) {
      console.error(`Failed to read test email '${test_email_id}': `, e);
      return internalServerError(c, "Failed to read test email!");
    }

    if (email === null) {
      return notFoundError(
        c,
        `No test email found with ID '${test_email_id}'.`,
      );
    }

    return jsonData(c, email);
  }),
);

export const GET = handle(app);
