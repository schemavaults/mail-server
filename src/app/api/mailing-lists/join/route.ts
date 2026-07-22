import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { joinMailingListRequestBodySchema } from "./join-mailing-list-request-body-schema";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailingListRegistry } from "@/lib/mail-db";
import { generateConfirmationToken } from "@/lib/mailing-list-confirmation-tokens/generateConfirmationToken";
import { sendEmailFromTemplate } from "@/lib/send-email-from-template";
import { applyCorsHeaders, corsPreflightResponse } from "@/lib/cors";

const CONFIRMATION_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Public base URL of this mail server, used to build absolute links embedded
 * in emails. Configured via the HOST environment variable (with or without a
 * scheme; https is assumed when omitted). Falls back to localhost with the
 * dev server's PORT when unset.
 */
function getMailServerBaseUrl(): string {
  const host = process.env.HOST;
  if (typeof host === "string" && host.length > 0) {
    return new URL(host.includes("://") ? host : `https://${host}`).origin;
  }
  return `http://localhost:${process.env.PORT ?? "3000"}`;
}

async function badRequest(
  req: NextRequest,
  message: string,
): Promise<NextResponse> {
  return await applyCorsHeaders(
    req,
    NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status: 400,
      },
    ),
  );
}

async function pendingConfirmationResponse(
  req: NextRequest,
): Promise<NextResponse> {
  return await applyCorsHeaders(
    req,
    NextResponse.json(
      {
        success: true,
        message:
          "Check your inbox for a confirmation email to complete your subscription.",
      },
      {
        status: 200,
      },
    ),
  );
}

export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
  return await corsPreflightResponse(req);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const raw_json_body = await req.json();
  if (typeof raw_json_body !== "object" || !raw_json_body) {
    return await badRequest(req, "Expected request to have JSON body.");
  }

  const parsed_body =
    await joinMailingListRequestBodySchema.safeParseAsync(raw_json_body);
  if (!parsed_body.success) {
    return await badRequest(
      req,
      "Failed to parse request body to join mailing list!",
    );
  }
  const { email, mailing_list_id } = parsed_body.data;

  try {
    await using dbh = ServerlessDatabase.getAsyncResource();

    const mailRegistry = new MailingListRegistry(dbh);

    const list = await mailRegistry.getMailingList(mailing_list_id);

    if (await mailRegistry.isAlreadySubscribed(mailing_list_id, email)) {
      return await pendingConfirmationResponse(req);
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
    return await applyCorsHeaders(
      req,
      NextResponse.json(
        {
          success: false,
          message: "Failed to start mailing list subscription!",
        },
        {
          status: 500,
        },
      ),
    );
  }

  return await pendingConfirmationResponse(req);
}
