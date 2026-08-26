import "server-only";

import { handle } from "hono/vercel";
import { createRouteApp } from "@/lib/hono/create-route-app";
import { runWithAdminGuard } from "@/lib/hono/admin-guard";
import {
  badRequest,
  internalServerError,
  jsonDataMessage,
  jsonMessage,
  notFoundError,
} from "@/lib/hono/responses";
import type { Context } from "hono";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { BrandingAssetsRegistry } from "@/lib/mail-db";
import {
  brandingAssetContentTypeSchema,
  brandingAssetKindSchema,
  MAX_BRANDING_ASSET_BYTES,
  type BrandingAssetKind,
} from "@/lib/mail-db/branding-assets-table";

type ParsedAssetKind =
  | { ok: true; kind: BrandingAssetKind }
  | { ok: false; response: Response };

function parseAssetKind(c: Context): ParsedAssetKind {
  const rawAssetKind = c.req.param("asset_kind");
  const parsedKind = brandingAssetKindSchema.safeParse(rawAssetKind);
  if (!parsedKind.success) {
    return {
      ok: false,
      response: notFoundError(
        c,
        `Unknown branding asset kind '${rawAssetKind}'.`,
      ),
    };
  }
  return { ok: true, kind: parsedKind.data };
}

const app = createRouteApp("/api/admin/branding/:asset_kind");

/**
 * Upload a custom branding asset (logo or favicon) as multipart form data
 * with the image under the `file` field. Replaces any previously uploaded
 * asset of the same kind.
 */
app.put("/", (c) =>
  runWithAdminGuard(c, async ({ user }) => {
    const parsed = parseAssetKind(c);
    if (!parsed.ok) return parsed.response;
    const asset_kind = parsed.kind;

    let file: File;
    try {
      const formData = await c.req.raw.formData();
      const candidate = formData.get("file");
      if (!(candidate instanceof File)) {
        return badRequest(
          c,
          "Expected multipart form data with a 'file' field.",
        );
      }
      file = candidate;
    } catch (e: unknown) {
      console.error("Failed to parse branding asset upload body: ", e);
      return badRequest(c, "Failed to parse upload request body!");
    }

    const parsedContentType = brandingAssetContentTypeSchema.safeParse(
      file.type,
    );
    if (!parsedContentType.success) {
      return badRequest(
        c,
        `Unsupported image type '${file.type}'. Supported types: ${brandingAssetContentTypeSchema.options.join(", ")}.`,
      );
    }

    if (file.size <= 0 || file.size > MAX_BRANDING_ASSET_BYTES) {
      return badRequest(
        c,
        `Image must be between 1 byte and ${Math.floor(MAX_BRANDING_ASSET_BYTES / 1024)}KB.`,
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
      return jsonDataMessage(
        c,
        metadata,
        `Successfully uploaded custom ${asset_kind}.`,
      );
    } catch (e: unknown) {
      console.error(`Failed to store custom ${asset_kind}: `, e);
      return internalServerError(c, `Failed to store custom ${asset_kind}!`);
    }
  }),
);

/**
 * Remove a previously uploaded branding asset, reverting the app to the
 * bundled default asset for that kind.
 */
app.delete("/", (c) =>
  runWithAdminGuard(c, async () => {
    const parsed = parseAssetKind(c);
    if (!parsed.ok) return parsed.response;
    const asset_kind = parsed.kind;

    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new BrandingAssetsRegistry(dbh);
      await registry.removeAsset(asset_kind);
      return jsonMessage(
        c,
        `Removed custom ${asset_kind}; the default asset will be used.`,
      );
    } catch (e: unknown) {
      console.error(`Failed to remove custom ${asset_kind}: `, e);
      return internalServerError(c, `Failed to remove custom ${asset_kind}!`);
    }
  }),
);

export const PUT = handle(app);
export const DELETE = handle(app);
