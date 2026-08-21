import MailTransportConfigError from "./MailTransportConfigError";

export const MAIL_TRANSPORT_KINDS = ["resend", "smtp"] as const;
export type MailTransportKind = (typeof MAIL_TRANSPORT_KINDS)[number];

export const DEFAULT_MAIL_TRANSPORT: MailTransportKind = "resend";
export const DEFAULT_SMTP_PORT = 587;

export interface IResendTransportConfig {
  kind: "resend";
  apiKey: string;
}

export interface ISmtpTransportConfig {
  kind: "smtp";
  host: string;
  port: number;
  /** true = implicit TLS (SMTPS); false = plaintext connect + STARTTLS upgrade. */
  secure: boolean;
  auth: { user: string; pass: string } | null;
}

export type MailTransportConfig = IResendTransportConfig | ISmtpTransportConfig;

function isMailTransportKind(val: string): val is MailTransportKind {
  return (MAIL_TRANSPORT_KINDS as readonly string[]).includes(val);
}

function parseBooleanEnvVar(name: string, raw: string): boolean {
  const normalized = raw.trim().toLowerCase();
  if (normalized === "true" || normalized === "1") return true;
  if (normalized === "false" || normalized === "0") return false;
  throw new MailTransportConfigError(
    `Invalid value for '${name}': expected "true" or "false", got '${raw}'.`,
  );
}

/**
 * Resolves the outbound mail transport configuration from environment
 * variables (see .env.example). `MAIL_TRANSPORT` selects the transport and
 * defaults to "resend" when unset, so existing deployments are unaffected.
 *
 * @throws {MailTransportConfigError} when the selected transport's required
 * variables are missing or malformed. Config problems surface at first send,
 * matching how a missing RESEND_API_KEY has always behaved.
 */
export function loadMailTransportConfig(
  env: Record<string, string | undefined> = process.env,
): MailTransportConfig {
  const rawKind: string =
    env.MAIL_TRANSPORT && env.MAIL_TRANSPORT.trim().length > 0
      ? env.MAIL_TRANSPORT.trim().toLowerCase()
      : DEFAULT_MAIL_TRANSPORT;
  if (!isMailTransportKind(rawKind)) {
    throw new MailTransportConfigError(
      `Unknown MAIL_TRANSPORT '${rawKind}'! Expected one of: ${MAIL_TRANSPORT_KINDS.join(", ")}.`,
    );
  }

  if (rawKind === "resend") {
    const apiKey: string | undefined = env.RESEND_API_KEY;
    if (!apiKey || typeof apiKey !== "string") {
      throw new MailTransportConfigError(
        "Failed to load Resend API key from environment variable 'RESEND_API_KEY'!",
      );
    }
    return { kind: "resend", apiKey };
  }

  const host: string | undefined = env.SMTP_HOST?.trim();
  if (!host) {
    throw new MailTransportConfigError(
      "MAIL_TRANSPORT is 'smtp' but 'SMTP_HOST' is not set!",
    );
  }

  let port: number = DEFAULT_SMTP_PORT;
  if (env.SMTP_PORT && env.SMTP_PORT.trim().length > 0) {
    port = Number(env.SMTP_PORT.trim());
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new MailTransportConfigError(
        `Invalid value for 'SMTP_PORT': expected an integer between 1 and 65535, got '${env.SMTP_PORT}'.`,
      );
    }
  }

  // Unset SMTP_SECURE follows the port convention: implicit TLS on 465
  // (SMTPS), STARTTLS everywhere else. An explicit value always wins.
  const secure: boolean =
    env.SMTP_SECURE && env.SMTP_SECURE.trim().length > 0
      ? parseBooleanEnvVar("SMTP_SECURE", env.SMTP_SECURE)
      : port === 465;

  const user: string | undefined = env.SMTP_USER;
  const pass: string | undefined = env.SMTP_PASS;
  if ((user && !pass) || (!user && pass)) {
    throw new MailTransportConfigError(
      "'SMTP_USER' and 'SMTP_PASS' must either both be set or both be unset!",
    );
  }

  return {
    kind: "smtp",
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : null,
  };
}

export default loadMailTransportConfig;
