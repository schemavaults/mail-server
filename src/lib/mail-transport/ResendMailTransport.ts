import "server-only";

import { Resend, type CreateEmailOptions } from "resend";
import type {
  IMailTransport,
  IMailTransportSendOptions,
  IMailTransportSendResult,
} from "./types";

export class ResendMailTransport implements IMailTransport {
  public readonly kind = "resend" as const;

  private readonly resend: Resend;

  public constructor(apiKey: string, resend?: Resend) {
    this.resend = resend ?? new Resend(apiKey);
  }

  public async send(
    options: IMailTransportSendOptions,
  ): Promise<IMailTransportSendResult> {
    if (!options.html && !options.text) {
      throw new TypeError(
        "Expected at least one of 'html' or 'text' email body content to send!",
      );
    }

    // Cast: Resend's CreateEmailOptions is a union demanding exactly one of
    // react/html/text at the type level; the guard above enforces it at
    // runtime for our html/text-only shape.
    const { data, error } = await this.resend.emails.send({
      from: options.from,
      to: options.to,
      subject: options.subject,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
      html: options.html,
      text: options.text,
    } as CreateEmailOptions);

    if (error) {
      throw new Error(`Resend failed to send email: ${error.message}`);
    }

    return { id: data?.id ?? null };
  }
}

export default ResendMailTransport;
