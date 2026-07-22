import "server-only";

import type { Kysely } from "@schemavaults/dbh";
import type { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import type { MailDatabase } from "./mail-database-type";
import {
  brandingAssetContentTypeSchema,
  type BrandingAsset,
  type BrandingAssetContentType,
  type BrandingAssetKind,
  type BrandingAssetMetadata,
} from "./branding-assets-table";

export interface UpsertBrandingAssetInput {
  asset_kind: BrandingAssetKind;
  content_type: BrandingAssetContentType;
  data_base64: string;
  updated_by_user_id: string;
}

export class BrandingAssetsRegistry {
  private readonly dbh: ServerlessDatabase;

  private get db(): Kysely<MailDatabase> {
    return this.dbh.db;
  }

  public constructor(dbh: ServerlessDatabase) {
    this.dbh = dbh;
  }

  /**
   * Neon returns BIGINT columns as strings; coerce them to numbers so
   * downstream consumers receive a consistent shape.
   */
  private parseRow(row: BrandingAsset): BrandingAsset {
    return {
      ...row,
      updated_at:
        typeof row.updated_at === "number"
          ? row.updated_at
          : Number.parseInt(row.updated_at as unknown as string),
    };
  }

  public async getAsset(
    asset_kind: BrandingAssetKind,
  ): Promise<BrandingAsset | null> {
    const row = await this.db
      .selectFrom("branding_assets")
      .selectAll()
      .where("asset_kind", "=", asset_kind)
      .executeTakeFirst();
    return row ? this.parseRow(row) : null;
  }

  public async listAssetMetadata(): Promise<readonly BrandingAssetMetadata[]> {
    const rows = await this.db
      .selectFrom("branding_assets")
      .select(["asset_kind", "content_type", "updated_at"])
      .execute();
    return rows.map((row) => ({
      asset_kind: row.asset_kind,
      content_type: row.content_type,
      updated_at:
        typeof row.updated_at === "number"
          ? row.updated_at
          : Number.parseInt(row.updated_at as unknown as string),
    }));
  }

  public async upsertAsset(
    input: UpsertBrandingAssetInput,
  ): Promise<BrandingAssetMetadata> {
    const content_type = brandingAssetContentTypeSchema.parse(
      input.content_type,
    );
    const row: BrandingAsset = {
      asset_kind: input.asset_kind,
      content_type,
      data_base64: input.data_base64,
      updated_at: Date.now(),
      updated_by_user_id: input.updated_by_user_id,
    };
    await this.db
      .insertInto("branding_assets")
      .values(row)
      .onConflict((oc) =>
        oc.column("asset_kind").doUpdateSet({
          content_type: row.content_type,
          data_base64: row.data_base64,
          updated_at: row.updated_at,
          updated_by_user_id: row.updated_by_user_id,
        }),
      )
      .execute();
    return {
      asset_kind: row.asset_kind,
      content_type: row.content_type,
      updated_at: row.updated_at,
    };
  }

  public async removeAsset(asset_kind: BrandingAssetKind): Promise<void> {
    await this.db
      .deleteFrom("branding_assets")
      .where("asset_kind", "=", asset_kind)
      .execute();
  }
}

export default BrandingAssetsRegistry;
