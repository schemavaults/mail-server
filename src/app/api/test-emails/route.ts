import "server-only";

import { handle } from "hono/vercel";
import { z } from "@/lib/zod-openapi";
import { createRouteApp } from "@/lib/hono/create-route-app";
import { runWithApiKeyOrAdminGuard } from "@/lib/hono/admin-guard";
import {
  badRequest,
  internalServerError,
  jsonData,
} from "@/lib/hono/responses";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { TestEmailsRegistry, type TestEmail } from "@/lib/mail-db";
import { checkTestEmailsAccess } from "./test-emails-access";
import {
  DEFAULT_TEST_EMAILS_PAGE_SIZE,
  MAX_TEST_EMAILS_PAGE_SIZE,
} from "./page-size";

const listQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_TEST_EMAILS_PAGE_SIZE)
    .default(DEFAULT_TEST_EMAILS_PAGE_SIZE),
  offset: z.coerce.number().int().min(0).default(0),
});

const app = createRouteApp("/api/test-emails");

// Lists emails captured by the test-database-transport, newest first.
// Accepts an admin JWT, or an API key whose transport scope permits the
// test-database transport (see ./test-emails-access.ts) — the same callers
// that can fake-send through it can read back what was stored.
app.get("/", (c) =>
  runWithApiKeyOrAdminGuard(c, async (auth) => {
    const denied = await checkTestEmailsAccess(c, auth);
    if (denied !== null) return denied;

    const parsedQuery = listQuerySchema.safeParse({
      limit: c.req.query("limit"),
      offset: c.req.query("offset"),
    });
    if (!parsedQuery.success) {
      return badRequest(
        c,
        `Invalid query parameters: 'limit' must be an integer between 1 and ${MAX_TEST_EMAILS_PAGE_SIZE}, and 'offset' a non-negative integer.`,
      );
    }
    const { limit, offset } = parsedQuery.data;

    let emails: readonly TestEmail[];
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new TestEmailsRegistry(dbh);
      emails = await registry.listEmails({ limit, offset });
    } catch (e: unknown) {
      console.error("Failed to list test emails: ", e);
      return internalServerError(c, "Failed to list test emails!");
    }

    return jsonData(c, emails);
  }),
);

export const GET = handle(app);
