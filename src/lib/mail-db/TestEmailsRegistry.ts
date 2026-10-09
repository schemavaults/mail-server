import "server-only";

import type { Kysely } from "@schemavaults/dbh";
import type { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import type { MailDatabase } from "./mail-database-type";
import type {
  TestEmail,
  TestEmailSummary,
  TestEmailsTable,
} from "./test-emails-table";
import type {
  TestEmailAttachment,
  TestEmailAttachmentMetadata,
  TestEmailAttachmentsTable,
} from "./test-email-attachments-table";

export interface RecordTestEmailAttachmentInput {
  filename: string;
  /** The attachment's bytes, base64-encoded. */
  content_base64: string;
  content_type?: string | null;
  content_id?: string | null;
}

export interface RecordTestEmailInput {
  from_address: string;
  to_addresses: readonly string[];
  cc_addresses?: readonly string[];
  bcc_addresses?: readonly string[];
  reply_to_addresses?: readonly string[];
  subject: string;
  html?: string | null;
  text?: string | null;
  attachments?: readonly RecordTestEmailAttachmentInput[];
}

export interface ListTestEmailsOptions {
  /** Page size; the route clamps this to its documented bounds. */
  limit: number;
  /** Rows to skip (newest-first ordering). */
  offset: number;
}

type TestEmailFields = Omit<TestEmail, "attachments">;

type TestEmailAttachmentMetadataRow = Omit<
  TestEmailAttachmentsTable,
  "content_base64"
>;

/**
 * Reader/writer for the TEST_EMAILS and TEST_EMAIL_ATTACHMENTS tables — the
 * storage behind the fake-send test-database-transport. The recipient list
 * columns are stored as JSON-encoded string arrays in TEXT columns; this
 * registry is the only place that (de)serializes them.
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
  private parseRow(row: TestEmailsTable): TestEmailFields {
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

  private static parseAttachmentMetadata(
    row: TestEmailAttachmentMetadataRow,
  ): TestEmailAttachmentMetadata {
    return {
      filename: row.filename,
      content_type: row.content_type,
      content_id: row.content_id,
      size_bytes: row.size_bytes,
    };
  }

  /**
   * Stores one fake-sent email (and its attachments, in the same
   * transaction, so an email is never readable without them) and returns
   * it in API shape.
   */
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
    const attachmentRows: TestEmailAttachmentsTable[] = (
      input.attachments ?? []
    ).map((attachment, attachment_index) => ({
      test_email_id: row.test_email_id,
      attachment_index,
      filename: attachment.filename,
      content_type: attachment.content_type ?? null,
      content_id: attachment.content_id ?? null,
      // Computed from the base64 length; nothing is decoded.
      size_bytes: Buffer.byteLength(attachment.content_base64, "base64"),
      content_base64: attachment.content_base64,
    }));

    await this.db.transaction().execute(async (trx) => {
      await trx.insertInto("test_emails").values(row).execute();
      if (attachmentRows.length > 0) {
        await trx
          .insertInto("test_email_attachments")
          .values(attachmentRows)
          .execute();
      }
    });

    return {
      ...this.parseRow(row),
      attachments: attachmentRows.map((attachmentRow) => ({
        ...TestEmailsRegistry.parseAttachmentMetadata(attachmentRow),
        content: attachmentRow.content_base64,
      })),
    };
  }

  /**
   * Lists stored fake emails, newest first. Attachments are listed as
   * metadata only: their content is never read here.
   */
  public async listEmails(
    options: ListTestEmailsOptions,
  ): Promise<readonly TestEmailSummary[]> {
    const rows = await this.db
      .selectFrom("test_emails")
      .selectAll()
      .orderBy("created_at", "desc")
      .orderBy("test_email_id", "desc")
      .limit(options.limit)
      .offset(options.offset)
      .execute();
    if (rows.length === 0) return [];

    const attachmentRows = await this.db
      .selectFrom("test_email_attachments")
      .select([
        "test_email_id",
        "attachment_index",
        "filename",
        "content_type",
        "content_id",
        "size_bytes",
      ])
      .where(
        "test_email_id",
        "in",
        rows.map((row) => row.test_email_id),
      )
      .orderBy("attachment_index", "asc")
      .execute();

    const attachmentsByEmail = new Map<string, TestEmailAttachmentMetadata[]>();
    for (const attachmentRow of attachmentRows) {
      const list = attachmentsByEmail.get(attachmentRow.test_email_id) ?? [];
      list.push(TestEmailsRegistry.parseAttachmentMetadata(attachmentRow));
      attachmentsByEmail.set(attachmentRow.test_email_id, list);
    }

    return rows.map((row) => ({
      ...this.parseRow(row),
      attachments: attachmentsByEmail.get(row.test_email_id) ?? [],
    }));
  }

  /** Reads one stored fake email, including its attachments' content. */
  public async getEmail(test_email_id: string): Promise<TestEmail | null> {
    const row = await this.db
      .selectFrom("test_emails")
      .selectAll()
      .where("test_email_id", "=", test_email_id)
      .executeTakeFirst();
    if (row === undefined) return null;

    const attachmentRows = await this.db
      .selectFrom("test_email_attachments")
      .selectAll()
      .where("test_email_id", "=", test_email_id)
      .orderBy("attachment_index", "asc")
      .execute();

    return {
      ...this.parseRow(row),
      attachments: attachmentRows.map(
        (attachmentRow): TestEmailAttachment => ({
          ...TestEmailsRegistry.parseAttachmentMetadata(attachmentRow),
          content: attachmentRow.content_base64,
        }),
      ),
    };
  }
}

export default TestEmailsRegistry;
