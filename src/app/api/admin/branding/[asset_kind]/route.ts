import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { withAdminApiRouteGuard } from "@/lib/withAdminRouteGuard";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { BrandingAssetsRegistry } from "@/lib/mail-db";
import {
  brandingAssetContentTypeSchema,
  brandingAssetKindSchema,
  MAX_BRANDING_ASSET_BYTES,
  type BrandingAssetMetadata,
} from "@/lib/mail-db/branding-assets-table";

interface UploadSuccessResponse {
  success: true;
  data: BrandingAssetMetadata;
  message: string;
}

interface RemoveSuccessResponse {
  success: true;
  message: string;
}

interface ErrorResponse {
  success: false;
  message: string;
}

/**
 * Upload a custom branding asset (logo or favicon) as multipart form data
 * with the image under the `file` field. Replaces any previously uploaded
 * asset of the same kind.
 */
export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/admin/branding/[asset_kind]">,
): Promise<NextResponse> {
  const { asset_kind: rawAssetKind } = await ctx.params;

  const protected_route = await withAdminApiRouteGuard(
    async function PUT_handler({ req, user }): Promise<NextResponse> {
      const parsedKind = brandingAssetKindSchema.safeParse(rawAssetKind);
      if (!parsedKind.success) {
        return NextResponse.json(
          {
            success: false,
            message: `Unknown branding asset kind '${rawAssetKind}'.`,
          } satisfies ErrorResponse,
          { status: 404 },
        );
      }
      const asset_kind = parsedKind.data;

      let file: File;
      try {
        const formData = await req.formData();
        const candidate = formData.get("file");
        if (!(candidate instanceof File)) {
          return NextResponse.json(
            {
              success: false,
              message: "Expected multipart form data with a 'file' field.",
            } satisfies ErrorResponse,
            { status: 400 },
          );
        }
        file = candidate;
      } catch (e: unknown) {
        console.error("Failed to parse branding asset upload body: ", e);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to parse upload request body!",
          } satisfies ErrorResponse,
          { status: 400 },
        );
      }

      const parsedContentType = brandingAssetContentTypeSchema.safeParse(
        file.type,
      );
      if (!parsedContentType.success) {
        return NextResponse.json(
          {
            success: false,
            message: `Unsupported image type '${file.type}'. Supported types: ${brandingAssetContentTypeSchema.options.join(", ")}.`,
          } satisfies ErrorResponse,
          { status: 400 },
        );
      }

      if (file.size <= 0 || file.size > MAX_BRANDING_ASSET_BYTES) {
        return NextResponse.json(
          {
            success: false,
            message: `Image must be between 1 byte and ${Math.floor(MAX_BRANDING_ASSET_BYTES / 1024)}KB.`,
          } satisfies ErrorResponse,
          { status: 400 },
        );
      }

      try {
        const data_base64 = Buffer.from(await file.arrayBuffer()).toString(
          "base64",
        );
        await using dbh = ServerlessDatabase.getAsyncResource();
        const registry = new BrandingAssetsRegistry(dbh);
        const metadata = await registry.upsertAsset({
          asset_kind,
          content_type: parsedContentType.data,
          data_base64,
          updated_by_user_id: user.uid,
        });
        return NextResponse.json(
          {
            success: true,
            data: metadata,
            message: `Successfully uploaded custom ${asset_kind}.`,
          } satisfies UploadSuccessResponse,
          { status: 200 },
        );
      } catch (e: unknown) {
        console.error(`Failed to store custom ${asset_kind}: `, e);
        return NextResponse.json(
          {
            success: false,
            message: `Failed to store custom ${asset_kind}!`,
          } satisfies ErrorResponse,
          { status: 500 },
        );
      }
    },
  );
  return await protected_route(req);
}

/**
 * Remove a previously uploaded branding asset, reverting the app to the
 * bundled default asset for that kind.
 */
export async function DELETE(
  req: NextRequest,
  ctx: RouteContext<"/api/admin/branding/[asset_kind]">,
): Promise<NextResponse> {
  const { asset_kind: rawAssetKind } = await ctx.params;

  const protected_route = await withAdminApiRouteGuard(
    async function DELETE_handler(): Promise<NextResponse> {
      const parsedKind = brandingAssetKindSchema.safeParse(rawAssetKind);
      if (!parsedKind.success) {
        return NextResponse.json(
          {
            success: false,
            message: `Unknown branding asset kind '${rawAssetKind}'.`,
          } satisfies ErrorResponse,
          { status: 404 },
        );
      }
      const asset_kind = parsedKind.data;

      try {
        await using dbh = ServerlessDatabase.getAsyncResource();
        const registry = new BrandingAssetsRegistry(dbh);
        await registry.removeAsset(asset_kind);
        return NextResponse.json(
          {
            success: true,
            message: `Removed custom ${asset_kind}; the default asset will be used.`,
          } satisfies RemoveSuccessResponse,
          { status: 200 },
        );
      } catch (e: unknown) {
        console.error(`Failed to remove custom ${asset_kind}: `, e);
        return NextResponse.json(
          {
            success: false,
            message: `Failed to remove custom ${asset_kind}!`,
          } satisfies ErrorResponse,
          { status: 500 },
        );
      }
    },
  );
  return await protected_route(req);
}
