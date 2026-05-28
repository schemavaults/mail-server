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
  resourceName: string;
  usedAmount: number;
  limitAmount: number;
  upgradeUrl: string;
  unit?: string;
  recipientName?: string;
  planName?: string;
  resetAt?: string;
  topConsumers?: string[];
  manageUsageUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties or oklch(), so the token values are inlined as hex.
// BRAND_BLUE / BRAND_RED mirror `--schemavaults-brand-blue` (#60a5fa) and `--schemavaults-brand-red` (#dc2626).
// AMBER values approximate the `--warning` token used by the trial-ending template.
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const TRACK_BG = "#e2e8f0";

const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
const BLUE_BG = "#eff6ff";
const BLUE_BORDER = "#bfdbfe";
const BLUE_FOREGROUND = "#1e3a8a";

const AMBER = "#f59e0b";
const AMBER_DARK = "#b45309";
const AMBER_BG = "#fffbeb";
const AMBER_BORDER = "#fde68a";
const AMBER_FOREGROUND = "#78350f";

const BRAND_RED = "#dc2626";
const BRAND_RED_DARK = "#991b1b";
const RED_BG = "#fef2f2";
const RED_BORDER = "#fecaca";
const RED_FOREGROUND = "#7f1d1d";

type Severity = "normal" | "near" | "over";

interface SeverityTheme {
  accent: string;
  accentDark: string;
  panelBg: string;
  panelBorder: string;
  panelForeground: string;
  eyebrow: string;
  pillLabel: string;
}

function severityFor(percent: number): Severity {
  if (percent >= 100) {
    return "over";
  }
  if (percent >= 80) {
    return "near";
  }
  return "normal";
}

function themeForSeverity(severity: Severity): SeverityTheme {
  switch (severity) {
    case "over":
      return {
        accent: BRAND_RED,
        accentDark: BRAND_RED_DARK,
        panelBg: RED_BG,
        panelBorder: RED_BORDER,
        panelForeground: RED_FOREGROUND,
        eyebrow: "Limit reached",
        pillLabel: "Limit reached",
      };
    case "near":
      return {
        accent: AMBER,
        accentDark: AMBER_DARK,
        panelBg: AMBER_BG,
        panelBorder: AMBER_BORDER,
        panelForeground: AMBER_FOREGROUND,
        eyebrow: "Usage alert",
        pillLabel: "Approaching limit",
      };
    default:
      return {
        accent: BRAND_BLUE,
        accentDark: BRAND_BLUE_DARK,
        panelBg: BLUE_BG,
        panelBorder: BLUE_BORDER,
        panelForeground: BLUE_FOREGROUND,
        eyebrow: "Usage update",
        pillLabel: "On track",
      };
  }
}

function formatAmount(value: number, unit: string | undefined): string {
  const rounded: number = Number.isInteger(value)
    ? value
    : Math.round(value * 100) / 100;
  const formatted: string = rounded.toLocaleString("en-US");
  return unit ? `${formatted} ${unit}` : formatted;
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
    typeof props.usedAmount !== "number" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'usedAmount' in props for UsageLimitWarningEmail template!",
    );
  }
  if (
    typeof props.limitAmount !== "number" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'limitAmount' in props for UsageLimitWarningEmail template!",
    );
  }
  if (
    typeof props.upgradeUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'upgradeUrl' in props for UsageLimitWarningEmail template!",
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
      : "plan usage";
  const unit: string | undefined =
    typeof props.unit === "string" && props.unit.length > 0
      ? props.unit
      : undefined;
  const planName: string | undefined =
    typeof props.planName === "string" && props.planName.length > 0
      ? props.planName
      : undefined;
  const resetAt: string | undefined =
    typeof props.resetAt === "string" && props.resetAt.length > 0
      ? props.resetAt
      : undefined;
  const manageUsageUrl: string | undefined =
    typeof props.manageUsageUrl === "string" && props.manageUsageUrl.length > 0
      ? props.manageUsageUrl
      : undefined;
  const topConsumers: string[] = Array.isArray(props.topConsumers)
    ? props.topConsumers.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      )
    : [];

  const safeUsed: number =
    typeof props.usedAmount === "number" && Number.isFinite(props.usedAmount)
      ? Math.max(0, props.usedAmount)
      : 0;
  const safeLimit: number =
    typeof props.limitAmount === "number" && Number.isFinite(props.limitAmount)
      ? Math.max(0, props.limitAmount)
      : 0;

  const rawPercent: number = safeLimit > 0 ? (safeUsed / safeLimit) * 100 : 0;
  const displayPercent: number = Math.round(rawPercent);
  const barPercent: number = Math.max(0, Math.min(100, Math.round(rawPercent)));
  const remainingAmount: number = Math.max(0, safeLimit - safeUsed);

  const severity: Severity = severityFor(rawPercent);
  const t: SeverityTheme = themeForSeverity(severity);

  const headingText: string =
    severity === "over"
      ? `You've reached your ${resourceName} limit.`
      : `You've used ${displayPercent}% of your ${resourceName}.`;

  const previewText: string =
    severity === "over"
      ? `Action needed: you've used all of your ${resourceName} on ${productName} (${formatAmount(safeUsed, unit)} of ${formatAmount(safeLimit, unit)}).`
      : `Heads up: you've used ${displayPercent}% of your ${resourceName} on ${productName} (${formatAmount(safeUsed, unit)} of ${formatAmount(safeLimit, unit)}).`;

  const introText: string =
    severity === "over"
      ? `You've used all of your included ${resourceName}${planName ? ` on the ${planName} plan` : ""}. Until your quota resets${resetAt ? ` on ${resetAt}` : ""} or you upgrade, new requests against this resource may be throttled or rejected.`
      : `You're getting close to your included ${resourceName}${planName ? ` on the ${planName} plan` : ""}. Upgrade now to raise your limit and avoid any interruption${resetAt ? ` before your quota resets on ${resetAt}` : ""}.`;

  const metaRows: Array<[string, string]> = [];
  if (planName) {
    metaRows.push(["Current plan", planName]);
  }
  metaRows.push(["Used", formatAmount(safeUsed, unit)]);
  metaRows.push(["Included", formatAmount(safeLimit, unit)]);
  metaRows.push(["Remaining", formatAmount(remainingAmount, unit)]);
  if (resetAt) {
    metaRows.push(["Resets", resetAt]);
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
              background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accentDark} 100%)`,
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
              {productName} · {t.eyebrow}
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
              {headingText}
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
              {displayPercent}% used · {t.pillLabel}
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
              {introText}
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: PANEL_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{ borderCollapse: "collapse", width: "100%" }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        color: MUTED_FOREGROUND,
                        fontSize: "12px",
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        verticalAlign: "bottom",
                      }}
                    >
                      {resourceName}
                    </td>
                    <td
                      style={{
                        color: t.accentDark,
                        fontSize: "20px",
                        fontWeight: 700,
                        textAlign: "right",
                        verticalAlign: "bottom",
                      }}
                    >
                      {displayPercent}%
                    </td>
                  </tr>
                </tbody>
              </table>

              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                width="100%"
                style={{
                  backgroundColor: TRACK_BG,
                  borderCollapse: "collapse",
                  borderRadius: "999px",
                  margin: "10px 0 10px 0",
                  width: "100%",
                }}
              >
                <tbody>
                  <tr>
                    <td
                      width={`${barPercent}%`}
                      style={{
                        backgroundColor: t.accent,
                        borderRadius: "999px",
                        fontSize: "1px",
                        height: "12px",
                        lineHeight: "12px",
                        width: `${barPercent}%`,
                      }}
                    >
                      &nbsp;
                    </td>
                    <td
                      width={`${100 - barPercent}%`}
                      style={{
                        fontSize: "1px",
                        height: "12px",
                        lineHeight: "12px",
                        width: `${100 - barPercent}%`,
                      }}
                    >
                      &nbsp;
                    </td>
                  </tr>
                </tbody>
              </table>

              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.5",
                  margin: 0,
                }}
              >
                {formatAmount(safeUsed, unit)} of {formatAmount(safeLimit, unit)}{" "}
                used
                {resetAt ? ` · resets ${resetAt}` : ""}
              </Text>
            </div>
          </Section>

          <Section style={{ padding: "16px 32px 8px 32px" }}>
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
                        textAlign: "right",
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

          {topConsumers.length > 0 ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: t.panelBg,
                  border: `1px solid ${t.panelBorder}`,
                  borderLeft: `4px solid ${t.accentDark}`,
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <Text
                  style={{
                    color: t.panelForeground,
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    margin: "0 0 6px 0",
                    textTransform: "uppercase",
                  }}
                >
                  What's driving usage
                </Text>
                <ul
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                    paddingLeft: "20px",
                  }}
                >
                  {topConsumers.map((item) => (
                    <li key={item} style={{ margin: "2px 0" }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={props.upgradeUrl}
              style={{
                backgroundColor: t.accentDark,
                borderRadius: "8px",
                color: "#ffffff",
                display: "inline-block",
                fontSize: "15px",
                fontWeight: 600,
                padding: "12px 22px",
                textDecoration: "none",
              }}
            >
              {severity === "over" ? "Upgrade to restore access" : "Upgrade plan"}
            </Button>
          </Section>

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
                href={props.upgradeUrl}
                style={{ color: t.accentDark, textDecoration: "none" }}
              >
                {props.upgradeUrl}
              </a>
            </Text>
          </Section>

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
                  Want a full breakdown of where your {resourceName} is going?
                  View your{" "}
                  <a
                    href={manageUsageUrl}
                    style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
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
              Questions about your limits, usage, or the right plan for your
              team? Reply to this email or reach us at{" "}
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
            © {new Date().getFullYear()} {productName}. You are receiving this
            email because your account is approaching or has reached a usage
            limit.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

UsageLimitWarningEmail.PreviewProps = {
  recipientName: "Jane Doe",
  resourceName: "API requests",
  usedAmount: 92500,
  limitAmount: 100000,
  unit: "requests",
  planName: "Pro",
  resetAt: "Jun 1, 2026 00:00 UTC",
  upgradeUrl: "https://schemavaults.com/billing/upgrade?plan=scale",
  manageUsageUrl: "https://schemavaults.com/account/usage",
  topConsumers: [
    "schema-validation endpoint — 61,200 requests",
    "vault-read endpoint — 24,800 requests",
    "webhook deliveries — 6,500 requests",
  ],
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies UsageLimitWarningEmailProps;
