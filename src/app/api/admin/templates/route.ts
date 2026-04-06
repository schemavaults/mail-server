import "server-only";

import { withAdminApiRouteGuard } from "@/lib/withAdminRouteGuard";
import { EmailTemplatesCatalog } from "@/lib/EmailTemplatesCatalog";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const protected_route = await withAdminApiRouteGuard(
    async function GET_handler(): Promise<NextResponse> {
      const templateIds = Object.keys(EmailTemplatesCatalog);
      return NextResponse.json({ success: true, data: templateIds });
    },
  );
  return await protected_route(req);
}
