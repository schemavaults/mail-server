import "server-only";

import { z } from "@/lib/zod-openapi";
import { defineOperation } from "@/lib/api/define-operation";
import { adminAuth } from "@/lib/api/auth-schemes";
import { conflict, internalError } from "@/lib/api/errors";
import {
  dataMessageResponse,
  dataResponse,
  errorResponses,
} from "@/lib/api/responses";
import { OPENAPI_TAGS } from "@/lib/api/tags";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { CorsOriginsRegistry } from "@/lib/mail-db/CorsOriginsRegistry";
import { corsAllowedOriginRowSchema } from "@/lib/mail-db/cors-allowed-origins-table";
import { addCorsOriginBodySchema } from "./cors-origin-body-schema";

export const listCorsOrigins = defineOperation({
  method: "get",
  path: "/api/admin/cors-origins",
  operationId: "listCorsOrigins",
  tags: [OPENAPI_TAGS.adminCors],
  summary: "List allowed CORS origins",
  auth: adminAuth(),
  responses: {
    200: dataResponse(
      "The allowed CORS origins.",
      z.array(corsAllowedOriginRowSchema),
    ),
    ...errorResponses({ 500: "Failed to list allowed CORS origins." }),
  },
  handler: async (ctx) => {
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new CorsOriginsRegistry(dbh);
      const origins = await registry.listOrigins();
      return ctx.json(200, { success: true, data: [...origins] });
    } catch (e: unknown) {
      console.error("Failed to list allowed CORS origins: ", e);
      throw internalError("Failed to list allowed CORS origins!");
    }
  },
});

export const addCorsOrigin = defineOperation({
  method: "post",
  path: "/api/admin/cors-origins",
  operationId: "addCorsOrigin",
  tags: [OPENAPI_TAGS.adminCors],
  summary: "Allow a CORS origin",
  auth: adminAuth(),
  request: {
    body: {
      contentType: "application/json",
      schema: addCorsOriginBodySchema,
      lenientContentType: true,
    },
  },
  responses: {
    200: dataMessageResponse(
      "The origin was allowed.",
      corsAllowedOriginRowSchema,
    ),
    ...errorResponses({
      409: "The origin is already allowed.",
      500: "Failed to allow the CORS origin.",
    }),
  },
  handler: async (ctx) => {
    const { origin, description } = ctx.body;

    let alreadyAllowed = false;
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new CorsOriginsRegistry(dbh);
      alreadyAllowed = await registry.isAllowedOrigin(origin);
      if (!alreadyAllowed) {
        const created = await registry.addOrigin({
          origin,
          description,
          created_by_user_id: ctx.auth.user.uid,
        });
        return ctx.json(200, {
          success: true,
          data: created,
          message: `Successfully allowed CORS origin '${created.origin}'.`,
        });
      }
    } catch (e: unknown) {
      console.error("Failed to add allowed CORS origin: ", e);
      throw internalError("Failed to add allowed CORS origin!");
    }
    throw conflict(`Origin '${origin}' is already allowed.`);
  },
});
