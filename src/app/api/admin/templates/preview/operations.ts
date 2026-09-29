import "server-only";

import { z } from "@/lib/zod-openapi";
import { defineOperation } from "@/lib/api/define-operation";
import { adminAuth } from "@/lib/api/auth-schemes";
import { badRequest } from "@/lib/api/errors";
import { errorResponses } from "@/lib/api/responses";
import { OPENAPI_TAGS } from "@/lib/api/tags";
import EmailTemplatesCatalog, {
  isValidTemplateId,
} from "@/lib/EmailTemplatesCatalog";
import sampleEmailTemplateProps from "@/lib/EmailTemplatesCatalog/sampleProps";
import { render } from "@react-email/render";
import type { ReactElement } from "react";

const INVALID_TEMPLATE_ID_MESSAGE = "Invalid or missing template_id";

const previewBodySchema = z
  .object({
    template_id: z.string().openapi({
      description: "Template to render.",
      example: "mailing-list-confirmation",
    }),
    props: z.unknown().optional().openapi({
      description:
        "Props (a JSON object) passed to the template component. Non-object values are treated as {}.",
    }),
  })
  .openapi("TemplatePreviewRequestBody");

const htmlResponse = {
  description: "The rendered template HTML.",
  contentType: "text/html",
  schema: z.string().openapi({ example: "<html>...</html>" }),
} as const;

const previewErrorResponses = errorResponses({
  400: "Unknown template, invalid props, or an invalid request.",
});

/** Renders a catalog template, throwing a 400 for unknown ids / bad props. */
async function renderTemplateToHtml(
  templateId: string,
  props: Record<string, unknown>,
): Promise<Response> {
  if (!isValidTemplateId(templateId)) {
    throw badRequest(INVALID_TEMPLATE_ID_MESSAGE, "invalid_template_id");
  }

  const catalogEntryLoader = EmailTemplatesCatalog[templateId];
  const CatalogEntry = await catalogEntryLoader();
  const template = new CatalogEntry();

  let html: string;
  try {
    const rendered = (await template.renderTemplate(
      props as any,
    )) as ReactElement;
    html = await render(rendered);
  } catch (e: unknown) {
    throw badRequest(
      e instanceof Error ? e.message : "Failed to render template",
      "template_render_failed",
    );
  }

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export const previewTemplateWithSampleProps = defineOperation({
  method: "get",
  path: "/api/admin/templates/preview",
  operationId: "previewTemplateWithSampleProps",
  tags: [OPENAPI_TAGS.adminTemplates],
  summary: "Preview a template with sample props",
  auth: adminAuth(),
  request: {
    query: z.object({
      template_id: z.string().min(1, INVALID_TEMPLATE_ID_MESSAGE).openapi({
        description: "Template to render with its bundled sample props.",
        example: "mailing-list-confirmation",
      }),
    }),
  },
  responses: {
    200: htmlResponse,
    ...previewErrorResponses,
  },
  handler: async (ctx) => {
    const { template_id } = ctx.query;
    const props =
      (sampleEmailTemplateProps as Record<string, Record<string, unknown>>)[
        template_id
      ] ?? {};
    return await renderTemplateToHtml(template_id, props);
  },
});

export const previewTemplate = defineOperation({
  method: "post",
  path: "/api/admin/templates/preview",
  operationId: "previewTemplate",
  tags: [OPENAPI_TAGS.adminTemplates],
  summary: "Preview a template with custom props",
  auth: adminAuth(),
  request: {
    body: {
      contentType: "application/json",
      schema: previewBodySchema,
      lenientContentType: true,
    },
  },
  responses: {
    200: htmlResponse,
    ...previewErrorResponses,
  },
  handler: async (ctx) => {
    const { template_id, props } = ctx.body;
    const propsObject: Record<string, unknown> =
      props && typeof props === "object" && !Array.isArray(props)
        ? (props as Record<string, unknown>)
        : {};
    return await renderTemplateToHtml(template_id, propsObject);
  },
});
