import "server-only";

import {
  loadMailTransportConfig,
  type MailTransportConfig,
} from "./loadMailTransportConfig";
import type { IMailTransport } from "./types";

/**
 * Builds the mail transport selected by the MAIL_TRANSPORT environment
 * variable (default: "resend"). Called lazily at send time — never at module
 * load — so requests that don't actually deliver mail (e.g. dryRun sends)
 * work without any transport configured.
 *
 * Transport implementations are loaded via dynamic import so only the
 * selected transport's SDK (the Resend client or nodemailer) is ever loaded
 * into the server bundle's module graph at runtime.
 *
 * @throws {MailTransportConfigError} on missing/malformed transport config
 */
export async function loadMailTransport(
  env: Record<string, string | undefined> = process.env,
): Promise<IMailTransport> {
  const config: MailTransportConfig = loadMailTransportConfig(env);
  switch (config.kind) {
    case "resend": {
      const { ResendMailTransport } = await import("./ResendMailTransport");
      return new ResendMailTransport(config.apiKey);
    }
    case "smtp": {
      const { SmtpMailTransport } = await import("./SmtpMailTransport");
      return new SmtpMailTransport(config);
    }
  }
}

export default loadMailTransport;
