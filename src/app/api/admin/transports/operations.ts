import "server-only";

import { z } from "@/lib/zod-openapi";
import { defineOperation } from "@/lib/api/define-operation";
import { adminAuth } from "@/lib/api/auth-schemes";
import { internalError } from "@/lib/api/errors";
import { dataResponse, errorResponses } from "@/lib/api/responses";
import { OPENAPI_TAGS } from "@/lib/api/tags";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { loadTransportStatuses } from "./load-transport-statuses";
import {
  transportStatusSchema,
  type TransportStatus,
} from "./transport-status-schema";

export const listTransports = defineOperation({
  method: "get",
  path: "/api/admin/transports",
  operationId: "listTransports",
  tags: [OPENAPI_TAGS.adminTransports],
  summary: "List mail transports with configured/default status",
  auth: adminAuth(),
  responses: {
    200: dataResponse(
      "The transports this server knows about.",
      z.array(transportStatusSchema),
    ),
    ...errorResponses({
      500: "Failed to resolve mail transport availability.",
    }),
  },
  handler: async (ctx) => {
    let data: TransportStatus[];
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      data = await loadTransportStatuses(dbh);
    } catch (e: unknown) {
      console.error("Failed to resolve mail transport availability: ", e);
      throw internalError("Failed to resolve mail transport availability!");
    }
    return ctx.json(200, { success: true, data });
  },
});
