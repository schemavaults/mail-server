import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { sendEmailRequestBodySchema } from "@schemavaults/send-email-api-options";
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

export async function POST(req: NextRequest): Promise<NextResponse> {
  const protected_route = await withAdminApiRouteGuard(
    async function POST_handler({ req }): Promise<NextResponse> {
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
      const to = sendEmailOpts.to;
      const from: string =
        typeof sendEmailOpts.from === "string"
          ? sendEmailOpts.from
          : DefaultMailSenderAddress;

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
            template_id,
            template_props: sendEmailOpts.message.template_props as any,
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

      return emailSentSuccessfullyResponse();
    },
  );
  return await protected_route(req);
}
