import {
  getEmailBrand,
  type EmailBrand,
} from "@/email-templates/brand";

/**
 * Full white-label brand configuration for the web app, resolved server-side
 * from environment variables (see .env.example for the complete list). The
 * object is JSON-serializable so the root layout can thread it to client
 * components through <BrandingProvider>.
 */
export interface BrandConfig {
  /** Brand/product name shown in UI chrome, metadata, and email copy. */
  name: string;
  /** URL of the brand's main web app (wordmark + footer links). */
  url: string;
  /** Support contact address. */
  supportEmail: string;
  /**
   * Wordmark gradient [from, to] CSS colors, configured via
   * BRAND_PRIMARY_COLOR / BRAND_SECONDARY_COLOR. Null when unconfigured, in
   * which case the <Wordmark /> component falls back to the theme's default
   * brand-color tokens.
   */
  wordmarkGradient: [from: string, to: string] | null;
  /** Optional footer/social links; the UI hides entries that are null. */
  githubUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  privacyPolicyUrl: string | null;
  termsUrl: string | null;
}

function readEnv(name: string): string | null {
  const value = process.env[name];
  return typeof value === "string" && value.length > 0 ? value : null;
}

/**
 * Resolves the brand configuration from BRAND_* environment variables,
 * falling back to the SchemaVaults defaults so an unconfigured deployment
 * keeps its previous appearance.
 */
export function getBrandConfig(): BrandConfig {
  const emailBrand: EmailBrand = getEmailBrand();

  const primaryColor = readEnv("BRAND_PRIMARY_COLOR");
  const secondaryColor = readEnv("BRAND_SECONDARY_COLOR");

  return {
    name: emailBrand.productName,
    url: emailBrand.url,
    supportEmail: emailBrand.supportEmail,
    wordmarkGradient:
      primaryColor && secondaryColor ? [primaryColor, secondaryColor] : null,
    githubUrl: readEnv("BRAND_GITHUB_URL"),
    twitterUrl: readEnv("BRAND_TWITTER_URL"),
    linkedinUrl: readEnv("BRAND_LINKEDIN_URL"),
    privacyPolicyUrl: readEnv("BRAND_PRIVACY_POLICY_URL"),
    termsUrl: readEnv("BRAND_TERMS_URL"),
  };
}

/**
 * Whether the homepage should display the public mailing list directory.
 * Configured via HOMEPAGE_SHOW_MAILING_LISTS; defaults to enabled so an
 * unconfigured deployment keeps its previous behavior. Deployments that use
 * this app solely as an email template/sender (not as a mailing list
 * management tool) can set it to "false" — the homepage then renders a
 * minimal branded landing page instead of the mailing list directory.
 */
export function isHomepageMailingListDirectoryEnabled(): boolean {
  const value = readEnv("HOMEPAGE_SHOW_MAILING_LISTS");
  if (!value) {
    return true;
  }
  return !["false", "0", "no", "off"].includes(value.trim().toLowerCase());
}

/**
 * Default From: header for outbound mail, e.g. `Acme <noreply@acme.com>`.
 * Configured via MAIL_FROM_ADDRESS and MAIL_FROM_NAME (the latter defaults
 * to the brand name).
 */
export function getDefaultMailFrom(): string {
  const address = readEnv("MAIL_FROM_ADDRESS") ?? "noreply@schemavaults.com";
  const name = readEnv("MAIL_FROM_NAME") ?? getEmailBrand().productName;
  return `${name} <${address}>`;
}

export default getBrandConfig;
