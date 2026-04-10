import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EmailTemplatesCatalog } from "@/lib/EmailTemplatesCatalog";

export function registerListEmailTemplatesTool(server: McpServer): void {
  server.registerTool(
    "list_email_templates",
    {
      title: "List Email Templates",
      description:
        "Returns every email template registered in the SchemaVaults mail-server catalog, each with a short description of its expected props.",
      inputSchema: {},
    },
    async () => {
      const entries = await Promise.all(
        Object.values(EmailTemplatesCatalog).map(async (load) => {
          const EntryClass = await load();
          const entry = new EntryClass();
          return { id: entry.id, description: entry.description };
        }),
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ templates: entries }, null, 2),
          },
        ],
      };
    },
  );
}
