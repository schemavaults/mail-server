import "server-only";

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MailingListRegistry } from "@/lib/mail-db";
import sendEmailFromTemplate from "@/lib/send-email-from-template";
import sendEmail from "@/lib/send-email";
import DefaultMailSenderAddress from "@/lib/DefaultMailSenderAddress";
import {
  isValidTemplateId,
  type EmailTemplateId,
} from "@/lib/EmailTemplatesCatalog";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { ADMIN_MAILING_LIST_ID } from "@/lib/admin-mailing-list";
import type { IMailServerMcpContext } from "../createMailServerMcpHandler";

function mcpError(message: string) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: message }],
  };
}

export function registerSendAdminNotificationTool(
  server: McpServer,
  ctx: IMailServerMcpContext,
): void {
  server.tool(
    "send_admin_notification",
    "Send an email notification to every subscriber of the SchemaVaults admin mailing list. " +
      "Provide EITHER template_id (+ optional template_props, see list_email_templates) " +
      "OR text (+ optional html) for a raw message. Recipients are BCC'd.",
    {
      subject: z.string().min(1).max(256),
      template_id: z.string().optional(),
      template_props: z.unknown().optional(),
      text: z.string().optional(),
      html: z.string().optional(),
    },
    async ({ subject, template_id, template_props, text, html }) => {
      const hasTemplate = Boolean(template_id);
      const hasRaw = Boolean(text) || Boolean(html);
      if (hasTemplate && hasRaw) {
        return mcpError(
          "Provide either template_id + template_props OR text/html, not both.",
        );
      }
      if (!hasTemplate && !hasRaw) {
        return mcpError(
          "Must provide either template_id (with template_props) or text/html.",
        );
      }
      if (template_id && !isValidTemplateId(template_id)) {
        return mcpError(
          `Unknown template_id '${template_id}'. Call list_email_templates for available options.`,
        );
      }

      let recipients: readonly string[];
      try {
        const registry = new MailingListRegistry(ctx.dbh);
        const subscribers = await registry.listSubscribers(
          ADMIN_MAILING_LIST_ID,
        );
        recipients = subscribers.map((s) => s.email);
      } catch (e) {
        console.error("MCP: failed to list admin subscribers:", e);
        return mcpError("Failed to load admin mailing list subscribers.");
      }
      if (recipients.length === 0) {
        return mcpError("Admin mailing list has no subscribers.");
      }

      const base = {
        subject,
        to: DefaultMailSenderAddress,
        from: DefaultMailSenderAddress,
        bcc: [...recipients],
      };

      try {
        if (template_id) {
          const result = await sendEmailFromTemplate({
            ...base,
            message: {
              template_id: template_id as EmailTemplateId,
              template_props: (template_props ?? {}) as any,
            },
          });
          if (result.error) throw result.error;
        } else {
          const result = await sendEmail({
            ...base,
            text: text ?? "",
            html,
          });
          if (result.error) throw result.error;
        }
      } catch (e: unknown) {
        if (e instanceof BadEmailTemplatePropsError) {
          return mcpError("Invalid template_props for the given template_id.");
        }
        console.error("MCP: failed to send admin notification:", e);
        const msg =
          typeof e === "object" &&
          !!e &&
          "message" in e &&
          typeof e.message === "string"
            ? e.message
            : "Unknown error sending admin notification.";
        return mcpError(msg);
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `Admin notification sent to ${recipients.length} subscriber(s).`,
          },
        ],
      };
    },
  );
}
