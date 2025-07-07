import "server-only";

import { MailingListRegistry } from "@/lib/mail-db";
import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
  let isAdmin: boolean = false;

  let mailingLists: readonly MailingListDefinition[];
  try {
    await using dbh = ServerlessDatabase.getAsyncResource();

    const mailRegistry = new MailingListRegistry(dbh);
    mailingLists = await mailRegistry.listMailingLists();
  } catch (e: unknown) {
    console.error("Failed to list mailing lists: ", e);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to list mailing lists!",
      },
      {
        status: 500,
      },
    );
  }

  if (!isAdmin) {
    mailingLists = mailingLists.filter((mailingList) => mailingList.public);
  }

  return NextResponse.json(
    {
      success: true,
      data: mailingLists satisfies readonly MailingListDefinition[],
    },
    { status: 200 },
  );
}
