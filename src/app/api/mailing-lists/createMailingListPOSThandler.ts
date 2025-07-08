import "server-only";

import { MailingListRegistry } from "@/lib/mail-db";
import {
  mailingListDefinition,
  type MailingListDefinition,
} from "@/lib/mailing-list-definition";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { SCHEMAVAULTS_MAIL_APP_DEFINITION } from "@schemavaults/app-definitions";
import type { UserData } from "@schemavaults/auth";
import {
  RouteGuardFactory,
  type IRouteGuard,
} from "@schemavaults/auth-server-sdk";
import { type NextRequest, NextResponse } from "next/server";

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
          req.headers.get("authorization") ??
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

  const newMailingListId: string = crypto.randomUUID();

  let newMailingList: MailingListDefinition;
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      throw new Error("Expected JSON object request body!");
    }
    const parsed = await mailingListDefinition.safeParseAsync({
      ...body,
      mailing_list_id: newMailingListId,
      created_at: Date.now(),
    });
    if (!parsed.success) {
      throw parsed.error;
    }
    newMailingList = parsed.data;
  } catch (e: unknown) {
    console.error(
      "Failed to parse new mailing list to insert into database from request: ",
      e,
    );
    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to parse new mailing list to insert into database from your request!",
      } satisfies ResourceCreationResponse,
      {
        status: 400,
      },
    );
  }

  try {
    await using dbh = ServerlessDatabase.getAsyncResource();

    const mailRegistry = new MailingListRegistry(dbh);
    await mailRegistry.createMailingList(newMailingList);
  } catch (e: unknown) {
    console.error("Failed to insert new mailing list into database: ", e);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to insert new mailing list into database",
      } satisfies ResourceCreationResponse,
      {
        status: 500,
      },
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: `Successfully created new mailing list with ID: '${newMailingListId}'!`,
      resource_id: newMailingListId,
    } satisfies ResourceCreationResponse,
    {
      status: 200,
    },
  );
}
