import "server-only";

import { handle } from "hono/vercel";
import { createRouteApp } from "@/lib/hono/create-route-app";
import { parseJsonBody } from "@/lib/hono/parse-json-body";
import {
  badRequest,
  internalServerError,
  jsonError,
} from "@/lib/hono/responses";
import type { Context } from "hono";
import { confirmSubscriptionRequestBodySchema } from "./confirm-subscription-request-body-schema";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailingListRegistry } from "@/lib/mail-db";
import { hashApiKey } from "@/lib/api-keys/hashApiKey";

const INVALID_LINK_MESSAGE = "Confirmation link is invalid.";

function confirmedResponse(
  c: Context,
  mailing_list_id: string,
  email: string,
): Response {
  return c.json(
    {
      success: true,
      mailing_list_id,
      email,
    },
    200,
  );
}

const app = createRouteApp("/api/mailing-lists/confirm");

app.post("/", async (c) => {
  const body = await parseJsonBody(c, confirmSubscriptionRequestBodySchema, {
    malformedMessage: "Expected request to have JSON body.",
    invalidMessage: INVALID_LINK_MESSAGE,
  });
  if (!body.ok) return body.response;
  const { token, email } = body.data;

  try {
    await using dbh = ServerlessDatabase.getAsyncResource();
    const registry = new MailingListRegistry(dbh);

    const token_hash = await hashApiKey(token);
    const pending = await registry.findPendingSubscriptionByTokenHash(
      token_hash,
    );

    if (!pending) {
      return badRequest(c, INVALID_LINK_MESSAGE);
    }

    if (pending.email.toLowerCase() !== email.toLowerCase()) {
      return badRequest(c, INVALID_LINK_MESSAGE);
    }

    if (pending.confirmed_at !== null) {
      return confirmedResponse(c, pending.mailing_list_id, pending.email);
    }

    const now = Date.now();
    if (pending.expires_at < now) {
      return jsonError(c, 410, "Confirmation link has expired.");
    }

    await registry.markPendingSubscriptionConfirmed(
      pending.pending_subscription_id,
      now,
    );

    try {
      await registry.joinMailingList(pending.mailing_list_id, pending.email);
    } catch (joinErr: unknown) {
      // Most likely the address is already in `subscribers` from a prior
      // confirmation we raced with. Treat that as success and move on.
      console.warn(
        "joinMailingList during confirmation failed (likely already subscribed):",
        joinErr,
      );
    }

    return confirmedResponse(c, pending.mailing_list_id, pending.email);
  } catch (e: unknown) {
    console.error("Failed to confirm mailing list subscription:", e);
    return internalServerError(
      c,
      "Failed to confirm mailing list subscription!",
    );
  }
});

export const POST = handle(app);
