import "server-only";

import { handle } from "hono/vercel";
import { createRouteApp } from "@/lib/hono/create-route-app";
import { runWithAdminGuard } from "@/lib/hono/admin-guard";
import { jsonData } from "@/lib/hono/responses";
import { EmailTemplatesCatalog } from "@/lib/EmailTemplatesCatalog";

const app = createRouteApp("/api/admin/templates");

app.get("/", (c) =>
  runWithAdminGuard(c, async () => {
    const templateIds = Object.keys(EmailTemplatesCatalog);
    return jsonData(c, templateIds);
  }),
);

export const GET = handle(app);
