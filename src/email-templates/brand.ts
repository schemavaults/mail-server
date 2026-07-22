// Shared white-label brand settings for the email templates in this
// directory. Every template pulls its default product name, URLs, support
// contact, and accent colors from here instead of hardcoding a brand, so a
// deployment can be fully re-branded via environment variables alone.
//
// This module is intentionally self-contained (no path-alias imports, no
// "server-only") because the react-email preview server (`bun run dev:mail`)
// bundles template files outside of the Next.js toolchain.

export interface EmailBrandColors {
  /**
   * Light accent used as the first stop of hero-header gradients.
   * Configured via BRAND_ACCENT_COLOR.
   */
  accent: string;
  /**
   * Primary brand color used for buttons, links, and the second stop of
   * hero-header gradients. Configured via BRAND_PRIMARY_COLOR.
   */
  accentDark: string;
}

export interface EmailBrand {
  /** Brand/product name used in email copy. Configured via BRAND_NAME. */
  productName: string;
  /** URL of the brand's main web app. Configured via BRAND_URL. */
  url: string;
  /** Support contact address. Configured via BRAND_SUPPORT_EMAIL. */
  supportEmail: string;
  colors: EmailBrandColors;
}

function readEnv(name: string): string | null {
  // Guarded lookup so this also works in non-Node bundles (e.g. client
  // bundles that import a template module for its types/PreviewProps),
  // where process.env is stubbed out.
  const value =
    typeof process !== "undefined" && typeof process.env === "object"
      ? process.env[name]
      : undefined;
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Normalizes a configured URL (scheme optional; https assumed) to an origin. */
function readEnvUrl(name: string): string | null {
  const configured = readEnv(name);
  if (!configured) {
    return null;
  }
  try {
    return new URL(
      configured.includes("://") ? configured : `https://${configured}`,
    ).origin;
  } catch {
    return null;
  }
}

// Fallbacks when no BRAND_* environment variables are configured. These are
// the SchemaVaults defaults so an unconfigured deployment keeps its previous
// behavior; white-label deployments override them via environment variables.
const DEFAULT_PRODUCT_NAME = "SchemaVaults";
const DEFAULT_URL = "https://schemavaults.com";
const DEFAULT_SUPPORT_EMAIL = "support@schemavaults.com";
// Hex values mirror the @schemavaults/theme brand tokens; email clients don't
// resolve CSS custom properties, so concrete colors are required here.
const DEFAULT_ACCENT = "#60a5fa";
const DEFAULT_ACCENT_DARK = "#2563eb";

/**
 * Resolves the brand identity used inside rendered emails. Reads the BRAND_*
 * environment variables on every call so the values reflect the runtime
 * environment (and remain overridable per-send via template props).
 */
export function getEmailBrand(): EmailBrand {
  return {
    productName: readEnv("BRAND_NAME") ?? DEFAULT_PRODUCT_NAME,
    url: readEnvUrl("BRAND_URL") ?? DEFAULT_URL,
    supportEmail: readEnv("BRAND_SUPPORT_EMAIL") ?? DEFAULT_SUPPORT_EMAIL,
    colors: {
      accent: readEnv("BRAND_ACCENT_COLOR") ?? DEFAULT_ACCENT,
      accentDark: readEnv("BRAND_PRIMARY_COLOR") ?? DEFAULT_ACCENT_DARK,
    },
  };
}

export default getEmailBrand;
