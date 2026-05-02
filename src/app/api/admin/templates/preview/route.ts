import "server-only";

import { withAdminApiRouteGuard } from "@/lib/withAdminRouteGuard";
import EmailTemplatesCatalog, {
  isValidTemplateId,
} from "@/lib/EmailTemplatesCatalog";
import sampleEmailTemplateProps from "@/lib/EmailTemplatesCatalog/sampleProps";
import { render } from "@react-email/render";
import { type NextRequest, NextResponse } from "next/server";
import type { ReactElement } from "react";

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

export async function GET(req: NextRequest): Promise<NextResponse> {
  const protected_route = await withAdminApiRouteGuard(
    async function GET_handler({ req }): Promise<NextResponse> {
      const templateId = req.nextUrl.searchParams.get("template_id");
      if (!templateId) {
        return NextResponse.json(
          { success: false, error: "Invalid or missing template_id" },
          { status: 400 },
        );
      }

      const props =
        (sampleEmailTemplateProps as Record<string, Record<string, unknown>>)[
          templateId
        ] ?? {};
      const result = await renderTemplateToHtml(templateId, props);
      if (!result.ok) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: result.status },
        );
      }

      return new NextResponse(result.html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    },
  );
  return await protected_route(req);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const protected_route = await withAdminApiRouteGuard(
    async function POST_handler({ req }): Promise<NextResponse> {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json(
          { success: false, error: "Request body must be valid JSON." },
          { status: 400 },
        );
      }

      if (typeof body !== "object" || body === null) {
        return NextResponse.json(
          { success: false, error: "Request body must be a JSON object." },
          { status: 400 },
        );
      }

      const { template_id, props } = body as {
        template_id?: unknown;
        props?: unknown;
      };

      if (typeof template_id !== "string") {
        return NextResponse.json(
          { success: false, error: "Missing or invalid 'template_id'." },
          { status: 400 },
        );
      }

      const propsObject: Record<string, unknown> =
        props && typeof props === "object" && !Array.isArray(props)
          ? (props as Record<string, unknown>)
          : {};

      const result = await renderTemplateToHtml(template_id, propsObject);
      if (!result.ok) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: result.status },
        );
      }

      return new NextResponse(result.html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    },
  );
  return await protected_route(req);
}
