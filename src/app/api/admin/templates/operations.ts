import "server-only";

import { z } from "@/lib/zod-openapi";
import { defineOperation } from "@/lib/api/define-operation";
import { adminAuth } from "@/lib/api/auth-schemes";
import { dataResponse } from "@/lib/api/responses";
import { OPENAPI_TAGS } from "@/lib/api/tags";
import { EmailTemplatesCatalog } from "@/lib/EmailTemplatesCatalog";

export const listTemplateIds = defineOperation({
  method: "get",
  path: "/api/admin/templates",
  operationId: "listTemplateIds",
  tags: [OPENAPI_TAGS.adminTemplates],
  summary: "List email template IDs",
  auth: adminAuth(),
  responses: {
    200: dataResponse(
      "The template IDs in this server's catalog.",
      z.array(z.string()),
    ),
  },
  handler: (ctx) =>
    ctx.json(200, { success: true, data: Object.keys(EmailTemplatesCatalog) }),
});
