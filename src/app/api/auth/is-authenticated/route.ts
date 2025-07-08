import "server-only";

import {
  SCHEMAVAULTS_MAIL_APP_DEFINITION,
  SCHEMAVAULTS_REGISTRY_SERVER,
} from "@schemavaults/app-definitions";
import type { PotentiallyValidTokenSource, UserData } from "@schemavaults/auth";
import { RouteGuardFactory } from "@schemavaults/auth-server-sdk";
import { type NextRequest, NextResponse } from "next/server";

type IsAuthenticatedCheckResult =
  | {
      authenticated: false;
    }
  | {
      authenticated: true;
      user: UserData;
    };

function notAuthenticatedResponse(): NextResponse {
  return NextResponse.json(
    {
      authenticated: false,
    } satisfies IsAuthenticatedCheckResult,
    {
      status: 401,
    },
  );
}

/**
 *
 * @param req Request passed to handler by Next.js framework
 * @returns JSON response of type
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const token_sources: PotentiallyValidTokenSource[] = [];
  const cookies = req.cookies;
  const refresh_token = cookies.get("refresh_token");
  if (refresh_token) {
    token_sources.push({
      token: refresh_token.value,
      type: "refresh",
      sourceHint: "Refresh Token Cookie",
    });
  }

  if (token_sources.length === 0) {
    return notAuthenticatedResponse();
  }

  const routeGuardFactory = RouteGuardFactory.getInstance();
  const routeGuard = await routeGuardFactory.createGuardFromTokenSources(
    "authenticated",
    token_sources,
    SCHEMAVAULTS_MAIL_APP_DEFINITION.app_id,
  );

  const authenticated: boolean = routeGuard.isAccessAllowed();
  const user: UserData | null = routeGuard.user;
  if (!authenticated || !user) {
    return notAuthenticatedResponse();
  }

  return NextResponse.json(
    {
      authenticated: true,
      user,
    } satisfies IsAuthenticatedCheckResult,
    {
      status: 200,
    },
  );
}
