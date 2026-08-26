import type { MailTransportKind } from "./loadMailTransportConfig";

/**
 * Transport-neutral description of one outbound email. Every transport
 * accepts exactly this shape; react-email templates are rendered to `html`
 * and `text` strings before a transport is ever involved, so transports
 * never deal with React nodes.
 */
export interface IMailTransportSendOptions {
  from: string;
  to: string | string[];
  subject: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string | string[];
  /** At least one of `html` / `text` must be provided. */
  html?: string;
  text?: string;
}

export interface IMailTransportSendResult {
  /** Provider-assigned message ID, when the transport reports one. */
  id: string | null;
}

/**
 * A configured outbound mail delivery mechanism. Implementations throw on
 * delivery failure (they never encode errors in the return value), so
 * callers handle failures uniformly via try/catch.
 */
export interface IMailTransport {
  readonly kind: MailTransportKind;
  send(options: IMailTransportSendOptions): Promise<IMailTransportSendResult>;
}
