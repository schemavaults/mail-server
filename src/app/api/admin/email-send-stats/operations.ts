import "server-only";

import { z } from "@/lib/zod-openapi";
import { defineOperation } from "@/lib/api/define-operation";
import { adminAuth } from "@/lib/api/auth-schemes";
import { badRequest, internalError } from "@/lib/api/errors";
import { dataResponse, errorResponses } from "@/lib/api/responses";
import { OPENAPI_TAGS } from "@/lib/api/tags";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { EmailSendLogRegistry, type EmailSendStats } from "@/lib/mail-db";
import {
  emailSendStatsGranularitySchema,
  emailSendStatsSchema,
  estimateEmailSendStatsBucketCount,
  MAX_EMAIL_SEND_STATS_BUCKETS,
} from "@/lib/mail-db/email-send-stats";
import { isInvalidParameterValue } from "@/lib/mail-db/is-invalid-parameter-value";
import { ianaTimeZoneSchema } from "@/lib/time-zone";

/** The range used when a request omits `from`: the 30 days before `to`. */
const DEFAULT_RANGE_MS = 30 * 24 * 60 * 60 * 1000;

const epochMillisQueryParam = z.coerce.number().int().min(0);

// Counts the email send log's attempts per transport over a date range,
// grouped into time buckets, for the /admin/email-traffic charts. Counts
// only — the log holds no message content.
export const getEmailSendStats = defineOperation({
  method: "get",
  path: "/api/admin/email-send-stats",
  operationId: "getEmailSendStats",
  tags: [OPENAPI_TAGS.adminEmailSendLog],
  summary: "Count send attempts per transport over time",
  description: `Counts the outbound send attempts recorded in the email send log within \`[from, to)\`, per transport and outcome (delivered/failed): once over the whole range, and per hour/day/week/month bucket aligned to \`timezone\`. Every bucket overlapping the range is returned, empty ones included. A range may span at most ${MAX_EMAIL_SEND_STATS_BUCKETS} buckets.`,
  auth: adminAuth(),
  request: {
    query: z.object({
      from: epochMillisQueryParam.optional().openapi({
        description:
          "Start of the range (inclusive), Unix epoch milliseconds. Defaults to 30 days before `to`.",
        example: 1767225600000,
      }),
      to: epochMillisQueryParam.optional().openapi({
        description:
          "End of the range (exclusive), Unix epoch milliseconds. Defaults to now.",
        example: 1769904000000,
      }),
      timezone: ianaTimeZoneSchema
        .default("UTC")
        .openapi({
          description:
            "IANA time zone the buckets are aligned to, e.g. so daily buckets run from local midnight (default `UTC`).",
          example: "America/New_York",
        }),
      granularity: emailSendStatsGranularitySchema.default("day").openapi({
        description: "Bucket size (default `day`).",
      }),
    }),
  },
  responses: {
    200: dataResponse(
      "Send attempt counts per transport, in total and per bucket.",
      emailSendStatsSchema,
    ),
    ...errorResponses({
      400: "The range is empty, spans too many buckets, or names a time zone the database does not know.",
      500: "Failed to count the email send log.",
    }),
  },
  handler: async (ctx) => {
    const { timezone, granularity } = ctx.query;
    const to: number = ctx.query.to ?? Date.now();
    const from: number = ctx.query.from ?? Math.max(0, to - DEFAULT_RANGE_MS);

    if (!(to > from)) {
      throw badRequest("'to' must be later than 'from'.", "invalid_range");
    }
    const bucketCount = estimateEmailSendStatsBucketCount(
      from,
      to,
      granularity,
    );
    if (bucketCount > MAX_EMAIL_SEND_STATS_BUCKETS) {
      throw badRequest(
        `The range spans about ${bucketCount} ${granularity} buckets; at most ${MAX_EMAIL_SEND_STATS_BUCKETS} are allowed. Pick a shorter range or a coarser granularity.`,
        "too_many_buckets",
      );
    }

    let stats: EmailSendStats;
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new EmailSendLogRegistry(dbh);
      stats = await registry.getStats({ from, to, timezone, granularity });
    } catch (e: unknown) {
      if (isInvalidParameterValue(e)) {
        throw badRequest(
          `The database does not recognise the time zone '${timezone}'.`,
          "invalid_timezone",
        );
      }
      console.error("Failed to count the email send log: ", e);
      throw internalError("Failed to count the email send log!");
    }

    return ctx.json(200, { success: true, data: stats });
  },
});
