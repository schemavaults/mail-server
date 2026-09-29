import "server-only";

import { z } from "@/lib/zod-openapi";
import { defineOperation } from "@/lib/api/define-operation";
import { adminAuth } from "@/lib/api/auth-schemes";
import { internalError } from "@/lib/api/errors";
import { uuidParam } from "@/lib/api/params";
import { dataResponse, errorResponses } from "@/lib/api/responses";
import { OPENAPI_TAGS } from "@/lib/api/tags";
import { MailingListRegistry } from "@/lib/mail-db";
import type { MailingListSubscriber } from "@/lib/mail-db";
import { mailingListSubscriberTableRowSchema } from "@/lib/mail-db/mailing-list-subscriber-table";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";

export const listSubscribers = defineOperation({
  method: "get",
  path: "/api/mailing-lists/subscribers",
  operationId: "listSubscribers",
  tags: [OPENAPI_TAGS.mailingLists],
  summary: "List a mailing list's subscribers",
  auth: adminAuth(),
  request: {
    query: z.object({
      mailing_list_id: uuidParam(
        "mailing_list_id",
        "ID of the mailing list whose subscribers to list.",
      ),
    }),
  },
  responses: {
    200: dataResponse(
      "The mailing list's subscribers.",
      z.array(mailingListSubscriberTableRowSchema),
    ),
    ...errorResponses({ 500: "Failed to list subscribers." }),
  },
  handler: async (ctx) => {
    let subscribers: readonly MailingListSubscriber[];
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const mailRegistry = new MailingListRegistry(dbh);
      subscribers = await mailRegistry.listSubscribers(
        ctx.query.mailing_list_id,
      );
    } catch (e: unknown) {
      console.error("Failed to list subscribers: ", e);
      throw internalError("Failed to list subscribers!");
    }

    return ctx.json(200, { success: true, data: [...subscribers] });
  },
});
