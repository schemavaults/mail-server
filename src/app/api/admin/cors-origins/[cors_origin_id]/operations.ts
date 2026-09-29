import "server-only";

import { z } from "@/lib/zod-openapi";
import { defineOperation } from "@/lib/api/define-operation";
import { adminAuth } from "@/lib/api/auth-schemes";
import { internalError } from "@/lib/api/errors";
import { uuidParam } from "@/lib/api/params";
import { errorResponses, messageResponse } from "@/lib/api/responses";
import { OPENAPI_TAGS } from "@/lib/api/tags";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { CorsOriginsRegistry } from "@/lib/mail-db/CorsOriginsRegistry";

export const removeCorsOrigin = defineOperation({
  method: "delete",
  path: "/api/admin/cors-origins/{cors_origin_id}",
  operationId: "removeCorsOrigin",
  tags: [OPENAPI_TAGS.adminCors],
  summary: "Remove an allowed CORS origin",
  auth: adminAuth(),
  request: {
    params: z.object({
      cors_origin_id: uuidParam(
        "cors_origin_id",
        "ID of the allowed-origin entry.",
      ),
    }),
  },
  responses: {
    200: messageResponse("The origin was removed."),
    ...errorResponses({ 500: "Failed to remove the CORS origin." }),
  },
  handler: async (ctx) => {
    const { cors_origin_id } = ctx.params;
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new CorsOriginsRegistry(dbh);
      await registry.removeOrigin(cors_origin_id);
    } catch (e: unknown) {
      console.error("Failed to remove allowed CORS origin: ", e);
      throw internalError("Failed to remove allowed CORS origin!");
    }

    return ctx.json(200, {
      success: true,
      message: `Successfully removed allowed CORS origin with ID: '${cors_origin_id}'.`,
    });
  },
});
