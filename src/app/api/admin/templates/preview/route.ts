import "server-only";

import { withAdminApiRouteGuard } from "@/lib/withAdminRouteGuard";
import EmailTemplatesCatalog, {
  isValidTemplateId,
} from "@/lib/EmailTemplatesCatalog";
import { render } from "@react-email/render";
import { type NextRequest, NextResponse } from "next/server";
import type { ReactElement } from "react";

const sampleProps: Record<string, Record<string, unknown>> = {
  "my-test-email": { name: "Jane Doe" },
  "password-reset": {
    resetLink: "https://example.com/reset?token=sample-token",
    expiresInMinutes: 30,
  },
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  const protected_route = await withAdminApiRouteGuard(
    async function GET_handler({ req }): Promise<NextResponse> {
      const templateId = req.nextUrl.searchParams.get("template_id");

      if (!templateId || !isValidTemplateId(templateId)) {
        return NextResponse.json(
          { success: false, error: "Invalid or missing template_id" },
          { status: 400 },
        );
      }

      const catalogEntryLoader = EmailTemplatesCatalog[templateId];
      const CatalogEntry = await catalogEntryLoader();
      const template = new CatalogEntry();

      const props = sampleProps[templateId] ?? {};
      const rendered = (await template.renderTemplate(
        props as any,
      )) as ReactElement;
      const html = await render(rendered);

      return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    },
  );
  return await protected_route(req);
}
