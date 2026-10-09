import type { EmailAttachment } from "@schemavaults/send-email";
import type { MailTransportKind } from "./loadMailTransportConfig";

/**
 * A file attached to an outbound email, in the @schemavaults/send-email wire
 * shape that /api/send accepts: `content` is the file's bytes as a
 * (validated, padded) base64 string, `contentType` is optional (the
 * delivering transports derive it from the filename when omitted; the
 * test-database transport records it as given), and setting `contentId`
 * marks the attachment inline so the HTML body can reference it as
 * `cid:<contentId>`. Count and total size are already capped by the
 * request schema before a transport sees them.
 */
export type IMailTransportAttachment = EmailAttachment;

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
  attachments?: readonly IMailTransportAttachment[];
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
