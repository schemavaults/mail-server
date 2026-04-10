import "server-only";
import { createMcpHandler } from "mcp-handler";
import type { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { registerListEmailTemplatesTool } from "./tools/listEmailTemplatesTool";
import { registerSendAdminNotificationTool } from "./tools/sendAdminNotificationTool";

export interface IMailServerMcpContext {
  dbh: ServerlessDatabase;
}

export function createMailServerMcpHandler(
  ctx: IMailServerMcpContext,
): (req: Request) => Promise<Response> {
  return createMcpHandler(
    (server) => {
      registerListEmailTemplatesTool(server);
      registerSendAdminNotificationTool(server, ctx);
    },
    {
      serverInfo: {
        name: "schemavaults-mail-server",
        version: "0.0.51",
      },
    },
    {
      basePath: "/api/mcp",
      maxDuration: 60,
      verboseLogs: process.env.NODE_ENV !== "production",
    },
  );
}
