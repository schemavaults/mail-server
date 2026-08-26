import "server-only";

import { handle } from "hono/vercel";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { createRouteApp } from "@/lib/hono/create-route-app";
import { runWithAdminGuard } from "@/lib/hono/admin-guard";
import EmailTemplatesCatalog, {
  isValidTemplateId,
} from "@/lib/EmailTemplatesCatalog";
import sampleEmailTemplateProps from "@/lib/EmailTemplatesCatalog/sampleProps";
import { render } from "@react-email/render";
import type { ReactElement } from "react";

// This route's error envelope predates the shared `{ success, message }`
// shape — it uses `error` instead of `message`, and the admin template
// preview UI depends on it. Keep it bespoke.
function previewError(
  c: Context,
  status: ContentfulStatusCode,
  error: string,
): Response {
  return c.json({ success: false, error }, status);
}

function htmlResponse(c: Context, html: string): Response {
  return c.body(html, 200, {
    "Content-Type": "text/html; charset=utf-8",
  });
}

async function renderTemplateToHtml(
  templateId: string,
  props: Record<string, unknown>,
): Promise<{ ok: true; html: string } | { ok: false; status: number; error: string }> {
  if (!isValidTemplateId(templateId)) {
    return { ok: false, status: 400, error: "Invalid or missing template_id" };
  }

  const catalogEntryLoader = EmailTemplatesCatalog[templateId];
  const CatalogEntry = await catalogEntryLoader();
  const template = new CatalogEntry();

  try {
    const rendered = (await template.renderTemplate(
      props as any,
    )) as ReactElement;
    const html = await render(rendered);
    return { ok: true, html };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to render template";
    return { ok: false, status: 400, error: message };
  }
}

const app = createRouteApp("/api/admin/templates/preview");

app.get("/", (c) =>
  runWithAdminGuard(c, async () => {
    const templateId = c.req.query("template_id");
    if (!templateId) {
      return previewError(c, 400, "Invalid or missing template_id");
    }

    const props =
      (sampleEmailTemplateProps as Record<string, Record<string, unknown>>)[
        templateId
      ] ?? {};
    const result = await renderTemplateToHtml(templateId, props);
    if (!result.ok) {
      return previewError(
        c,
        result.status as ContentfulStatusCode,
        result.error,
      );
    }

    return htmlResponse(c, result.html);
  }),
);

app.post("/", (c) =>
  runWithAdminGuard(c, async () => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return previewError(c, 400, "Request body must be valid JSON.");
    }

    if (typeof body !== "object" || body === null) {
      return previewError(c, 400, "Request body must be a JSON object.");
    }

    const { template_id, props } = body as {
      template_id?: unknown;
      props?: unknown;
    };

    if (typeof template_id !== "string") {
      return previewError(c, 400, "Missing or invalid 'template_id'.");
    }

    const propsObject: Record<string, unknown> =
      props && typeof props === "object" && !Array.isArray(props)
        ? (props as Record<string, unknown>)
        : {};

    const result = await renderTemplateToHtml(template_id, propsObject);
    if (!result.ok) {
      return previewError(
        c,
        result.status as ContentfulStatusCode,
        result.error,
      );
    }

    return htmlResponse(c, result.html);
  }),
);

export const GET = handle(app);
export const POST = handle(app);
