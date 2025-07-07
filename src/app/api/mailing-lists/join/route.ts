import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { joinMailingListRequestBodySchema } from "./join-mailing-list-request-body-schema";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailingListRegistry } from "@/lib/mail-db";

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

export async function POST(req: NextRequest): Promise<NextResponse> {
  const raw_json_body = await req.json();
  if (typeof raw_json_body !== "object" || !raw_json_body) {
    return badRequest("Expected request to have JSON body.");
  }

  const parsed_body =
    await joinMailingListRequestBodySchema.safeParseAsync(raw_json_body);
  if (!parsed_body.success) {
    return badRequest("Failed to parse request body to join mailing list!");
  }
  const { email, mailing_list_id } = parsed_body.data;

  try {
    await using dbh = ServerlessDatabase.getAsyncResource();

    const mailRegistry = new MailingListRegistry(dbh);
    await mailRegistry.joinMailingList(mailing_list_id, email);
  } catch (e: unknown) {
    console.error("Failed to add your email address to the mailing list: ", e);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add your email address to the mailing list!",
      },
      {
        status: 500,
      },
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: `Successfully subscribed to mailing list with ID: '${mailing_list_id}'`,
    },
    {
      status: 200,
    },
  );
}
