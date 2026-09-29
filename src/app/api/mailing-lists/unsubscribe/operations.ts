import "server-only";

import { publicAccess } from "@schemavaults/openapi-operations";
import { defineOperation } from "@/lib/api/define-operation";
import { internalError } from "@/lib/api/errors";
import { errorResponses, messageResponse } from "@/lib/api/responses";
import { OPENAPI_TAGS } from "@/lib/api/tags";
import { leaveMailingListRequestBodySchema } from "./leave-mailing-list-request-body-schema";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailingListRegistry } from "@/lib/mail-db";

export const unsubscribeFromMailingList = defineOperation({
  method: "post",
  path: "/api/mailing-lists/unsubscribe",
  operationId: "unsubscribeFromMailingList",
  tags: [OPENAPI_TAGS.mailingLists],
  summary: "Unsubscribe from a mailing list",
  description:
    "Records an unsubscribe for the address on the given mailing list; future sends to that list skip the address.",
  auth: publicAccess(),
  request: {
    body: {
      contentType: "application/json",
      schema: leaveMailingListRequestBodySchema,
      lenientContentType: true,
    },
  },
  responses: {
    200: messageResponse("The address was unsubscribed."),
    ...errorResponses({ 500: "Failed to unsubscribe the address." }),
  },
  handler: async (ctx) => {
    const { email, mailing_list_id } = ctx.body;

    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const mailRegistry = new MailingListRegistry(dbh);
      await mailRegistry.leaveMailingList(mailing_list_id, email);
    } catch (e: unknown) {
      console.error(
        "Failed to remove email address from the mailing list: ",
        e,
      );
      throw internalError(
        "Failed to unsubscribe your email address from the mailing list!",
      );
    }

    return ctx.json(200, {
      success: true,
      message: `Successfully unsubscribed from mailing list with ID: '${mailing_list_id}'`,
    });
  },
});
