import type { Insertable, Selectable, Updateable } from "@schemavaults/dbh";
import { z } from "@/lib/zod-openapi";

/**
 * The kinds of white-label assets an admin can upload from /admin/branding.
 * One row is stored per kind; the app falls back to the bundled default
 * asset for kinds without a row.
 */
export const brandingAssetKindSchema = z
  .enum(["logo", "favicon"])
  .openapi("BrandingAssetKind", {
    description: "Kind of white-label branding asset.",
  });

export type BrandingAssetKind = z.infer<typeof brandingAssetKindSchema>;

export const BRANDING_ASSET_KINDS: readonly BrandingAssetKind[] =
  brandingAssetKindSchema.options;

/**
 * MIME types accepted for uploaded branding assets. SVG is allowed but is
 * served with a restrictive Content-Security-Policy so embedded scripts
 * never execute.
 */
export const brandingAssetContentTypeSchema = z
  .enum([
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/svg+xml",
    "image/x-icon",
    "image/vnd.microsoft.icon",
  ])
  .openapi("BrandingAssetContentType", {
    description: "MIME types accepted for uploaded branding assets.",
  });

export type BrandingAssetContentType = z.infer<
  typeof brandingAssetContentTypeSchema
>;

/** Maximum accepted upload size (decoded bytes) for a branding asset. */
export const MAX_BRANDING_ASSET_BYTES = 1024 * 1024;

export const brandingAssetRowSchema = z
  .object({
    asset_kind: brandingAssetKindSchema,
    content_type: brandingAssetContentTypeSchema,
    data_base64: z.string().min(1),
    updated_at: z.number().nonnegative(),
    updated_by_user_id: z.string(),
  })
  .strict()
  .required({
    asset_kind: true,
    content_type: true,
    data_base64: true,
    updated_at: true,
    updated_by_user_id: true,
  });

export type BrandingAssetsTable = z.infer<typeof brandingAssetRowSchema>;

export type BrandingAsset = Selectable<BrandingAssetsTable>;
export type NewBrandingAsset = Insertable<BrandingAssetsTable>;
export type BrandingAssetUpdate = Updateable<BrandingAssetsTable>;

/**
 * Metadata-only view of a branding asset (no payload), safe to preload into
 * admin pages without shipping the base64 blob to the client.
 */
export interface BrandingAssetMetadata {
  asset_kind: BrandingAssetKind;
  content_type: BrandingAssetContentType;
  updated_at: number;
}

/**
 * Schema mirror of {@link BrandingAssetMetadata}, used by the admin branding
 * routes' OpenAPI registrations.
 */
export const brandingAssetMetadataSchema = z
  .object({
    asset_kind: brandingAssetKindSchema,
    content_type: brandingAssetContentTypeSchema,
    updated_at: z.number().nonnegative().openapi({
      description: "Upload time as a Unix timestamp in milliseconds.",
    }),
  })
  .openapi("BrandingAssetMetadata");
