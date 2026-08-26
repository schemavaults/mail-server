import "server-only";

import { handle } from "hono/vercel";
import { createRouteApp } from "@/lib/hono/create-route-app";
import { notFoundError } from "@/lib/hono/responses";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { BrandingAssetsRegistry } from "@/lib/mail-db";
import {
  brandingAssetKindSchema,
  type BrandingAssetKind,
} from "@/lib/mail-db/branding-assets-table";

/**
 * Bundled default assets served when no custom asset has been uploaded for a
 * kind (or when the database is unreachable).
 */
const DEFAULT_ASSET_PATHS: Record<BrandingAssetKind, string> = {
  logo: "/media/logo.png",
  favicon: "/media/favicon.ico",
};

const app = createRouteApp("/api/branding/:asset_kind");

/**
 * Public, unauthenticated route serving the white-label branding assets
 * (logo and favicon). Uploaded assets come from the BRANDING_ASSETS table;
 * kinds without an upload redirect to the bundled default asset.
 */
app.get("/", async (c) => {
  const rawAssetKind = c.req.param("asset_kind");

  const parsedKind = brandingAssetKindSchema.safeParse(rawAssetKind);
  if (!parsedKind.success) {
    return notFoundError(c, `Unknown branding asset kind '${rawAssetKind}'.`);
  }
  const asset_kind = parsedKind.data;

  const fallback = () =>
    new Response(null, {
      status: 307,
      headers: {
        Location: new URL(DEFAULT_ASSET_PATHS[asset_kind], c.req.url).toString(),
        // Keep redirects briefly cacheable so a freshly uploaded asset takes
        // effect quickly.
        "Cache-Control": "public, max-age=60",
      },
    });

  try {
    await using dbh = ServerlessDatabase.getAsyncResource();
    const registry = new BrandingAssetsRegistry(dbh);
    const asset = await registry.getAsset(asset_kind);
    if (!asset) {
      return fallback();
    }
    const bytes = Buffer.from(asset.data_base64, "base64");
    return c.body(new Uint8Array(bytes).buffer as ArrayBuffer, 200, {
      "Content-Type": asset.content_type,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      "X-Content-Type-Options": "nosniff",
      // Uploads may be SVG; make sure any embedded script never executes.
      "Content-Security-Policy":
        "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    });
  } catch (e: unknown) {
    console.error(`Failed to load branding asset '${asset_kind}': `, e);
    return fallback();
  }
});

export const GET = handle(app);
