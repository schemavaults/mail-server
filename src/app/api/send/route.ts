import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { sendEmailRequestBody } from "./send-email-request-body-schema";

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
    return NextResponse.json({
      success: false,
      message: "Failed to parse request body!",
    });
  }

  return emailSentSuccessfullyResponse();
}
