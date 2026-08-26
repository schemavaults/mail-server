import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/zod-openapi";
import {
  jsonResponse,
  messageResponse,
  errorResponses,
  successDataMessageResponseSchema,
  adminAuthSecurity,
  OPENAPI_TAGS,
} from "@/lib/openapi";
import {
  brandingAssetKindSchema,
  brandingAssetMetadataSchema,
} from "@/lib/mail-db/branding-assets-table";

export function registerAdminBrandingPaths(registry: OpenAPIRegistry): void {
  const params = z.object({
    asset_kind: brandingAssetKindSchema.openapi({
      param: { name: "asset_kind", in: "path", required: true },
    }),
  });

  registry.registerPath({
    method: "put",
    path: "/api/admin/branding/{asset_kind}",
    tags: [OPENAPI_TAGS.adminBranding],
    summary: "Upload a custom branding asset",
    description:
      "Multipart form upload with the image under the `file` field (max 1MB). Replaces any previously uploaded asset of the same kind.",
    security: adminAuthSecurity,
    request: {
      params,
      body: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: z
              .object({
                file: z.string().openapi({
                  format: "binary",
                  description:
                    "The image file (png, jpeg, webp, svg, or ico).",
                }),
              })
              .openapi("BrandingAssetUploadForm"),
          },
        },
      },
    },
    responses: {
      200: jsonResponse(
        "The asset was uploaded.",
        successDataMessageResponseSchema(brandingAssetMetadataSchema),
      ),
      ...errorResponses({
        400: "Missing file field, unsupported image type, or oversized image.",
        401: "Missing or invalid admin credentials.",
        404: "Unknown branding asset kind.",
        500: "Failed to store the asset.",
      }),
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/api/admin/branding/{asset_kind}",
    tags: [OPENAPI_TAGS.adminBranding],
    summary: "Remove a custom branding asset",
    description:
      "Reverts the app to the bundled default asset for the kind.",
    security: adminAuthSecurity,
    request: { params },
    responses: {
      200: messageResponse("The custom asset was removed."),
      ...errorResponses({
        401: "Missing or invalid admin credentials.",
        404: "Unknown branding asset kind.",
        500: "Failed to remove the asset.",
      }),
    },
  });
}
