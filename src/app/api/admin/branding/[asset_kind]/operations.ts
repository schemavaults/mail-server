import "server-only";

import { z } from "@/lib/zod-openapi";
import { defineOperation } from "@/lib/api/define-operation";
import { adminAuth } from "@/lib/api/auth-schemes";
import { badRequest, internalError } from "@/lib/api/errors";
import {
  dataMessageResponse,
  errorResponses,
  messageResponse,
} from "@/lib/api/responses";
import { OPENAPI_TAGS } from "@/lib/api/tags";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { BrandingAssetsRegistry } from "@/lib/mail-db";
import {
  brandingAssetContentTypeSchema,
  brandingAssetKindSchema,
  brandingAssetMetadataSchema,
  MAX_BRANDING_ASSET_BYTES,
  type BrandingAssetMetadata,
} from "@/lib/mail-db/branding-assets-table";

const params = z.object({ asset_kind: brandingAssetKindSchema });

/** Documents the multipart form; the handler parses it itself. */
const uploadFormSchema = z
  .object({
    file: z.string().openapi({
      format: "binary",
      description: "The image file (png, jpeg, webp, svg, or ico).",
    }),
  })
  .openapi("BrandingAssetUploadForm");

/**
 * Upload a custom branding asset (logo or favicon) as multipart form data
 * with the image under the `file` field. Replaces any previously uploaded
 * asset of the same kind.
 */
export const uploadBrandingAsset = defineOperation({
  method: "put",
  path: "/api/admin/branding/{asset_kind}",
  operationId: "uploadBrandingAsset",
  tags: [OPENAPI_TAGS.adminBranding],
  summary: "Upload a custom branding asset",
  description:
    "Multipart form upload with the image under the `file` field (max 1MB). Replaces any previously uploaded asset of the same kind.",
  auth: adminAuth(),
  request: {
    params,
    body: {
      contentType: "multipart/form-data",
      schema: uploadFormSchema,
      // The file's type and size checks below produce specific messages.
      documentOnly: true,
    },
  },
  responses: {
    200: dataMessageResponse(
      "The asset was uploaded.",
      brandingAssetMetadataSchema,
    ),
    ...errorResponses({
      400: "Unknown asset kind, missing file field, unsupported image type, or oversized image.",
      500: "Failed to store the asset.",
    }),
  },
  handler: async (ctx) => {
    const { asset_kind } = ctx.params;

    let candidate: FormDataEntryValue | null;
    try {
      const formData = await ctx.request.formData();
      candidate = formData.get("file");
    } catch (e: unknown) {
      console.error("Failed to parse branding asset upload body: ", e);
      throw badRequest("Failed to parse upload request body!");
    }
    if (!(candidate instanceof File)) {
      throw badRequest("Expected multipart form data with a 'file' field.");
    }
    const file: File = candidate;

    const parsedContentType = brandingAssetContentTypeSchema.safeParse(
      file.type,
    );
    if (!parsedContentType.success) {
      throw badRequest(
        `Unsupported image type '${file.type}'. Supported types: ${brandingAssetContentTypeSchema.options.join(", ")}.`,
      );
    }

    if (file.size <= 0 || file.size > MAX_BRANDING_ASSET_BYTES) {
      throw badRequest(
        `Image must be between 1 byte and ${Math.floor(MAX_BRANDING_ASSET_BYTES / 1024)}KB.`,
      );
    }

    let metadata: BrandingAssetMetadata;
    try {
      const data_base64 = Buffer.from(await file.arrayBuffer()).toString(
        "base64",
      );
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new BrandingAssetsRegistry(dbh);
      metadata = await registry.upsertAsset({
        asset_kind,
        content_type: parsedContentType.data,
        data_base64,
        updated_by_user_id: ctx.auth.user.uid,
      });
    } catch (e: unknown) {
      console.error(`Failed to store custom ${asset_kind}: `, e);
      throw internalError(`Failed to store custom ${asset_kind}!`);
    }

    return ctx.json(200, {
      success: true,
      data: metadata,
      message: `Successfully uploaded custom ${asset_kind}.`,
    });
  },
});

/**
 * Remove a previously uploaded branding asset, reverting the app to the
 * bundled default asset for that kind.
 */
export const removeBrandingAsset = defineOperation({
  method: "delete",
  path: "/api/admin/branding/{asset_kind}",
  operationId: "removeBrandingAsset",
  tags: [OPENAPI_TAGS.adminBranding],
  summary: "Remove a custom branding asset",
  description: "Reverts the app to the bundled default asset for the kind.",
  auth: adminAuth(),
  request: { params },
  responses: {
    200: messageResponse("The custom asset was removed."),
    ...errorResponses({ 500: "Failed to remove the asset." }),
  },
  handler: async (ctx) => {
    const { asset_kind } = ctx.params;
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new BrandingAssetsRegistry(dbh);
      await registry.removeAsset(asset_kind);
    } catch (e: unknown) {
      console.error(`Failed to remove custom ${asset_kind}: `, e);
      throw internalError(`Failed to remove custom ${asset_kind}!`);
    }
    return ctx.json(200, {
      success: true,
      message: `Removed custom ${asset_kind}; the default asset will be used.`,
    });
  },
});
