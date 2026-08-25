import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/zod-openapi";
import { errorResponses, OPENAPI_TAGS } from "@/lib/openapi";
import { brandingAssetKindSchema } from "@/lib/mail-db/branding-assets-table";

export function registerBrandingAssetPaths(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: "get",
    path: "/api/branding/{asset_kind}",
    tags: [OPENAPI_TAGS.branding],
    summary: "Serve a branding asset (logo or favicon)",
    description:
      "Public, unauthenticated. Serves the admin-uploaded asset for the kind; kinds without an upload (or with the database unreachable) redirect to the bundled default asset.",
    request: {
      params: z.object({
        asset_kind: brandingAssetKindSchema.openapi({
          param: { name: "asset_kind", in: "path", required: true },
        }),
      }),
    },
    responses: {
      200: {
        description: "The uploaded asset's image bytes.",
        content: {
          "image/*": {
            schema: z.string().openapi({ format: "binary" }),
          },
        },
      },
      307: {
        description:
          "Redirect to the bundled default asset for this kind (no custom upload).",
      },
      ...errorResponses({ 404: "Unknown branding asset kind." }),
    },
  });
}
