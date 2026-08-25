import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/zod-openapi";
import { adminAuthSecurity, jsonRequestBody, OPENAPI_TAGS } from "@/lib/openapi";

// This route's error envelope predates the shared { success, message }
// shape — it uses `error` instead.
const previewErrorSchema = z
  .object({
    success: z.literal(false),
    error: z.string(),
  })
  .openapi("TemplatePreviewErrorResponse");

const previewBodySchema = z
  .object({
    template_id: z.string().openapi({
      description: "Template to render.",
      example: "mailing-list-confirmation",
    }),
    props: z
      .record(z.string(), z.unknown())
      .optional()
      .openapi({
        description:
          "Props passed to the template component. Non-object values are treated as {}.",
      }),
  })
  .openapi("TemplatePreviewRequestBody");

const htmlResponse = {
  description: "The rendered template HTML.",
  content: {
    "text/html": {
      schema: z.string().openapi({ example: "<html>...</html>" }),
    },
  },
};

const errorResponse = {
  description: "Unknown template, invalid props, or invalid request.",
  content: { "application/json": { schema: previewErrorSchema } },
};

export function registerTemplatePreviewPaths(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: "get",
    path: "/api/admin/templates/preview",
    tags: [OPENAPI_TAGS.adminTemplates],
    summary: "Preview a template with sample props",
    security: adminAuthSecurity,
    request: {
      query: z.object({
        template_id: z.string().openapi({
          param: { name: "template_id", in: "query", required: true },
          description: "Template to render with its bundled sample props.",
        }),
      }),
    },
    responses: {
      200: htmlResponse,
      400: errorResponse,
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/admin/templates/preview",
    tags: [OPENAPI_TAGS.adminTemplates],
    summary: "Preview a template with custom props",
    security: adminAuthSecurity,
    request: { body: jsonRequestBody(previewBodySchema) },
    responses: {
      200: htmlResponse,
      400: errorResponse,
    },
  });
}
