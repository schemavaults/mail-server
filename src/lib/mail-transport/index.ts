// NOTE: the concrete transport classes (ResendMailTransport,
// SmtpMailTransport) are deliberately NOT re-exported here. loadMailTransport
// pulls them in via dynamic import so that only the transport selected by
// MAIL_TRANSPORT ever loads its SDK (the Resend client / nodemailer); a
// static barrel re-export would drag both into every importer's module
// graph. Import a class from its own file if you need it directly.
export type {
  IMailTransport,
  IMailTransportSendOptions,
  IMailTransportSendResult,
} from "./types";
export {
  loadMailTransportConfig,
  MAIL_TRANSPORT_KINDS,
  DEFAULT_MAIL_TRANSPORT,
  DEFAULT_SMTP_PORT,
  type MailTransportKind,
  type MailTransportConfig,
  type IResendTransportConfig,
  type ISmtpTransportConfig,
} from "./loadMailTransportConfig";
export { loadMailTransport } from "./loadMailTransport";
export { MailTransportConfigError } from "./MailTransportConfigError";
