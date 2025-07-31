import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { sendEmailRequestBody } from "./send-email-request-body-schema";
import sendEmailFromTemplate from "@/lib/send-email-from-template";
import DefaultMailSenderAddress from "@/lib/DefaultMailSenderAddress";
import sendEmail from "@/lib/send-email";
import type { CreateEmailResponse } from "resend";
import withAdminRouteGuard from "@/lib/withAdminRouteGuard";

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

async function POST_handler(req: NextRequest): Promise<NextResponse> {
  const raw_json_body = await req.json();
  if (typeof raw_json_body !== "object" || !raw_json_body) {
    return badRequest("Expected request to have JSON body.");
  }

  const parsed_data = await sendEmailRequestBody.safeParseAsync(raw_json_body);
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
      result = await sendEmailFromTemplate({
        ...baseEmailOpts,
        template_id: sendEmailOpts.message.template_id,
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
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return await withAdminRouteGuard(req, POST_handler);
}
