import "server-only";

import { z } from "@/lib/zod-openapi";
import { defineOperation } from "@/lib/api/define-operation";
import { apiKeyOrAdminAuth } from "@/lib/api/auth-schemes";
import { internalError } from "@/lib/api/errors";
import { dataResponse, errorResponses } from "@/lib/api/responses";
import { OPENAPI_TAGS } from "@/lib/api/tags";
import { EmailTemplatesCatalog } from "@/lib/EmailTemplatesCatalog";

const emailTemplateListItemSchema = z
  .object({
    id: z.string().openapi({
      description:
        "Template name, usable as `message.template_id` in POST /api/send.",
      example: "mailing-list-confirmation",
    }),
    description: z.string(),
  })
  .openapi("EmailTemplateListItem");

type EmailTemplateListItem = z.infer<typeof emailTemplateListItemSchema>;

// Accepts either a mail-server API key or an admin access token — mirrors
// /api/send.
export const listEmailTemplates = defineOperation({
  method: "get",
  path: "/api/templates",
  operationId: "listEmailTemplates",
  tags: [OPENAPI_TAGS.templates],
  summary: "List available email templates",
  description:
    "Lists the react-email templates in this server's catalog. Accepts either a mail-server API key or an admin access token.",
  auth: apiKeyOrAdminAuth(
    "Any valid mail-server API key may list templates.",
  ),
  responses: {
    200: dataResponse(
      "The template catalog.",
      z.array(emailTemplateListItemSchema),
    ),
    ...errorResponses({ 500: "Failed to list email templates." }),
  },
  handler: async (ctx) => {
    let entries: EmailTemplateListItem[];
    try {
      entries = await Promise.all(
        Object.values(EmailTemplatesCatalog).map(async (load) => {
          const EntryClass = await load();
          const entry = new EntryClass();
          return { id: entry.id, description: entry.description };
        }),
      );
    } catch (e: unknown) {
      console.error("Failed to list email templates: ", e);
      throw internalError("Failed to list email templates!");
    }
    return ctx.json(200, { success: true, data: entries });
  },
});
