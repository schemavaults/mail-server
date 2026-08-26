import "server-only";

import { handle } from "hono/vercel";
import { createRouteApp } from "@/lib/hono/create-route-app";
import { corsMiddleware } from "@/lib/hono/cors-middleware";
import { parseJsonBody } from "@/lib/hono/parse-json-body";
import { internalServerError, jsonMessage } from "@/lib/hono/responses";
import { joinMailingListRequestBodySchema } from "./join-mailing-list-request-body-schema";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailingListRegistry } from "@/lib/mail-db";
import { generateConfirmationToken } from "@/lib/mailing-list-confirmation-tokens/generateConfirmationToken";
import { sendEmailFromTemplate } from "@/lib/send-email-from-template";
import { getMailServerBaseUrl } from "@/lib/mail-server-base-url";

const CONFIRMATION_TTL_MS = 24 * 60 * 60 * 1000;

const PENDING_CONFIRMATION_MESSAGE =
  "Check your inbox for a confirmation email to complete your subscription.";

const app = createRouteApp("/api/mailing-lists/join");

// Public cross-origin route: joining is offered from other web apps, so the
// database-backed CORS allowlist applies (and answers OPTIONS preflights).
app.use(corsMiddleware());

app.post("/", async (c) => {
  const body = await parseJsonBody(c, joinMailingListRequestBodySchema, {
    malformedMessage: "Expected request to have JSON body.",
    invalidMessage: "Failed to parse request body to join mailing list!",
  });
  if (!body.ok) return body.response;
  const { email, mailing_list_id } = body.data;

  try {
    await using dbh = ServerlessDatabase.getAsyncResource();

    const mailRegistry = new MailingListRegistry(dbh);

    const list = await mailRegistry.getMailingList(mailing_list_id);

    if (await mailRegistry.isAlreadySubscribed(mailing_list_id, email)) {
      return jsonMessage(c, PENDING_CONFIRMATION_MESSAGE);
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
    return internalServerError(
      c,
      "Failed to start mailing list subscription!",
    );
  }

  return jsonMessage(c, PENDING_CONFIRMATION_MESSAGE);
});

export const POST = handle(app);
export const OPTIONS = handle(app);
