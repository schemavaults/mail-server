import "server-only";

import { MailingListRegistry } from "@/lib/mail-db";
import type { MailingListSubscriber } from "@/lib/mail-db";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { type NextRequest, NextResponse } from "next/server";
import { withAdminApiRouteGuard } from "@/lib/withAdminRouteGuard";
import { z } from "zod";

const mailingListIdSchema = z.string().uuid();

export async function GET(req: NextRequest): Promise<NextResponse> {
  const protected_route = await withAdminApiRouteGuard(
    async function GET_handler({ req }): Promise<NextResponse> {
      const mailing_list_id = req.nextUrl.searchParams.get("mailing_list_id");

      const parsed = mailingListIdSchema.safeParse(mailing_list_id);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid or missing mailing_list_id query parameter. Must be a valid UUID.",
          },
          { status: 400 },
        );
      }

      let subscribers: readonly MailingListSubscriber[];
      try {
        await using dbh = ServerlessDatabase.getAsyncResource();
        const mailRegistry = new MailingListRegistry(dbh);
        subscribers = await mailRegistry.listSubscribers(parsed.data);
      } catch (e: unknown) {
        console.error("Failed to list subscribers: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to list subscribers!",
          },
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: subscribers,
        },
        { status: 200 },
      );
    },
  );
  return await protected_route(req);
}
