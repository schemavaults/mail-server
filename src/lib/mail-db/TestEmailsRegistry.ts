import "server-only";

import type { Kysely } from "@schemavaults/dbh";
import type { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import type { MailDatabase } from "./mail-database-type";
import type { TestEmail, TestEmailsTable } from "./test-emails-table";

export interface RecordTestEmailInput {
  from_address: string;
  to_addresses: readonly string[];
  cc_addresses?: readonly string[];
  bcc_addresses?: readonly string[];
  reply_to_addresses?: readonly string[];
  subject: string;
  html?: string | null;
  text?: string | null;
}

export interface ListTestEmailsOptions {
  /** Page size; the route clamps this to its documented bounds. */
  limit: number;
  /** Rows to skip (newest-first ordering). */
  offset: number;
}

/**
 * Reader/writer for the TEST_EMAILS table — the storage behind the fake-send
 * test-database-transport. The recipient list columns are stored as
 * JSON-encoded string arrays in TEXT columns; this registry is the only
 * place that (de)serializes them.
 */
export class TestEmailsRegistry {
  private readonly dbh: ServerlessDatabase;

  private get db(): Kysely<MailDatabase> {
    return this.dbh.db;
  }

  public constructor(dbh: ServerlessDatabase) {
    this.dbh = dbh;
  }

  private static parseAddressList(raw: string): string[] {
    const parsed: unknown = JSON.parse(raw);
    if (
      !Array.isArray(parsed) ||
      parsed.some((entry) => typeof entry !== "string")
    ) {
      throw new TypeError(
        "Expected a JSON-encoded string array in a TEST_EMAILS address column!",
      );
    }
    return parsed;
  }

  /**
   * Neon returns BIGINT columns as strings; coerce them (and expand the
   * JSON-encoded address columns) so consumers receive the TestEmail shape.
   */
  private parseRow(row: TestEmailsTable): TestEmail {
    return {
      test_email_id: row.test_email_id,
      from_address: row.from_address,
      to_addresses: TestEmailsRegistry.parseAddressList(row.to_addresses),
      cc_addresses: TestEmailsRegistry.parseAddressList(row.cc_addresses),
      bcc_addresses: TestEmailsRegistry.parseAddressList(row.bcc_addresses),
      reply_to_addresses: TestEmailsRegistry.parseAddressList(
        row.reply_to_addresses,
      ),
      subject: row.subject,
      html: row.html,
      text: row.text,
      created_at:
        typeof row.created_at === "number"
          ? row.created_at
          : Number.parseInt(row.created_at as unknown as string),
    };
  }

  /** Stores one fake-sent email and returns it in API shape. */
  public async recordEmail(input: RecordTestEmailInput): Promise<TestEmail> {
    const row: TestEmailsTable = {
      test_email_id: crypto.randomUUID(),
      from_address: input.from_address,
      to_addresses: JSON.stringify(input.to_addresses),
      cc_addresses: JSON.stringify(input.cc_addresses ?? []),
      bcc_addresses: JSON.stringify(input.bcc_addresses ?? []),
      reply_to_addresses: JSON.stringify(input.reply_to_addresses ?? []),
      subject: input.subject,
      html: input.html ?? null,
      text: input.text ?? null,
      created_at: Date.now(),
    };
    await this.db.insertInto("test_emails").values(row).execute();
    return this.parseRow(row);
  }

  /** Lists stored fake emails, newest first. */
  public async listEmails(
    options: ListTestEmailsOptions,
  ): Promise<readonly TestEmail[]> {
    const rows = await this.db
      .selectFrom("test_emails")
      .selectAll()
      .orderBy("created_at", "desc")
      .orderBy("test_email_id", "desc")
      .limit(options.limit)
      .offset(options.offset)
      .execute();
    return rows.map((row) => this.parseRow(row));
  }

  public async getEmail(test_email_id: string): Promise<TestEmail | null> {
    const row = await this.db
      .selectFrom("test_emails")
      .selectAll()
      .where("test_email_id", "=", test_email_id)
      .executeTakeFirst();
    return row === undefined ? null : this.parseRow(row);
  }
}

export default TestEmailsRegistry;
