import "server-only";

import type { Kysely } from "@schemavaults/dbh";
import type { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import type { MailDatabase } from "./mail-database-type";
import type {
  EmailSendLogEntry,
  EmailSendLogStatus,
  EmailSendLogTable,
} from "./email-send-log-table";
import {
  compareEmailSendStatsTransports,
  type EmailSendStats,
  type EmailSendStatsBucket,
  type EmailSendStatsGranularity,
  type EmailSendStatsTransportCounts,
} from "./email-send-stats";
import { sql } from "./sql";

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

export interface GetEmailSendStatsOptions {
  /** Start of the range (inclusive), epoch milliseconds. */
  from: number;
  /** End of the range (exclusive), epoch milliseconds. */
  to: number;
  /** IANA time zone the buckets are aligned to; validated by the caller. */
  timezone: string;
  granularity: EmailSendStatsGranularity;
}

/** Neon returns BIGINT columns as strings; coerce them back to numbers. */
function parseBigint(value: number | string): number {
  return typeof value === "number" ? value : Number.parseInt(value);
}

/** Neon returns NUMERIC/BIGINT results as strings; coerce them to numbers. */
function parseNumeric(value: number | string): number {
  return typeof value === "number" ? value : Number(value);
}

/** Mutable per-transport tally, keyed by transport id (null = none). */
type TransportTally = Map<string | null, EmailSendStatsTransportCounts>;

function tally(
  counts: TransportTally,
  transport: string | null,
  status: EmailSendLogStatus,
  count: number,
): void {
  let entry = counts.get(transport);
  if (entry === undefined) {
    entry = { transport, delivered: 0, failed: 0 };
    counts.set(transport, entry);
  }
  entry[status] += count;
}

function sortedCounts(
  counts: TransportTally,
): EmailSendStatsTransportCounts[] {
  return [...counts.values()].sort((a, b) =>
    compareEmailSendStatsTransports(a.transport, b.transport),
  );
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

  /**
   * Counts the send attempts in `[from, to)` per transport and outcome,
   * grouped into hour/day/week/month buckets aligned to `timezone` (so a
   * daily bucket runs from local midnight to local midnight). Every bucket
   * overlapping the range is returned, empty ones included, oldest first.
   *
   * @throws when Postgres does not recognise `timezone`.
   */
  public async getStats(
    options: GetEmailSendStatsOptions,
  ): Promise<EmailSendStats> {
    const { from, to, timezone, granularity } = options;

    // Each attempt's bucket is truncated in local (time-zone-less) time,
    // then converted back to an instant: `date_trunc` alone would align
    // buckets to the database session's time zone, not the requested one.
    const countRows = await sql<{
      bucket_start: number | string;
      transport: string | null;
      status: EmailSendLogStatus;
      count: number | string;
    }>`
      SELECT
        extract(epoch FROM bucket_local AT TIME ZONE ${timezone}::text) * 1000
          AS bucket_start,
        transport,
        status,
        count(*) AS count
      FROM (
        SELECT
          date_trunc(
            ${granularity}::text,
            to_timestamp(attempted_at / 1000.0) AT TIME ZONE ${timezone}::text
          ) AS bucket_local,
          transport,
          status
        FROM email_send_log
        WHERE attempted_at >= ${from}::bigint AND attempted_at < ${to}::bigint
      ) AS attempts
      GROUP BY bucket_local, transport, status
    `.execute(this.db);

    const bucketRows = await sql<{ bucket_start: number | string }>`
      SELECT
        extract(epoch FROM bucket_local AT TIME ZONE ${timezone}::text) * 1000
          AS bucket_start
      FROM generate_series(
        date_trunc(
          ${granularity}::text,
          to_timestamp(${from}::bigint / 1000.0) AT TIME ZONE ${timezone}::text
        ),
        date_trunc(
          ${granularity}::text,
          to_timestamp((${to}::bigint - 1) / 1000.0) AT TIME ZONE ${timezone}::text
        ),
        ('1 ' || ${granularity}::text)::interval
      ) AS bucket_local
    `.execute(this.db);

    // Keyed by bucket start. Hourly buckets follow local wall-clock time, so
    // around a DST change the skipped local hour maps to the same instant
    // as the next one (the map folds the two into one bucket), and the
    // repeated local hour is one bucket spanning two real hours.
    const buckets = new Map<number, TransportTally>();
    for (const row of bucketRows.rows) {
      buckets.set(parseNumeric(row.bucket_start), new Map());
    }

    const totals: TransportTally = new Map();
    for (const row of countRows.rows) {
      const bucketStart = parseNumeric(row.bucket_start);
      const count = parseNumeric(row.count);
      let bucket = buckets.get(bucketStart);
      if (bucket === undefined) {
        bucket = new Map();
        buckets.set(bucketStart, bucket);
      }
      tally(bucket, row.transport, row.status, count);
      tally(totals, row.transport, row.status, count);
    }

    const bucketList: EmailSendStatsBucket[] = [...buckets.entries()]
      .sort(([a], [b]) => a - b)
      .map(([bucket_start, counts]) => ({
        bucket_start,
        transports: sortedCounts(counts),
      }));

    return {
      from,
      to,
      timezone,
      granularity,
      totals: sortedCounts(totals),
      buckets: bucketList,
    };
  }
}

export default EmailSendLogRegistry;
