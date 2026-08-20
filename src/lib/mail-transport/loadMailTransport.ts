import "server-only";

import {
  loadMailTransportConfig,
  type MailTransportConfig,
} from "./loadMailTransportConfig";
import ResendMailTransport from "./ResendMailTransport";
import SmtpMailTransport from "./SmtpMailTransport";
import type { IMailTransport } from "./types";

/**
 * Builds the mail transport selected by the MAIL_TRANSPORT environment
 * variable (default: "resend"). Called lazily at send time — never at module
 * load — so requests that don't actually deliver mail (e.g. dryRun sends)
 * work without any transport configured.
 *
 * @throws {MailTransportConfigError} on missing/malformed transport config
 */
export function loadMailTransport(
  env: Record<string, string | undefined> = process.env,
): IMailTransport {
  const config: MailTransportConfig = loadMailTransportConfig(env);
  switch (config.kind) {
    case "resend":
      return new ResendMailTransport(config.apiKey);
    case "smtp":
      return new SmtpMailTransport(config);
  }
}

export default loadMailTransport;
