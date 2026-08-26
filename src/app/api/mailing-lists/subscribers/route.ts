import "server-only";

import { handle } from "hono/vercel";
import { z } from "@/lib/zod-openapi";
import { createRouteApp } from "@/lib/hono/create-route-app";
import { runWithAdminGuard } from "@/lib/hono/admin-guard";
import {
  badRequest,
  internalServerError,
  jsonData,
} from "@/lib/hono/responses";
import { MailingListRegistry } from "@/lib/mail-db";
import type { MailingListSubscriber } from "@/lib/mail-db";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";

const mailingListIdSchema = z.string().uuid();

const app = createRouteApp("/api/mailing-lists/subscribers");

app.get("/", (c) =>
  runWithAdminGuard(c, async () => {
    const mailing_list_id = c.req.query("mailing_list_id") ?? null;

    const parsed = mailingListIdSchema.safeParse(mailing_list_id);
    if (!parsed.success) {
      return badRequest(
        c,
        "Invalid or missing mailing_list_id query parameter. Must be a valid UUID.",
      );
    }

    let subscribers: readonly MailingListSubscriber[];
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const mailRegistry = new MailingListRegistry(dbh);
      subscribers = await mailRegistry.listSubscribers(parsed.data);
    } catch (e: unknown) {
      console.error("Failed to list subscribers: ", e);
      return internalServerError(c, "Failed to list subscribers!");
    }

    return jsonData(c, subscribers);
  }),
);

export const GET = handle(app);
