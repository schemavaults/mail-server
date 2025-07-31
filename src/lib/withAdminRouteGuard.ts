import { SCHEMAVAULTS_MAIL_APP_DEFINITION } from "@schemavaults/app-definitions";
import type { UserData } from "@schemavaults/auth";
import {
  RouteGuardFactory,
  type IRouteGuard,
} from "@schemavaults/auth-server-sdk";
import { type NextRequest, NextResponse } from "next/server";

export async function withAdminRouteGuard(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
) {
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
        },
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
        },
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
      },
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
      },
      {
        status: 403,
      },
    );
  }

  try {
    return await handler(req);
  } catch (e: unknown) {
    console.error("Uncaught error in admin API route: ", e);
    return NextResponse.json(
      {
        success: false,
        message: "Uncaught error in admin API route!",
      },
      {
        status: 500,
      },
    );
  }
}

export default withAdminRouteGuard;
