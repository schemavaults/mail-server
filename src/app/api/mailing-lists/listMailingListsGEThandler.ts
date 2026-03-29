import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import type { MailingListDefinition } from "@/lib/mailing-list-definition";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailingListRegistry } from "@/lib/mail-db/MailingListRegistry";
import {
  getAppEnvironment,
  RouteGuardFactory,
  type IRouteGuard,
} from "@schemavaults/auth-server-sdk";
import type { PotentiallyValidTokenSource } from "@schemavaults/auth-common";
import { SCHEMAVAULTS_MAIL_SERVER } from "@schemavaults/app-definitions";

export async function listMailingListsGEThandler(
  req: NextRequest,
): Promise<NextResponse> {
  const environment = getAppEnvironment();

  const token_sources: PotentiallyValidTokenSource[] = [];
  if (req.headers.has("Authorization") || req.headers.has("authorization")) {
    const authHeader =
      req.headers.get("Authorization") ?? req.headers.get("authorization");
    if (
      authHeader &&
      typeof authHeader === "string" &&
      authHeader.startsWith("Bearer ")
    ) {
      token_sources.push({
        sourceHint: "Authorization Bearer Token",
        token: authHeader.slice("Bearer ".length),
        type: "access",
      });
    }
  }

  const route_guard: IRouteGuard = await new RouteGuardFactory({
    environment,
  }).createGuardFromTokenSources(
    "admin",
    token_sources,
    SCHEMAVAULTS_MAIL_SERVER.api_server_id,
  );

  const isAdmin: boolean =
    route_guard.isAccessAllowed() && route_guard.user?.admin ? true : false;

  let mailingLists: readonly MailingListDefinition[];
  try {
    await using dbh = ServerlessDatabase.getAsyncResource();

    const mailRegistry = new MailingListRegistry(dbh);
    mailingLists = await mailRegistry.listMailingLists(
      isAdmin ? "all" : "public",
    );
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

export { listMailingListsGEThandler as GET };
