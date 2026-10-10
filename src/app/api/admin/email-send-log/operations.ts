import "server-only";

import { z } from "@/lib/zod-openapi";
import { defineOperation } from "@/lib/api/define-operation";
import { adminAuth } from "@/lib/api/auth-schemes";
import { internalError } from "@/lib/api/errors";
import { dataResponse, errorResponses } from "@/lib/api/responses";
import { OPENAPI_TAGS } from "@/lib/api/tags";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import { EmailSendLogRegistry, type EmailSendLogEntry } from "@/lib/mail-db";
import {
  emailSendLogEntrySchema,
  emailSendLogStatusSchema,
} from "@/lib/mail-db/email-send-log-table";
import {
  DEFAULT_EMAIL_SEND_LOG_PAGE_SIZE,
  MAX_EMAIL_SEND_LOG_PAGE_SIZE,
} from "./page-size";

// Lists the email send log (one entry per outbound send attempt), newest
// first. Entries carry only when each email was delivered or why it failed,
// never the message's content.
export const listEmailSendLog = defineOperation({
  method: "get",
  path: "/api/admin/email-send-log",
  operationId: "listEmailSendLog",
  tags: [OPENAPI_TAGS.adminEmailSendLog],
  summary: "List the email send log",
  description:
    "Lists every outbound send attempt (from /api/send and from the server itself, e.g. subscription confirmation emails), newest first: when the transport accepted each email, or the error if it was not delivered. Message content (subject, body, attachments, addresses) is never logged.",
  auth: adminAuth(),
  request: {
    query: z.object({
      limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(MAX_EMAIL_SEND_LOG_PAGE_SIZE)
        .default(DEFAULT_EMAIL_SEND_LOG_PAGE_SIZE)
        .openapi({
          description: `Page size (default ${DEFAULT_EMAIL_SEND_LOG_PAGE_SIZE}, max ${MAX_EMAIL_SEND_LOG_PAGE_SIZE}).`,
          example: DEFAULT_EMAIL_SEND_LOG_PAGE_SIZE,
        }),
      offset: z.coerce.number().int().min(0).default(0).openapi({
        description: "Rows to skip, for paging (default 0).",
        example: 0,
      }),
      status: emailSendLogStatusSchema.optional().openapi({
        description: "Only list attempts with this outcome (default: all).",
      }),
    }),
  },
  responses: {
    200: dataResponse(
      "The send attempts, newest first.",
      z.array(emailSendLogEntrySchema),
    ),
    ...errorResponses({
      500: "Failed to list the email send log.",
    }),
  },
  handler: async (ctx) => {
    const { limit, offset, status } = ctx.query;

    let entries: readonly EmailSendLogEntry[];
    try {
      await using dbh = ServerlessDatabase.getAsyncResource();
      const registry = new EmailSendLogRegistry(dbh);
      entries = await registry.listEntries({ limit, offset, status });
    } catch (e: unknown) {
      console.error("Failed to list the email send log: ", e);
      throw internalError("Failed to list the email send log!");
    }

    return ctx.json(200, { success: true, data: [...entries] });
  },
});
