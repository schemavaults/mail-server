// 00000-example-migration.ts

import type { Kysely } from "@schemavaults/dbh";
// import { sql } from "@/sql";

export async function up(db: Kysely<any>): Promise<void> {
  void db;
}

export async function down(db: Kysely<any>): Promise<void> {
  void db;
}
