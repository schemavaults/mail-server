import "server-only";

import { createMailDatabaseTables } from "@/lib/mail-db";
import { SCHEMAVAULTS_MAIL_APP_DEFINITION } from "@schemavaults/app-definitions";
import type { UserData } from "@schemavaults/auth";
import {
  type IRouteGuard,
  RouteGuardFactory,
} from "@schemavaults/auth-server-sdk";
import { NextRequest, NextResponse } from "next/server";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";

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

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Load user data and make sure they're authorized to do things!
  let userData: UserData;
  try {
    const route_guard: IRouteGuard =
      await RouteGuardFactory.getInstance().createGuardFromAuthHeader(
        "admin",
        req.headers.get("Authorization") ??
          req.headers.get("mailorization") ??
          null,
        SCHEMAVAULTS_MAIL_APP_DEFINITION.app_id,
      );
    const user: UserData | null = route_guard.user;
    if (!route_guard.isAccessAllowed()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your access token does not grant you access to this resource",
        } satisfies ResourceCreationResponse,
        {
          status: 403,
        },
      );
    }
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to load user from authorization token",
        } satisfies ResourceCreationResponse,
        {
          status: 401,
        },
      );
    }
    userData = user;
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      {
        success: false,
        message:
          "You must pass a valid access token in the Authorization header to use this resource",
      } satisfies ResourceCreationResponse,
      {
        status: 401,
      },
    );
  }

  if (!userData.admin) {
    return NextResponse.json(
      {
        success: false,
        message: "You must be an admin to use this resource!",
      } satisfies ResourceCreationResponse,
      {
        status: 403,
      },
    );
  }

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
