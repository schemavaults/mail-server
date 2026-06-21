import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactElement } from "react";

export interface UsageLimitWarningEmailProps {
  recipientName?: string;
  resourceName: string;
  usagePercent: number;
  currentUsage?: string;
  usageLimit?: string;
  periodResetDate?: string;
  planName?: string;
  upgradeUrl?: string;
  manageUsageUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand, destructive, and warning tokens
// (see node_modules/@schemavaults/theme/globals.css). Email clients don't
// resolve CSS custom properties or oklch(), so the token values are inlined
// here as hex. AMBER values approximate the `--warning` token; the BRAND_RED
// values match `--schemavaults-brand-red`.
const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
const BRAND_RED = "#dc2626";
const BRAND_RED_DARK = "#b91c1c";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const AMBER = "#f59e0b";
const AMBER_DARK = "#b45309";
const AMBER_BG = "#fffbeb";
const AMBER_BORDER = "#fde68a";
const AMBER_FOREGROUND = "#78350f";
const BLUE_BG = "#eff6ff";
const BLUE_BORDER = "#bfdbfe";
const BLUE_FOREGROUND = "#1e3a8a";
const RED_BG = "#fef2f2";
const RED_BORDER = "#fecaca";
const RED_FOREGROUND = "#7f1d1d";
const TRACK_BG = "#e2e8f0";

type Severity = "approaching" | "warning" | "critical" | "exceeded";

interface SeverityPalette {
  gradientFrom: string;
  gradientTo: string;
  accent: string;
  accentDark: string;
  panelBg: string;
  panelBorder: string;
  panelForeground: string;
  barFill: string;
  pillLabel: string;
  eyebrow: string;
  heading: (resource: string) => string;
  lede: (resource: string, product: string) => string;
  calloutTitle: string;
  ctaLabel: (planName: string) => string;
  footnote: string;
}

const SEVERITY_PALETTE: Record<Severity, SeverityPalette> = {
  approaching: {
    gradientFrom: BRAND_BLUE,
    gradientTo: BRAND_BLUE_DARK,
    accent: BRAND_BLUE_DARK,
    accentDark: BRAND_BLUE_DARK,
    panelBg: BLUE_BG,
    panelBorder: BLUE_BORDER,
    panelForeground: BLUE_FOREGROUND,
    barFill: BRAND_BLUE_DARK,
    pillLabel: "Heads up",
    eyebrow: "Usage notice",
    heading: (resource) => `You're approaching your ${resource} limit`,
    lede: (resource, product) =>
      `You're on track to hit your ${product} ${resource} limit before the end of this billing period. We wanted to give you a heads-up so nothing breaks unexpectedly.`,
    calloutTitle: "What this means",
    ctaLabel: (planName) =>
      planName === "Pro" ? "Upgrade to a higher tier" : `Upgrade from ${planName}`,
    footnote:
      "You are receiving this email because usage on your account crossed a notification threshold.",
  },
  warning: {
    gradientFrom: AMBER,
    gradientTo: AMBER_DARK,
    accent: AMBER_DARK,
    accentDark: AMBER_DARK,
    panelBg: AMBER_BG,
    panelBorder: AMBER_BORDER,
    panelForeground: AMBER_FOREGROUND,
    barFill: AMBER_DARK,
    pillLabel: "Action recommended",
    eyebrow: "Usage warning",
    heading: (resource) => `You're close to your ${resource} limit`,
    lede: (resource, product) =>
      `Your ${product} account has used most of its ${resource} allowance for this billing period. To avoid hitting the cap, consider upgrading or tuning usage now.`,
    calloutTitle: "What happens at 100%",
    ctaLabel: (planName) =>
      planName === "Pro" ? "Upgrade to a higher tier" : `Upgrade from ${planName}`,
    footnote:
      "You are receiving this email because usage on your account crossed a notification threshold.",
  },
  critical: {
    gradientFrom: BRAND_RED,
    gradientTo: BRAND_RED_DARK,
    accent: BRAND_RED,
    accentDark: BRAND_RED_DARK,
    panelBg: RED_BG,
    panelBorder: RED_BORDER,
    panelForeground: RED_FOREGROUND,
    barFill: BRAND_RED,
    pillLabel: "Action required",
    eyebrow: "Usage critical",
    heading: (resource) => `You're almost out of ${resource}`,
    lede: (resource, product) =>
      `Your ${product} account has nearly exhausted its ${resource} allowance. New requests will start failing once you reach the limit — upgrade now to keep things running smoothly.`,
    calloutTitle: "What happens at 100%",
    ctaLabel: () => "Upgrade now",
    footnote:
      "You are receiving this email because usage on your account is at a critical level.",
  },
  exceeded: {
    gradientFrom: BRAND_RED,
    gradientTo: BRAND_RED_DARK,
    accent: BRAND_RED,
    accentDark: BRAND_RED_DARK,
    panelBg: RED_BG,
    panelBorder: RED_BORDER,
    panelForeground: RED_FOREGROUND,
    barFill: BRAND_RED,
    pillLabel: "Limit reached",
    eyebrow: "Usage exceeded",
    heading: (resource) => `You've hit your ${resource} limit`,
    lede: (resource, product) =>
      `Your ${product} account has reached its ${resource} cap for this billing period. New ${resource} requests will be rejected until the period resets or you upgrade.`,
    calloutTitle: "What's blocked right now",
    ctaLabel: () => "Upgrade now",
    footnote:
      "You are receiving this email because usage on your account exceeded the plan limit.",
  },
};

function clampPercent(raw: unknown): number {
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    return 0;
  }
  if (raw < 0) return 0;
  if (raw > 100) return 100;
  return raw;
}

function severityForPercent(pct: number): Severity {
  if (pct >= 100) return "exceeded";
  if (pct >= 90) return "critical";
  if (pct >= 75) return "warning";
  return "approaching";
}

export default function UsageLimitWarningEmail(
  props: UsageLimitWarningEmailProps,
): ReactElement {
  if (
    typeof props.resourceName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'resourceName' in props for UsageLimitWarningEmail template!",
    );
  }
  if (
    typeof props.usagePercent !== "number" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'usagePercent' in props for UsageLimitWarningEmail template!",
    );
  }

  const productName: string =
    typeof props.productName === "string" && props.productName.length > 0
      ? props.productName
      : "SchemaVaults";
  const supportEmail: string =
    typeof props.supportEmail === "string" && props.supportEmail.length > 0
      ? props.supportEmail
      : "support@schemavaults.com";
  const greetingName: string =
    typeof props.recipientName === "string" && props.recipientName.length > 0
      ? props.recipientName
      : "there";
  const resourceName: string =
    typeof props.resourceName === "string" && props.resourceName.length > 0
      ? props.resourceName
      : "usage";
  const planName: string =
    typeof props.planName === "string" && props.planName.length > 0
      ? props.planName
      : "your current plan";
  const currentUsage: string | undefined =
    typeof props.currentUsage === "string" && props.currentUsage.length > 0
      ? props.currentUsage
      : undefined;
  const usageLimit: string | undefined =
    typeof props.usageLimit === "string" && props.usageLimit.length > 0
      ? props.usageLimit
      : undefined;
  const periodResetDate: string | undefined =
    typeof props.periodResetDate === "string" && props.periodResetDate.length > 0
      ? props.periodResetDate
      : undefined;
  const upgradeUrl: string | undefined =
    typeof props.upgradeUrl === "string" && props.upgradeUrl.length > 0
      ? props.upgradeUrl
      : undefined;
  const manageUsageUrl: string | undefined =
    typeof props.manageUsageUrl === "string" && props.manageUsageUrl.length > 0
      ? props.manageUsageUrl
      : undefined;

  const safePercent: number = clampPercent(props.usagePercent);
  const displayPercent: number = Math.round(safePercent);
  const severity: Severity = severityForPercent(safePercent);
  const palette: SeverityPalette = SEVERITY_PALETTE[severity];

  const usageSummary: string | undefined =
    currentUsage && usageLimit
      ? `${currentUsage} of ${usageLimit}`
      : currentUsage ?? usageLimit;

  const previewText: string =
    severity === "exceeded"
      ? `${productName} ${resourceName} limit reached (${displayPercent}%). ${
          periodResetDate
            ? `Resets ${periodResetDate}.`
            : "Upgrade to keep things running."
        }`
      : `${productName} ${resourceName} at ${displayPercent}%${
          usageSummary ? ` — ${usageSummary}` : ""
        }.`;

  const metaRows: Array<[string, string]> = [];
  metaRows.push(["Resource", resourceName]);
  if (usageSummary) {
    metaRows.push(["Used", usageSummary]);
  }
  metaRows.push(["Plan", planName]);
  if (periodResetDate) {
    metaRows.push(["Resets", periodResetDate]);
  }

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body
        style={{
          backgroundColor: PAGE_BG,
          color: FOREGROUND,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          margin: 0,
          padding: "32px 0",
        }}
      >
        <Container
          style={{
            backgroundColor: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: "12px",
            margin: "0 auto",
            maxWidth: "560px",
            overflow: "hidden",
            padding: 0,
          }}
        >
          <Section
            style={{
              background: `linear-gradient(135deg, ${palette.gradientFrom} 0%, ${palette.gradientTo} 100%)`,
              padding: "32px 32px 28px 32px",
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              {productName} · {palette.eyebrow}
            </Text>
            <Heading
              as="h1"
              style={{
                color: "#ffffff",
                fontSize: "26px",
                fontWeight: 700,
                lineHeight: "1.25",
                margin: "8px 0 12px 0",
              }}
            >
              {palette.heading(resourceName)}
            </Heading>
            <span
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.18)",
                border: "1px solid rgba(255, 255, 255, 0.35)",
                borderRadius: "999px",
                color: "#ffffff",
                display: "inline-block",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                padding: "4px 12px",
                textTransform: "uppercase",
              }}
            >
              {palette.pillLabel} · {displayPercent}% used
            </span>
          </Section>

          <Section style={{ padding: "28px 32px 8px 32px" }}>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "16px",
                lineHeight: "1.6",
                margin: "0 0 8px 0",
              }}
            >
              Hi {greetingName},
            </Text>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "15px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              {palette.lede(resourceName, productName)}
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 0 32px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                {resourceName}
              </Text>
              <Text
                style={{
                  color: palette.accentDark,
                  fontSize: "13px",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                {displayPercent}%
              </Text>
            </div>
            <div
              role="presentation"
              style={{
                backgroundColor: TRACK_BG,
                borderRadius: "999px",
                height: "10px",
                overflow: "hidden",
                width: "100%",
              }}
            >
              <div
                style={{
                  backgroundColor: palette.barFill,
                  borderRadius: "999px",
                  height: "10px",
                  width: `${displayPercent}%`,
                }}
              />
            </div>
            {usageSummary ? (
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "12px",
                  lineHeight: "1.5",
                  margin: "8px 0 0 0",
                }}
              >
                {usageSummary}
                {periodResetDate ? ` · resets ${periodResetDate}` : ""}
              </Text>
            ) : null}
          </Section>

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              style={{ borderCollapse: "collapse", width: "100%" }}
            >
              <tbody>
                {metaRows.map(([label, value]) => (
                  <tr key={label}>
                    <td
                      style={{
                        color: MUTED_FOREGROUND,
                        fontSize: "13px",
                        lineHeight: "1.6",
                        padding: "4px 12px 4px 0",
                        verticalAlign: "top",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </td>
                    <td
                      style={{
                        color: FOREGROUND,
                        fontSize: "13px",
                        fontWeight: 500,
                        lineHeight: "1.6",
                        padding: "4px 0",
                        verticalAlign: "top",
                      }}
                    >
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section style={{ padding: "16px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: palette.panelBg,
                border: `1px solid ${palette.panelBorder}`,
                borderLeft: `4px solid ${palette.accent}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: palette.panelForeground,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 6px 0",
                  textTransform: "uppercase",
                }}
              >
                {palette.calloutTitle}
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                {severity === "exceeded"
                  ? `New ${resourceName} requests on this account are being rejected with a quota error until ${
                      periodResetDate
                        ? `the period resets on ${periodResetDate}`
                        : "the next billing period"
                    } — or until you upgrade.`
                  : severity === "critical"
                    ? `Once usage reaches 100%, new ${resourceName} requests will be rejected. Upgrading takes effect immediately and the new ceiling applies to in-flight requests.`
                    : severity === "warning"
                      ? `Once usage reaches 100%, new ${resourceName} requests will be rejected until ${
                          periodResetDate
                            ? `the period resets on ${periodResetDate}`
                            : "the next billing period"
                        }. Upgrading now avoids any interruption.`
                      : `Nothing is blocked yet. We send this notification when usage crosses 50% so you can plan ahead before any cap is hit.`}
              </Text>
            </div>
          </Section>

          {upgradeUrl ? (
            <Section style={{ padding: "20px 32px 8px 32px" }}>
              <Button
                href={upgradeUrl}
                style={{
                  backgroundColor: palette.accentDark,
                  borderRadius: "8px",
                  color: "#ffffff",
                  display: "inline-block",
                  fontSize: "15px",
                  fontWeight: 600,
                  padding: "12px 22px",
                  textDecoration: "none",
                }}
              >
                {palette.ctaLabel(planName)}
              </Button>
            </Section>
          ) : null}

          {upgradeUrl ? (
            <Section style={{ padding: "8px 32px 8px 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "12px",
                  lineHeight: "1.55",
                  margin: 0,
                  wordBreak: "break-all",
                }}
              >
                Or copy this link into your browser:{" "}
                <a
                  href={upgradeUrl}
                  style={{ color: palette.accentDark, textDecoration: "none" }}
                >
                  {upgradeUrl}
                </a>
              </Text>
            </Section>
          ) : null}

          {manageUsageUrl ? (
            <Section style={{ padding: "12px 32px 24px 32px" }}>
              <div
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "8px",
                  padding: "12px 16px",
                }}
              >
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  Prefer to tune usage instead? Review per-key and per-vault
                  consumption in your{" "}
                  <a
                    href={manageUsageUrl}
                    style={{
                      color: BRAND_BLUE_DARK,
                      textDecoration: "none",
                    }}
                  >
                    usage dashboard
                  </a>
                  .
                </Text>
              </div>
            </Section>
          ) : null}

          <Hr style={{ borderColor: BORDER, margin: "0 32px" }} />

          <Section style={{ padding: "20px 32px 28px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Questions about plan limits, custom quotas, or overage pricing?
              Reply to this email or reach us at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>
              .
            </Text>
          </Section>
        </Container>

        <Container style={{ margin: "16px auto 0 auto", maxWidth: "560px" }}>
          <Text
            style={{
              color: MUTED_FOREGROUND,
              fontSize: "12px",
              lineHeight: "1.5",
              margin: 0,
              textAlign: "center",
            }}
          >
            © {new Date().getFullYear()} {productName}. {palette.footnote}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

UsageLimitWarningEmail.PreviewProps = {
  recipientName: "Jane Doe",
  resourceName: "API requests",
  usagePercent: 92,
  currentUsage: "92,140",
  usageLimit: "100,000",
  periodResetDate: "July 1, 2026",
  planName: "Pro",
  upgradeUrl: "https://schemavaults.com/billing/upgrade?plan=scale",
  manageUsageUrl: "https://schemavaults.com/account/usage",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies UsageLimitWarningEmailProps;
