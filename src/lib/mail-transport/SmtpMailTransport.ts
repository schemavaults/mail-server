import "server-only";

import nodemailer, { type Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type { ISmtpTransportConfig } from "./loadMailTransportConfig";
import type {
  IMailTransport,
  IMailTransportSendOptions,
  IMailTransportSendResult,
} from "./types";

/**
 * Raw SMTP delivery via nodemailer. Assumes the configured endpoint is a
 * submission relay/smarthost that handles DKIM signing and SPF alignment for
 * the From: domain — this transport does not sign messages itself.
 *
 * Tuned for serverless: no connection pooling (each invocation gets a fresh
 * connection anyway) and short timeouts so a hung SMTP server fails the
 * request quickly instead of eating the function's execution budget.
 */
export class SmtpMailTransport implements IMailTransport {
  public readonly kind = "smtp" as const;

  private readonly transporter: Transporter<SMTPTransport.SentMessageInfo>;

  public constructor(
    config: ISmtpTransportConfig,
    transporter?: Transporter<SMTPTransport.SentMessageInfo>,
  ) {
    this.transporter =
      transporter ??
      nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: config.auth ?? undefined,
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 30_000,
      });
  }

  public async send(
    options: IMailTransportSendOptions,
  ): Promise<IMailTransportSendResult> {
    if (!options.html && !options.text) {
      throw new TypeError(
        "Expected at least one of 'html' or 'text' email body content to send!",
      );
    }

    const info = await this.transporter.sendMail({
      from: options.from,
      to: options.to,
      subject: options.subject,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
      html: options.html,
      text: options.text,
      attachments: options.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        encoding: "base64",
        // Left undefined, nodemailer derives the type from the filename.
        contentType: attachment.contentType,
        // nodemailer only defaults *images* with a cid to inline; any
        // attachment carrying a contentId is meant to be referenced from the
        // HTML body, so mark it inline explicitly.
        cid: attachment.contentId,
        contentDisposition:
          attachment.contentId !== undefined ? "inline" : "attachment",
      })),
      // Attachments are only ever passed as in-memory content, never as a
      // `path`/`href`; refuse file and URL reads outright so no
      // request-supplied field can make nodemailer read local files or
      // fetch remote URLs into an outgoing message.
      disableFileAccess: true,
      disableUrlAccess: true,
    });

    return { id: info.messageId ?? null };
  }
}

export default SmtpMailTransport;
