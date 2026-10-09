import "server-only";

import { publicAccess } from "@schemavaults/openapi-operations";
import { z } from "@/lib/zod-openapi";
import { defineOperation } from "@/lib/api/define-operation";
import { OPENAPI_TAGS } from "@/lib/api/tags";
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

/**
 * Public, unauthenticated operation serving the white-label branding assets
 * (logo and favicon). Uploaded assets come from the BRANDING_ASSETS table;
 * kinds without an upload redirect to the bundled default asset.
 */
export const getBrandingAsset = defineOperation({
  method: "get",
  path: "/api/branding/{asset_kind}",
  operationId: "getBrandingAsset",
  tags: [OPENAPI_TAGS.branding],
  summary: "Serve a branding asset (logo or favicon)",
  description:
    "Serves the admin-uploaded asset for the kind; kinds without an upload (or with the database unreachable) redirect to the bundled default asset.",
  auth: publicAccess(),
  request: {
    params: z.object({ asset_kind: brandingAssetKindSchema }),
  },
  responses: {
    200: {
      description: "The uploaded asset's image bytes.",
      contentType: "image/*",
      schema: z.string().openapi({ format: "binary" }),
    },
    307: {
      description:
        "Redirect to the bundled default asset for this kind (no custom upload).",
    },
  },
  handler: async (ctx) => {
    const { asset_kind } = ctx.params;

    const fallback = () =>
      new Response(null, {
        status: 307,
        headers: {
          Location: new URL(DEFAULT_ASSET_PATHS[asset_kind], ctx.url).toString(),
          // Keep redirects briefly cacheable so a freshly uploaded asset
          // takes effect quickly.
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
      return new Response(new Uint8Array(bytes), {
        status: 200,
        headers: {
          "Content-Type": asset.content_type,
          "Content-Length": String(bytes.byteLength),
          "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
          "X-Content-Type-Options": "nosniff",
          // Uploads may be SVG; make sure any embedded script never executes.
          "Content-Security-Policy":
            "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        },
      });
    } catch (e: unknown) {
      console.error(`Failed to load branding asset '${asset_kind}': `, e);
      return fallback();
    }
  },
});
