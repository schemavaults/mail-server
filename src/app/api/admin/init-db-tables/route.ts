import "server-only";

import { createMailDatabaseTables } from "@/lib/mail-db";
import { NextRequest, NextResponse } from "next/server";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import withAdminRouteGuard from "@/lib/withAdminRouteGuard";

type ResourceCreationResponse =
  | {
      success: true;
      message: string;
      resource_id: string;
    }
  | {
      success: false;
      message: string;
    };

async function POST_handler(req: NextRequest): Promise<NextResponse> {
  void req;

  await using dbh: ServerlessDatabase = ServerlessDatabase.getAsyncResource();

  try {
    await createMailDatabaseTables(dbh.db);
  } catch (e: unknown) {
    console.error(
      "Error attempting to initialize @schemavaults/mail-server postgres database: ",
      e,
    );
    return NextResponse.json(
      {
        success: false,
        message:
          "Error attempting to initialize @schemavaults/mail-server postgres database!",
      } satisfies ResourceCreationResponse,
      {
        status: 500,
      },
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: "Initialized @schemavaults/mail-server postgres database!",
    },
    {
      status: 200,
    },
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return await withAdminRouteGuard(req, POST_handler);
}
