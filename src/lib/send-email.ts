import "server-only";

import {
  loadMailTransport,
  type IMailTransport,
  type IMailTransportSendOptions,
  type IMailTransportSendResult,
} from "@/lib/mail-transport";

export type ISendEmailOptions = IMailTransportSendOptions;
export type ISendEmailResult = IMailTransportSendResult;

export async function sendEmail(
  options: ISendEmailOptions,
  transport?: IMailTransport,
): Promise<ISendEmailResult> {
  const mailTransport: IMailTransport = transport ?? loadMailTransport();
  return await mailTransport.send(options);
}

export default sendEmail;
