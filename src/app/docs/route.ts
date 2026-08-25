import "server-only";

import { handle } from "hono/vercel";
import { createRouteApp } from "@/lib/hono/create-route-app";
import { getBrandConfig } from "@/lib/branding";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * Interactive API reference for /api/openapi.json, rendered with Scalar's
 * standalone browser bundle. The page itself is a tiny server-rendered HTML
 * shell; the OpenAPI document is fetched client-side from this same origin,
 * and a plain link to the raw JSON is kept for no-JS (or no-CDN) contexts.
 */
function renderDocsPage(): string {
  const brand = getBrandConfig();
  const title = escapeHtml(`${brand.name} Mail Server API Reference`);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="icon" href="/api/branding/favicon" />
    <meta name="robots" content="noindex" />
    <style>
      body { margin: 0; }
      .raw-spec-fallback { font-family: system-ui, sans-serif; padding: 1rem; }
    </style>
  </head>
  <body>
    <noscript>
      <p class="raw-spec-fallback">
        JavaScript is disabled — read the raw OpenAPI document at
        <a href="/api/openapi.json">/api/openapi.json</a>.
      </p>
    </noscript>
    <div id="app"></div>
    <script
      id="api-reference"
      data-url="/api/openapi.json"
      data-configuration='{"theme":"default"}'
    ></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>
`;
}

const app = createRouteApp("/docs");

// The shell only depends on env-derived branding — render it once, lazily.
let cachedHtml: string | null = null;

app.get("/", (c) => {
  cachedHtml ??= renderDocsPage();
  return c.html(cachedHtml);
});

export const GET = handle(app);
