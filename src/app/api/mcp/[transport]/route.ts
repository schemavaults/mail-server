import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { withAdminApiRouteGuard } from "@/lib/withAdminRouteGuard";
import { createMailServerMcpHandler } from "@/lib/mcp/createMailServerMcpHandler";

async function handle(req: NextRequest): Promise<NextResponse> {
  const protected_route = await withAdminApiRouteGuard(
    async function mcp_handler({ req, dbh }): Promise<NextResponse> {
      const mcp = createMailServerMcpHandler({ dbh });
      const response = await mcp(req);
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    },
  );
  return protected_route(req);
}

export { handle as GET, handle as POST, handle as DELETE };
