import "server-only";

import { publicAccess } from "@schemavaults/openapi-operations";
import { defineOperation } from "@/lib/api/define-operation";
import { internalError } from "@/lib/api/errors";
import { errorResponses, messageResponse } from "@/lib/api/responses";
import { OPENAPI_TAGS } from "@/lib/api/tags";
import { joinMailingListRequestBodySchema } from "./join-mailing-list-request-body-schema";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailingListRegistry } from "@/lib/mail-db";
import { generateConfirmationToken } from "@/lib/mailing-list-confirmation-tokens/generateConfirmationToken";
import { sendEmailFromTemplate } from "@/lib/send-email-from-template";
import { getMailServerBaseUrl } from "@/lib/mail-server-base-url";

const CONFIRMATION_TTL_MS = 24 * 60 * 60 * 1000;

const PENDING_CONFIRMATION_MESSAGE =
  "Check your inbox for a confirmation email to complete your subscription.";

// Public cross-origin operation: joining is offered from other web apps, so
// its route applies the database-backed CORS allowlist (and answers OPTIONS
// preflights).
export const joinMailingList = defineOperation({
  method: "post",
  path: "/api/mailing-lists/join",
  operationId: "joinMailingList",
  tags: [OPENAPI_TAGS.mailingLists],
  summary: "Start a mailing list subscription (double opt-in)",
  description:
    "Sends a confirmation email to the address; the subscription only becomes active once the emailed link is confirmed via POST /api/mailing-lists/confirm. The response does not reveal whether the address was already subscribed. Subject to the CORS origin allowlist for cross-origin browser calls.",
  auth: publicAccess(),
  request: {
    body: {
      contentType: "application/json",
      schema: joinMailingListRequestBodySchema,
      // Browsers label `fetch(url, { body: JSON.stringify(...) })` bodies
      // text/plain, and this endpoint is called cross-origin from other apps.
      lenientContentType: true,
    },
  },
  responses: {
    200: messageResponse(
      "A confirmation email has been sent (or the address was already subscribed).",
    ),
    ...errorResponses({ 500: "Failed to start the subscription." }),
  },
  handler: async (ctx) => {
    const { email, mailing_list_id } = ctx.body;

    try {
      await using dbh = ServerlessDatabase.getAsyncResource();

      const mailRegistry = new MailingListRegistry(dbh);

      const list = await mailRegistry.getMailingList(mailing_list_id);

      if (await mailRegistry.isAlreadySubscribed(mailing_list_id, email)) {
        return ctx.json(200, {
          success: true,
          message: PENDING_CONFIRMATION_MESSAGE,
        });
      }

      const { plaintext, hash } = await generateConfirmationToken();
      const { expires_at } = await mailRegistry.createPendingSubscription({
        mailing_list_id,
        email,
        token_hash: hash,
        ttl_ms: CONFIRMATION_TTL_MS,
      });

      const confirmationUrl = `${getMailServerBaseUrl()}/mailing-lists/confirm?token=${plaintext}&email=${encodeURIComponent(email)}`;

      try {
        await sendEmailFromTemplate({
          subject: `Confirm your subscription to ${list.name}`,
          to: email,
          message: {
            template_id: "mailing-list-confirmation",
            template_props: {
              mailingListName: list.name,
              mailingListDescription: list.description,
              confirmationUrl,
              subscriberEmail: email,
              expiresAt: new Date(expires_at).toUTCString(),
            },
          },
        });
      } catch (sendErr: unknown) {
        // Don't leak send failures back to anonymous callers — that would
        // tell an attacker which addresses got a pending row created.
        console.error(
          "Failed to send mailing list confirmation email:",
          sendErr,
        );
      }
    } catch (e: unknown) {
      console.error("Failed to start mailing list subscription:", e);
      throw internalError("Failed to start mailing list subscription!");
    }

    return ctx.json(200, {
      success: true,
      message: PENDING_CONFIRMATION_MESSAGE,
    });
  },
});
