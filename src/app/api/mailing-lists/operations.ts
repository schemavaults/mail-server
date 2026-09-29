import "server-only";

import { publicAccess } from "@schemavaults/openapi-operations";
import { z } from "@/lib/zod-openapi";
import { defineOperation } from "@/lib/api/define-operation";
import { adminAuth } from "@/lib/api/auth-schemes";
import { internalError } from "@/lib/api/errors";
import { dataResponse, errorResponses } from "@/lib/api/responses";
import { OPENAPI_TAGS } from "@/lib/api/tags";
import {
  createMailingListRequestBodySchema,
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

const createMailingListSuccessSchema = z
  .object({
    success: z.literal(true),
    message: z.string(),
    resource_id: z.string().uuid().openapi({
      description: "ID of the newly created mailing list.",
    }),
  })
  .openapi("CreateMailingListSuccessResponse");

/** Whether the request carries a valid ADMIN bearer access token. */
async function isAdminRequest(request: Request): Promise<boolean> {
  const token_sources: PotentiallyValidTokenSource[] = [];
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token_sources.push({
      sourceHint: "Authorization Bearer Token",
      token: authHeader.slice("Bearer ".length),
      type: "access",
    });
  }

  const route_guard: IRouteGuard = await new RouteGuardFactory({
    environment: getAppEnvironment(),
  }).createGuardFromTokenSources("admin", token_sources, getAppId());

  return route_guard.isAccessAllowed() && route_guard.user?.admin
    ? true
    : false;
}

/**
 * Public directory of mailing lists. An OPTIONAL admin bearer token widens
 * the listing to private lists; anonymous callers only see public ones.
 */
export const listMailingLists = defineOperation({
  method: "get",
  path: "/api/mailing-lists",
  operationId: "listMailingLists",
  tags: [OPENAPI_TAGS.mailingLists],
  summary: "List mailing lists",
  description:
    "Public directory of mailing lists. Anonymous callers only see public lists; an optional admin bearer access token widens the listing to private ones.",
  auth: publicAccess(
    "An admin's bearer access token, when present, also lists private mailing lists.",
  ),
  responses: {
    200: dataResponse(
      "The mailing lists visible to the caller.",
      z.array(mailingListDefinition),
    ),
    ...errorResponses({ 500: "Failed to list mailing lists." }),
  },
  handler: async (ctx) => {
    const isAdmin: boolean = await isAdminRequest(ctx.request);

    let mailingLists: readonly MailingListDefinition[];
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const mailRegistry = new MailingListRegistry(dbh);
      mailingLists = await mailRegistry.listMailingLists(
        isAdmin ? "all" : "public",
      );
    } catch (e: unknown) {
      console.error("Failed to list mailing lists: ", e);
      throw internalError("Failed to list mailing lists!");
    }

    if (!isAdmin) {
      mailingLists = mailingLists.filter((mailingList) => mailingList.public);
    }

    return ctx.json(200, { success: true, data: [...mailingLists] });
  },
});

/** Create a mailing list (admin only). */
export const createMailingList = defineOperation({
  method: "post",
  path: "/api/mailing-lists",
  operationId: "createMailingList",
  tags: [OPENAPI_TAGS.mailingLists],
  summary: "Create a mailing list",
  auth: adminAuth(),
  request: {
    body: {
      contentType: "application/json",
      schema: createMailingListRequestBodySchema,
      lenientContentType: true,
    },
  },
  responses: {
    200: {
      description: "The mailing list was created.",
      schema: createMailingListSuccessSchema,
    },
    ...errorResponses({ 500: "Failed to create the mailing list." }),
  },
  handler: async (ctx) => {
    const newMailingListId: string = crypto.randomUUID();
    const newMailingList: MailingListDefinition = {
      ...ctx.body,
      mailing_list_id: newMailingListId,
      created_at: Date.now(),
    };

    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const mailRegistry = new MailingListRegistry(dbh);
      await mailRegistry.createMailingList(newMailingList);
    } catch (e: unknown) {
      console.error("Failed to insert new mailing list into database: ", e);
      throw internalError("Failed to insert new mailing list into database");
    }

    return ctx.json(200, {
      success: true,
      message: `Successfully created new mailing list with ID: '${newMailingListId}'!`,
      resource_id: newMailingListId,
    });
  },
});
