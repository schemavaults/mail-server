import "server-only";

import { handle } from "hono/vercel";
import { createRouteApp } from "@/lib/hono/create-route-app";
import {
  buildOpenApiDocument,
  type OpenApiDocument,
} from "@/lib/openapi/document";

const app = createRouteApp("/api/openapi.json");

// The document only depends on env configuration (branding, HOST), which is
// fixed for the lifetime of the process — build it once, lazily.
let cachedDocument: OpenApiDocument | null = null;

app.get("/", (c) => {
  cachedDocument ??= buildOpenApiDocument();
  return c.json(cachedDocument);
});

export const GET = handle(app);
