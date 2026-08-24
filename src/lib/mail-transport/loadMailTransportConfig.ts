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

export function isMailTransportKind(val: string): val is MailTransportKind {
  return (MAIL_TRANSPORT_KINDS as readonly string[]).includes(val);
}

/**
 * Snapshot of which transports this deployment offers. A transport is
 * "configured" when its required env vars are present (`RESEND_API_KEY` for
 * resend, `SMTP_HOST` for smtp) — both may be configured at once. The
 * default transport is selected by `MAIL_TRANSPORT` (default "resend") and
 * is what `/api/send` uses when a request omits its `transport` property.
 */
export interface IMailTransportsAvailability {
  /** Transport ids with their env vars present, in registry order. */
  configured: MailTransportKind[];
  /** Default transport id per MAIL_TRANSPORT. Not necessarily configured. */
  defaultTransport: MailTransportKind;
}

/**
 * Resolves the default transport id from `MAIL_TRANSPORT`.
 *
 * @throws {MailTransportConfigError} when MAIL_TRANSPORT names an unknown
 * transport kind.
 */
export function loadDefaultMailTransportKind(
  env: Record<string, string | undefined> = process.env,
): MailTransportKind {
  const rawKind: string =
    env.MAIL_TRANSPORT && env.MAIL_TRANSPORT.trim().length > 0
      ? env.MAIL_TRANSPORT.trim().toLowerCase()
      : DEFAULT_MAIL_TRANSPORT;
  if (!isMailTransportKind(rawKind)) {
    throw new MailTransportConfigError(
      `Unknown MAIL_TRANSPORT '${rawKind}'! Expected one of: ${MAIL_TRANSPORT_KINDS.join(", ")}.`,
    );
  }
  return rawKind;
}

/**
 * Reports which transports are configured (per their env vars) and which is
 * the default. Presence checks only — a configured transport can still fail
 * `loadMailTransportConfig` on malformed values (e.g. a bad SMTP_PORT), which
 * surfaces at send time as it always has.
 *
 * @throws {MailTransportConfigError} when MAIL_TRANSPORT names an unknown
 * transport kind.
 */
export function loadMailTransportsAvailability(
  env: Record<string, string | undefined> = process.env,
): IMailTransportsAvailability {
  const configured: MailTransportKind[] = [];
  if (env.RESEND_API_KEY && env.RESEND_API_KEY.trim().length > 0) {
    configured.push("resend");
  }
  if (env.SMTP_HOST && env.SMTP_HOST.trim().length > 0) {
    configured.push("smtp");
  }
  return {
    configured,
    defaultTransport: loadDefaultMailTransportKind(env),
  };
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
 * Resolves one transport's configuration from environment variables (see
 * .env.example). When `kind` is provided, that transport's config is loaded;
 * when omitted, the default transport selected by `MAIL_TRANSPORT` (default
 * "resend") is loaded, so existing single-transport deployments are
 * unaffected.
 *
 * @throws {MailTransportConfigError} when the selected transport's required
 * variables are missing or malformed. Config problems surface at first send,
 * matching how a missing RESEND_API_KEY has always behaved.
 */
export function loadMailTransportConfig(
  env: Record<string, string | undefined> = process.env,
  kind?: MailTransportKind,
): MailTransportConfig {
  const rawKind: MailTransportKind = kind ?? loadDefaultMailTransportKind(env);

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
      "The 'smtp' mail transport is selected but 'SMTP_HOST' is not set!",
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
