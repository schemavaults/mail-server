import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { joinMailingListRequestBodySchema } from "./join-mailing-list-request-body-schema";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailingListRegistry } from "@/lib/mail-db";
import { generateConfirmationToken } from "@/lib/mailing-list-confirmation-tokens/generateConfirmationToken";
import { getMailServerWebAppUrl } from "@/lib/getMailServerWebAppUrl";
import { sendEmailFromTemplate } from "@/lib/send-email-from-template";
import { applyCorsHeaders, corsPreflightResponse } from "@/lib/cors";

const CONFIRMATION_TTL_MS = 24 * 60 * 60 * 1000;

function badRequest(req: NextRequest, message: string): NextResponse {
  return applyCorsHeaders(
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

function pendingConfirmationResponse(req: NextRequest): NextResponse {
  return applyCorsHeaders(
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
  return corsPreflightResponse(req);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const raw_json_body = await req.json();
  if (typeof raw_json_body !== "object" || !raw_json_body) {
    return badRequest(req, "Expected request to have JSON body.");
  }

  const parsed_body =
    await joinMailingListRequestBodySchema.safeParseAsync(raw_json_body);
  if (!parsed_body.success) {
    return badRequest(req, "Failed to parse request body to join mailing list!");
  }
  const { email, mailing_list_id } = parsed_body.data;

  try {
    await using dbh = ServerlessDatabase.getAsyncResource();

    const mailRegistry = new MailingListRegistry(dbh);

    const list = await mailRegistry.getMailingList(mailing_list_id);

    if (await mailRegistry.isAlreadySubscribed(mailing_list_id, email)) {
      return pendingConfirmationResponse(req);
    }

    const { plaintext, hash } = await generateConfirmationToken();
    const { expires_at } = await mailRegistry.createPendingSubscription({
      mailing_list_id,
      email,
      token_hash: hash,
      ttl_ms: CONFIRMATION_TTL_MS,
    });

    const confirmationUrl = `${getMailServerWebAppUrl()}/mailing-lists/confirm?token=${plaintext}&email=${encodeURIComponent(email)}`;

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
    return applyCorsHeaders(
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

  return pendingConfirmationResponse(req);
}
