import "server-only";

import { handle } from "hono/vercel";
import type { Context } from "hono";
import { createRouteApp } from "@/lib/hono/create-route-app";
import { runWithApiKeyOrAdminGuard } from "@/lib/hono/admin-guard";
import { internalServerError, jsonData } from "@/lib/hono/responses";
import { EmailTemplatesCatalog } from "@/lib/EmailTemplatesCatalog";

interface TemplateListItem {
  id: string;
  description: string;
}

async function loadTemplateList(c: Context): Promise<Response> {
  try {
    const entries: TemplateListItem[] = await Promise.all(
      Object.values(EmailTemplatesCatalog).map(async (load) => {
        const EntryClass = await load();
        const entry = new EntryClass();
        return { id: entry.id, description: entry.description };
      }),
    );
    return jsonData(c, entries);
  } catch (e: unknown) {
    console.error("Failed to list email templates: ", e);
    return internalServerError(c, "Failed to list email templates!");
  }
}

const app = createRouteApp("/api/templates");

// Accepts either a mail-server API key or an admin JWT — mirrors /api/send.
app.get("/", (c) =>
  runWithApiKeyOrAdminGuard(c, async () => await loadTemplateList(c)),
);

export const GET = handle(app);
