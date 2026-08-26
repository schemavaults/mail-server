import "server-only";

import {
  isMailTransportKind,
  loadMailTransportConfig,
  MAIL_TRANSPORT_KINDS,
  type MailTransportConfig,
  type MailTransportKind,
} from "./loadMailTransportConfig";
import { MailTransportConfigError } from "./MailTransportConfigError";
import type { IMailTransport } from "./types";

/**
 * Builds one of the configured mail transports. When `transportId` is
 * provided, that transport is built; when omitted, the default transport
 * selected by the MAIL_TRANSPORT environment variable (default: "resend") is
 * used. Called lazily at send time — never at module load — so requests that
 * don't actually deliver mail (e.g. dryRun sends) work without any transport
 * configured.
 *
 * Transport implementations are loaded via dynamic import so only the
 * selected transport's SDK (the Resend client or nodemailer) is ever loaded
 * into the server bundle's module graph at runtime.
 *
 * @throws {MailTransportConfigError} on an unknown transport id or
 * missing/malformed transport config
 */
export async function loadMailTransport(
  env: Record<string, string | undefined> = process.env,
  transportId?: string,
): Promise<IMailTransport> {
  let kind: MailTransportKind | undefined;
  if (typeof transportId === "string") {
    if (!isMailTransportKind(transportId)) {
      throw new MailTransportConfigError(
        `Unknown mail transport '${transportId}'! Expected one of: ${MAIL_TRANSPORT_KINDS.join(", ")}.`,
      );
    }
    kind = transportId;
  }
  const config: MailTransportConfig = loadMailTransportConfig(env, kind);
  switch (config.kind) {
    case "resend": {
      const { ResendMailTransport } = await import("./ResendMailTransport");
      return new ResendMailTransport(config.apiKey);
    }
    case "smtp": {
      const { SmtpMailTransport } = await import("./SmtpMailTransport");
      return new SmtpMailTransport(config);
    }
    case "test-database-transport": {
      const { TestDatabaseMailTransport } = await import(
        "./TestDatabaseMailTransport"
      );
      return new TestDatabaseMailTransport();
    }
  }
}

export default loadMailTransport;
