import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/zod-openapi";
import {
  jsonResponse,
  errorResponses,
  successDataResponseSchema,
  adminOrApiKeySecurity,
  OPENAPI_TAGS,
} from "@/lib/openapi";

export const emailTemplateListItemSchema = z
  .object({
    id: z.string().openapi({
      description:
        "Template name, usable as `message.template_id` in POST /api/send.",
      example: "mailing-list-confirmation",
    }),
    description: z.string(),
  })
  .openapi("EmailTemplateListItem");

export function registerTemplatesPaths(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: "get",
    path: "/api/templates",
    tags: [OPENAPI_TAGS.templates],
    summary: "List available email templates",
    description:
      "Lists the react-email templates in this server's catalog. Accepts either a mail-server API key or an admin JWT.",
    security: adminOrApiKeySecurity,
    responses: {
      200: jsonResponse(
        "The template catalog.",
        successDataResponseSchema(z.array(emailTemplateListItemSchema)),
      ),
      ...errorResponses({
        401: "Missing or invalid credentials.",
        500: "Failed to list email templates.",
      }),
    },
  });
}
