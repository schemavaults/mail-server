import "server-only";

import { handle } from "hono/vercel";
import { createRouteApp } from "@/lib/hono/create-route-app";
import { runWithAdminGuard } from "@/lib/hono/admin-guard";
import {
  badRequest,
  internalServerError,
  jsonData,
} from "@/lib/hono/responses";
import {
  mailingListDefinition,
  type MailingListDefinition,
} from "@/lib/mailing-list-definition";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { MailingListRegistry } from "@/lib/mail-db";
import {
  getAppEnvironment,
  RouteGuardFactory,
  type IRouteGuard,
} from "@schemavaults/auth-server-sdk";
import type { PotentiallyValidTokenSource } from "@schemavaults/auth-common";
import { getAppId } from "@/lib/getAppId";

const app = createRouteApp("/api/mailing-lists");

/**
 * Public directory of mailing lists. An OPTIONAL admin bearer token widens
 * the listing to private lists; anonymous callers only see public ones.
 */
app.get("/", async (c) => {
  const environment = getAppEnvironment();

  const token_sources: PotentiallyValidTokenSource[] = [];
  const authHeader = c.req.header("Authorization");
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

  const route_guard: IRouteGuard = await new RouteGuardFactory({
    environment,
  }).createGuardFromTokenSources("admin", token_sources, getAppId());

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
    return internalServerError(c, "Failed to list mailing lists!");
  }

  if (!isAdmin) {
    mailingLists = mailingLists.filter((mailingList) => mailingList.public);
  }

  return jsonData(c, mailingLists satisfies readonly MailingListDefinition[]);
});

/** Create a mailing list (admin only). */
app.post("/", (c) =>
  runWithAdminGuard(c, async () => {
    const newMailingListId: string = crypto.randomUUID();

    let newMailingList: MailingListDefinition;
    try {
      const body = await c.req.json();
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
      return badRequest(
        c,
        "Failed to parse new mailing list to insert into database from your request!",
      );
    }

    try {
      await using dbh = ServerlessDatabase.getAsyncResource();

      const mailRegistry = new MailingListRegistry(dbh);
      await mailRegistry.createMailingList(newMailingList);
    } catch (e: unknown) {
      console.error("Failed to insert new mailing list into database: ", e);
      return internalServerError(
        c,
        "Failed to insert new mailing list into database",
      );
    }

    return c.json(
      {
        success: true,
        message: `Successfully created new mailing list with ID: '${newMailingListId}'!`,
        resource_id: newMailingListId,
      },
      200,
    );
  }),
);

export const GET = handle(app);
export const POST = handle(app);
