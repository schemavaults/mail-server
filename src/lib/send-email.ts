import "server-only";

import {
  loadDefaultMailTransportKind,
  loadMailTransport,
  type IMailTransport,
  type IMailTransportSendOptions,
  type IMailTransportSendResult,
} from "@/lib/mail-transport";
import { ServerlessDatabase } from "@/lib/ServerlessDatabase";
import {
  EmailSendLogRegistry,
  type RecordEmailSendLogEntryInput,
} from "@/lib/mail-db/EmailSendLogRegistry";

export type ISendEmailOptions = IMailTransportSendOptions & {
  /**
   * Id of the configured transport to deliver via ("resend" or "smtp").
   * Omitted = the deployment's default transport per MAIL_TRANSPORT.
   */
  transport?: string;
  /**
   * The API key that requested this send, recorded in the email send log.
   * Omitted (or null) for sends made by an admin or by the server itself.
   */
  apiKeyId?: string | null;
};
export type ISendEmailResult = IMailTransportSendResult;

/** Persists one EMAIL_SEND_LOG row. */
export type EmailSendLogWriter = (
  entry: RecordEmailSendLogEntryInput,
) => Promise<void>;

async function writeEmailSendLogEntry(
  entry: RecordEmailSendLogEntryInput,
): Promise<void> {
  await using dbh = ServerlessDatabase.getAsyncResource();
  const registry = new EmailSendLogRegistry(dbh);
  await registry.recordEntry(entry);
}

/**
 * Records a send attempt without ever failing the send: a delivered email
 * has already left through the transport by the time its log entry is
 * written, so a log write error must not turn it into a failed request (and
 * invite a duplicate resend).
 */
async function recordSendAttempt(
  sendLog: EmailSendLogWriter,
  entry: RecordEmailSendLogEntryInput,
): Promise<void> {
  try {
    await sendLog(entry);
  } catch (e: unknown) {
    console.error("Failed to record email send log entry: ", e);
  }
}

/**
 * The transport an attempt was meant for when it failed before a transport
 * could be built: the requested one, else the deployment default, else
 * unknown (MAIL_TRANSPORT itself is invalid).
 */
function intendedTransportId(transportId: string | undefined): string | null {
  if (transportId !== undefined) return transportId;
  try {
    return loadDefaultMailTransportKind(process.env);
  } catch {
    return null;
  }
}

function describeSendError(e: unknown): string {
  if (e instanceof Error && e.message.length > 0) return e.message;
  if (typeof e === "string" && e.length > 0) return e;
  return "An unknown error occurred while sending the email.";
}

/**
 * Delivers one email through a mail transport and records the attempt in
 * the email send log (EMAIL_SEND_LOG, shown at /admin/email-send-log): when
 * the transport accepted it, or the error if it did not. The log never
 * stores the message's content.
 */
export async function sendEmail(
  options: ISendEmailOptions,
  transport?: IMailTransport,
  sendLog: EmailSendLogWriter = writeEmailSendLogEntry,
): Promise<ISendEmailResult> {
  const { transport: transportId, apiKeyId, ...sendOptions } = options;
  const attempted_at: number = Date.now();

  let mailTransport: IMailTransport | null = transport ?? null;
  let result: ISendEmailResult;
  try {
    mailTransport ??= await loadMailTransport(process.env, transportId);
    result = await mailTransport.send(sendOptions);
  } catch (e: unknown) {
    await recordSendAttempt(sendLog, {
      transport: mailTransport?.kind ?? intendedTransportId(transportId),
      status: "failed",
      attempted_at,
      delivered_at: null,
      error_message: describeSendError(e),
      provider_message_id: null,
      api_key_id: apiKeyId ?? null,
    });
    throw e;
  }

  await recordSendAttempt(sendLog, {
    transport: mailTransport.kind,
    status: "delivered",
    attempted_at,
    delivered_at: Date.now(),
    error_message: null,
    provider_message_id: result.id,
    api_key_id: apiKeyId ?? null,
  });
  return result;
}

export default sendEmail;
