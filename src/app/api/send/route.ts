import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSendEmailRequestBodySchema } from "@schemavaults/send-email-api-options";
import sendEmailFromTemplate from "@/lib/send-email-from-template";
import DefaultMailSenderAddress from "@/lib/DefaultMailSenderAddress";
import sendEmail from "@/lib/send-email";
import type { CreateEmailResponse } from "resend";
import { withAdminApiRouteGuard } from "@/lib/withAdminRouteGuard";
import {
  emailTemplateIdSchema,
  type EmailTemplateId,
} from "@/lib/EmailTemplatesCatalog";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import {
  requestLooksLikeApiKeyAuth,
  validateApiKeyFromRequest,
} from "@/lib/api-keys/validateApiKeyFromRequest";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailingListRegistry } from "@/lib/mail-db";

const sendEmailRequestBodySchema = createSendEmailRequestBodySchema(true);
const uuidSchema = z.string().uuid();

// Resend's API caps `to` recipients per send call. Keep in sync with the
// limit enforced by the Resend service.
const MAX_RESEND_RECIPIENTS = 50;

function badRequest(message: string = "Invalid request"): NextResponse {
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

function unauthorized(message: string = "Unauthorized"): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status: 401,
    },
  );
}

function internalServerError(
  message: string = "An unknown error has occurred!",
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status: 500,
    },
  );
}

function emailSentSuccessfullyResponse(): NextResponse {
  return NextResponse.json(
    {
      success: true,
      message: "Successfully sent email!",
    },
    {
      status: 200,
    },
  );
}

/**
 * Shared send-email logic. Used by both authentication paths (API key and
 * admin JWT) so the validation, template rendering, and dispatch behavior
 * stays identical regardless of how the caller authenticated.
 */
async function handleSendEmailRequest(req: NextRequest): Promise<NextResponse> {
  const parsed_data = await sendEmailRequestBodySchema.safeParseAsync(
    await req.json(),
  );
  if (!parsed_data.success) {
    console.error(
      "Failed to parse request body to send email from this @schemavaults/mail-server instance: ",
      parsed_data.error,
    );
    return badRequest("Failed to parse request body!");
  }
  const sendEmailOpts = parsed_data.data;

  const subject: string = sendEmailOpts.subject;
  let to: string | string[] = sendEmailOpts.to;
  const from: string =
    typeof sendEmailOpts.from === "string"
      ? sendEmailOpts.from
      : DefaultMailSenderAddress;

  // If `to` is a single UUID string, treat it as a mailing list ID and
  // expand it into the list of active subscriber emails (subscribers
  // minus anyone with an unsubscribe record for that list).
  let resolvedFromMailingListId: string | null = null;
  if (typeof to === "string" && uuidSchema.safeParse(to).success) {
    const mailingListId: string = to;
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const mailRegistry = new MailingListRegistry(dbh);

      const [subscribers, unsubscribeRows] = await Promise.all([
        mailRegistry.listSubscribers(mailingListId),
        dbh.db
          .selectFrom("unsubscribe_records")
          .select("email")
          .where("mailing_list_id", "=", mailingListId)
          .execute(),
      ]);

      const unsubscribed = new Set<string>(
        unsubscribeRows.map((row) => row.email.toLowerCase()),
      );

      const seen = new Set<string>();
      const recipients: string[] = [];
      for (const sub of subscribers) {
        const normalized = sub.email.toLowerCase();
        if (unsubscribed.has(normalized)) continue;
        if (seen.has(normalized)) continue;
        seen.add(normalized);
        recipients.push(sub.email);
      }

      if (recipients.length === 0) {
        return badRequest("Mailing list has no active subscribers.");
      }
      if (recipients.length > MAX_RESEND_RECIPIENTS) {
        return badRequest(
          `Mailing list has more than ${MAX_RESEND_RECIPIENTS} active subscribers; Resend per-call limit exceeded.`,
        );
      }

      to = recipients;
      resolvedFromMailingListId = mailingListId;
    } catch (e: unknown) {
      console.error(
        `Failed to load subscribers for mailing list '${mailingListId}': `,
        e,
      );
      return internalServerError("Failed to load mailing list subscribers!");
    }
  }

  const baseEmailOpts = {
    subject,
    to,
    from,
    replyTo: sendEmailOpts.replyTo ?? undefined,
    cc: sendEmailOpts.cc ?? undefined,
    bcc: sendEmailOpts.bcc ?? undefined,
  };

  let result: CreateEmailResponse;
  try {
    if ("template_id" in sendEmailOpts.message) {
      const parsed_template_id = await emailTemplateIdSchema.safeParseAsync(
        sendEmailOpts.message.template_id,
      );
      if (!parsed_template_id.success) {
        return badRequest("Invalid template ID!");
      }
      const template_id: EmailTemplateId = parsed_template_id.data;

      result = await sendEmailFromTemplate({
        ...baseEmailOpts,
        message: {
          template_id,
          template_props: sendEmailOpts.message.template_props as any,
        },
      });
    } else {
      result = await sendEmail({
        ...baseEmailOpts,
        text: sendEmailOpts.message.text,
        html: sendEmailOpts.message.html,
      });
    }

    if (result.error) {
      console.error(
        "Received error response from attempt to send email: ",
        result.error,
      );
      throw result.error;
    }
  } catch (e: unknown) {
    console.error("Error sending email: ", e);

    if (e instanceof BadEmailTemplatePropsError) {
      return badRequest("Invalid options supplied for email template!");
    }

    return internalServerError(
      typeof e === "object" &&
        !!e &&
        "message" in e &&
        typeof e.message === "string"
        ? e.message
        : "An unknown error has occurred while attempting to send email!",
    );
  }

  if (resolvedFromMailingListId !== null) {
    console.log(
      `[/api/send] Successfully sent email to mailing list '${resolvedFromMailingListId}' (${(to as string[]).length} recipients): `,
      to,
    );
  } else {
    console.log(`[/api/send] Successfully sent email to: `, to);
  }

  return emailSentSuccessfullyResponse();
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // API-key path: if the caller is presenting a token that looks like a
  // SchemaVaults Mail Server API key, validate it against the api_keys table
  // and skip the admin JWT guard entirely.
  if (requestLooksLikeApiKeyAuth(req)) {
    const result = await validateApiKeyFromRequest(req);
    if (!result.valid) {
      return unauthorized("Invalid or revoked API key.");
    }
    return await handleSendEmailRequest(req);
  }

  // Fallback path: existing admin JWT guard. Keeps the in-app
  // /admin/send-email page working without changes.
  const protected_route = await withAdminApiRouteGuard(
    async function POST_handler({ req }): Promise<NextResponse> {
      return await handleSendEmailRequest(req);
    },
  );
  return await protected_route(req);
}
