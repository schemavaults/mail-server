import "server-only";

import type { Kysely } from "@schemavaults/dbh";
import type { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import type { MailDatabase } from "./mail-database-type";
import {
  corsOriginValueSchema,
  type CorsAllowedOrigin,
} from "./cors-allowed-origins-table";

export interface AddCorsOriginInput {
  origin: string;
  description?: string | null;
  created_by_user_id: string;
}

export class CorsOriginsRegistry {
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
  private parseRow(row: CorsAllowedOrigin): CorsAllowedOrigin {
    return {
      ...row,
      created_at:
        typeof row.created_at === "number"
          ? row.created_at
          : Number.parseInt(row.created_at as unknown as string),
    };
  }

  public async listOrigins(): Promise<readonly CorsAllowedOrigin[]> {
    const rows = await this.db
      .selectFrom("cors_allowed_origins")
      .selectAll()
      .orderBy("created_at", "asc")
      .execute();
    return rows.map((row) => this.parseRow(row));
  }

  public async isAllowedOrigin(origin: string): Promise<boolean> {
    const row = await this.db
      .selectFrom("cors_allowed_origins")
      .select("cors_origin_id")
      .where("origin", "=", origin)
      .executeTakeFirst();
    return row !== undefined;
  }

  public async addOrigin(
    input: AddCorsOriginInput,
  ): Promise<CorsAllowedOrigin> {
    const origin = corsOriginValueSchema.parse(input.origin.trim());
    const description = input.description?.trim();
    const row: CorsAllowedOrigin = {
      cors_origin_id: crypto.randomUUID(),
      origin,
      description:
        typeof description === "string" && description.length > 0
          ? description
          : null,
      created_at: Date.now(),
      created_by_user_id: input.created_by_user_id,
    };
    await this.db.insertInto("cors_allowed_origins").values(row).execute();
    return row;
  }

  public async removeOrigin(cors_origin_id: string): Promise<void> {
    await this.db
      .deleteFrom("cors_allowed_origins")
      .where("cors_origin_id", "=", cors_origin_id)
      .execute();
  }
}

export default CorsOriginsRegistry;
