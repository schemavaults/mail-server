import "server-only";

import { type NextRequest, NextResponse } from "next/server";
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
 * Public, unauthenticated route serving the white-label branding assets
 * (logo and favicon). Uploaded assets come from the BRANDING_ASSETS table;
 * kinds without an upload redirect to the bundled default asset.
 */
export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/branding/[asset_kind]">,
): Promise<NextResponse> {
  const { asset_kind: rawAssetKind } = await ctx.params;

  const parsedKind = brandingAssetKindSchema.safeParse(rawAssetKind);
  if (!parsedKind.success) {
    return NextResponse.json(
      {
        success: false,
        message: `Unknown branding asset kind '${rawAssetKind}'.`,
      },
      { status: 404 },
    );
  }
  const asset_kind = parsedKind.data;

  const fallback = () =>
    NextResponse.redirect(new URL(DEFAULT_ASSET_PATHS[asset_kind], req.url), {
      status: 307,
      headers: {
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
    return new NextResponse(new Uint8Array(bytes), {
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
}
