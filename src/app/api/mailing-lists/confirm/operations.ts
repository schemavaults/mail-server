import "server-only";

import {
  isOperationError,
  publicAccess,
} from "@schemavaults/openapi-operations";
import { z } from "@/lib/zod-openapi";
import { defineOperation } from "@/lib/api/define-operation";
import { badRequest, gone, internalError } from "@/lib/api/errors";
import { errorResponses } from "@/lib/api/responses";
import { OPENAPI_TAGS } from "@/lib/api/tags";
import { confirmSubscriptionRequestBodySchema } from "./confirm-subscription-request-body-schema";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailingListRegistry } from "@/lib/mail-db";
import { hashApiKey } from "@/lib/api-keys/hashApiKey";

/**
 * 400 message for a link that does not match a pending subscription. The
 * confirmation page shows the same text for runtime validation failures (a
 * malformed token or email in the link).
 */
const INVALID_LINK_MESSAGE = "Confirmation link is invalid.";

const confirmSubscriptionSuccessSchema = z
  .object({
    success: z.literal(true),
    mailing_list_id: z.string().uuid(),
    email: z.string().email(),
  })
  .openapi("ConfirmSubscriptionSuccessResponse");

export const confirmSubscription = defineOperation({
  method: "post",
  path: "/api/mailing-lists/confirm",
  operationId: "confirmSubscription",
  tags: [OPENAPI_TAGS.mailingLists],
  summary: "Confirm a pending mailing list subscription",
  description:
    "Completes the double opt-in started by POST /api/mailing-lists/join, using the token from the confirmation email. Confirming an already-confirmed subscription succeeds idempotently.",
  auth: publicAccess(),
  request: {
    body: {
      contentType: "application/json",
      schema: confirmSubscriptionRequestBodySchema,
      lenientContentType: true,
    },
  },
  responses: {
    200: {
      description: "The subscription is confirmed.",
      schema: confirmSubscriptionSuccessSchema,
    },
    ...errorResponses({
      400: "The confirmation link is invalid.",
      410: "The confirmation link has expired.",
      500: "Failed to confirm the subscription.",
    }),
  },
  handler: async (ctx) => {
    const { token, email } = ctx.body;

    const confirmed = (mailing_list_id: string, confirmedEmail: string) =>
      ctx.json(200, {
        success: true,
        mailing_list_id,
        email: confirmedEmail,
      });

    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new MailingListRegistry(dbh);

      const token_hash = await hashApiKey(token);
      const pending =
        await registry.findPendingSubscriptionByTokenHash(token_hash);

      if (!pending) {
        throw badRequest(INVALID_LINK_MESSAGE, "invalid_confirmation_link");
      }

      if (pending.email.toLowerCase() !== email.toLowerCase()) {
        throw badRequest(INVALID_LINK_MESSAGE, "invalid_confirmation_link");
      }

      if (pending.confirmed_at !== null) {
        return confirmed(pending.mailing_list_id, pending.email);
      }

      const now = Date.now();
      if (pending.expires_at < now) {
        throw gone(
          "Confirmation link has expired.",
          "expired_confirmation_link",
        );
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

      return confirmed(pending.mailing_list_id, pending.email);
    } catch (e: unknown) {
      if (isOperationError(e)) throw e;
      console.error("Failed to confirm mailing list subscription:", e);
      throw internalError("Failed to confirm mailing list subscription!");
    }
  },
});
