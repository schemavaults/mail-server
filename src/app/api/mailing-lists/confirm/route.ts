import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { confirmSubscriptionRequestBodySchema } from "./confirm-subscription-request-body-schema";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailingListRegistry } from "@/lib/mail-db";
import { hashApiKey } from "@/lib/api-keys/hashApiKey";

function badRequest(message: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status: 400,
    },
  );
}

const INVALID_LINK_MESSAGE = "Confirmation link is invalid.";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const raw_json_body = await req.json().catch(() => null);
  if (typeof raw_json_body !== "object" || !raw_json_body) {
    return badRequest("Expected request to have JSON body.");
  }

  const parsed_body =
    await confirmSubscriptionRequestBodySchema.safeParseAsync(raw_json_body);
  if (!parsed_body.success) {
    return badRequest(INVALID_LINK_MESSAGE);
  }
  const { token, email } = parsed_body.data;

  try {
    await using dbh = ServerlessDatabase.getAsyncResource();
    const registry = new MailingListRegistry(dbh);

    const token_hash = await hashApiKey(token);
    const pending = await registry.findPendingSubscriptionByTokenHash(
      token_hash,
    );

    if (!pending) {
      return badRequest(INVALID_LINK_MESSAGE);
    }

    if (pending.email.toLowerCase() !== email.toLowerCase()) {
      return badRequest(INVALID_LINK_MESSAGE);
    }

    if (pending.confirmed_at !== null) {
      return NextResponse.json(
        {
          success: true,
          mailing_list_id: pending.mailing_list_id,
          email: pending.email,
        },
        { status: 200 },
      );
    }

    const now = Date.now();
    if (pending.expires_at < now) {
      return NextResponse.json(
        {
          success: false,
          message: "Confirmation link has expired.",
        },
        { status: 410 },
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

    return NextResponse.json(
      {
        success: true,
        mailing_list_id: pending.mailing_list_id,
        email: pending.email,
      },
      { status: 200 },
    );
  } catch (e: unknown) {
    console.error("Failed to confirm mailing list subscription:", e);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to confirm mailing list subscription!",
      },
      { status: 500 },
    );
  }
}
