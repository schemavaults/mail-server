import "server-only";

import {
  loadMailTransport,
  type IMailTransport,
  type IMailTransportSendOptions,
  type IMailTransportSendResult,
} from "@/lib/mail-transport";

export type ISendEmailOptions = IMailTransportSendOptions & {
  /**
   * Id of the configured transport to deliver via ("resend" or "smtp").
   * Omitted = the deployment's default transport per MAIL_TRANSPORT.
   */
  transport?: string;
};
export type ISendEmailResult = IMailTransportSendResult;

export async function sendEmail(
  options: ISendEmailOptions,
  transport?: IMailTransport,
): Promise<ISendEmailResult> {
  const { transport: transportId, ...sendOptions } = options;
  const mailTransport: IMailTransport =
    transport ?? (await loadMailTransport(process.env, transportId));
  return await mailTransport.send(sendOptions);
}

export default sendEmail;
