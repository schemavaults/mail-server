import "server-only";

import type { Kysely } from "@schemavaults/dbh";
import type { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import type { MailDatabase } from "./mail-database-type";
import type {
  EmailSendLogEntry,
  EmailSendLogStatus,
  EmailSendLogTable,
} from "./email-send-log-table";

/** Error messages longer than this are truncated before being stored. */
export const MAX_EMAIL_SEND_LOG_ERROR_MESSAGE_LENGTH = 2000;

export type RecordEmailSendLogEntryInput = Omit<
  EmailSendLogTable,
  "email_send_log_id"
>;

export interface ListEmailSendLogOptions {
  /** Page size; the route clamps this to its documented bounds. */
  limit: number;
  /** Rows to skip (newest-first ordering). */
  offset: number;
  /** Only list attempts with this outcome; omitted = all. */
  status?: EmailSendLogStatus;
}

/** Neon returns BIGINT columns as strings; coerce them back to numbers. */
function parseBigint(value: number | string): number {
  return typeof value === "number" ? value : Number.parseInt(value);
}

function truncateErrorMessage(message: string | null): string | null {
  if (
    message === null ||
    message.length <= MAX_EMAIL_SEND_LOG_ERROR_MESSAGE_LENGTH
  ) {
    return message;
  }
  return `${message.slice(0, MAX_EMAIL_SEND_LOG_ERROR_MESSAGE_LENGTH - 1)}…`;
}

/**
 * Reader/writer for the EMAIL_SEND_LOG table, the admin-facing record of
 * every outbound send attempt. Rows hold only the attempt's outcome and
 * delivery metadata, never message content.
 */
export class EmailSendLogRegistry {
  private readonly dbh: ServerlessDatabase;

  private get db(): Kysely<MailDatabase> {
    return this.dbh.db;
  }

  public constructor(dbh: ServerlessDatabase) {
    this.dbh = dbh;
  }

  public async recordEntry(input: RecordEmailSendLogEntryInput): Promise<void> {
    await this.db
      .insertInto("email_send_log")
      .values({
        ...input,
        email_send_log_id: crypto.randomUUID(),
        error_message: truncateErrorMessage(input.error_message),
      })
      .execute();
  }

  /**
   * Lists send attempts newest first, each with the current name of the API
   * key that requested it (when there was one).
   */
  public async listEntries(
    options: ListEmailSendLogOptions,
  ): Promise<readonly EmailSendLogEntry[]> {
    let query = this.db
      .selectFrom("email_send_log")
      .leftJoin("api_keys", "api_keys.api_key_id", "email_send_log.api_key_id")
      .selectAll("email_send_log")
      .select("api_keys.name as api_key_name");
    if (options.status !== undefined) {
      query = query.where("email_send_log.status", "=", options.status);
    }
    const rows = await query
      .orderBy("email_send_log.attempted_at", "desc")
      .orderBy("email_send_log.email_send_log_id", "desc")
      .limit(options.limit)
      .offset(options.offset)
      .execute();

    return rows.map((row) => ({
      email_send_log_id: row.email_send_log_id,
      transport: row.transport,
      status: row.status,
      attempted_at: parseBigint(row.attempted_at),
      delivered_at:
        row.delivered_at === null ? null : parseBigint(row.delivered_at),
      error_message: row.error_message,
      provider_message_id: row.provider_message_id,
      api_key_id: row.api_key_id,
      api_key_name: row.api_key_name ?? null,
    }));
  }
}

export default EmailSendLogRegistry;
