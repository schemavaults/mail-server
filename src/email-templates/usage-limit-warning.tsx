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
  currentUsage: string;
  usageLimit: string;
  percentUsed: number;
  periodLabel?: string;
  resetsAt?: string;
  planName?: string;
  upgradeUrl: string;
  dashboardUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand, warning, and destructive tokens
// (see node_modules/@schemavaults/theme/globals.css). Email clients don't
// resolve CSS custom properties or oklch(), so token values are inlined as hex.
// AMBER values approximate `--warning: oklch(82% 0.189 84.429)` and
// `--warning-foreground: oklch(41% 0.112 45.904)`.
// RED values mirror `--schemavaults-brand-red: #dc2626` and `--destructive`.
const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
const BRAND_BLUE_BG = "#eff6ff";
const BRAND_BLUE_BORDER = "#bfdbfe";
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
const RED = "#ef4444";
const RED_DARK = "#dc2626";
const RED_BG = "#fef2f2";
const RED_BORDER = "#fecaca";
const RED_FOREGROUND = "#7f1d1d";

type Severity = "info" | "warning" | "critical";

type SeverityTheme = {
  gradientFrom: string;
  gradientTo: string;
  ctaBg: string;
  badgeLabel: string;
  calloutBg: string;
  calloutBorder: string;
  calloutAccent: string;
  calloutForeground: string;
  barTrackBg: string;
  barFillBg: string;
  link: string;
};

function pickSeverity(percentUsed: number): Severity {
  if (percentUsed >= 95) return "critical";
  if (percentUsed >= 80) return "warning";
  return "info";
}

function themeForSeverity(severity: Severity): SeverityTheme {
  if (severity === "critical") {
    return {
      gradientFrom: RED,
      gradientTo: RED_DARK,
      ctaBg: RED_DARK,
      badgeLabel: "Limit reached",
      calloutBg: RED_BG,
      calloutBorder: RED_BORDER,
      calloutAccent: RED_DARK,
      calloutForeground: RED_FOREGROUND,
      barTrackBg: RED_BG,
      barFillBg: RED_DARK,
      link: RED_DARK,
    };
  }
  if (severity === "warning") {
    return {
      gradientFrom: AMBER,
      gradientTo: AMBER_DARK,
      ctaBg: AMBER_DARK,
      badgeLabel: "Approaching limit",
      calloutBg: AMBER_BG,
      calloutBorder: AMBER_BORDER,
      calloutAccent: AMBER_DARK,
      calloutForeground: AMBER_FOREGROUND,
      barTrackBg: AMBER_BG,
      barFillBg: AMBER_DARK,
      link: AMBER_DARK,
    };
  }
  return {
    gradientFrom: BRAND_BLUE,
    gradientTo: BRAND_BLUE_DARK,
    ctaBg: BRAND_BLUE_DARK,
    badgeLabel: "Usage update",
    calloutBg: BRAND_BLUE_BG,
    calloutBorder: BRAND_BLUE_BORDER,
    calloutAccent: BRAND_BLUE_DARK,
    calloutForeground: BRAND_BLUE_DARK,
    barTrackBg: PANEL_BG,
    barFillBg: BRAND_BLUE_DARK,
    link: BRAND_BLUE_DARK,
  };
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
    typeof props.currentUsage !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'currentUsage' in props for UsageLimitWarningEmail template!",
    );
  }
  if (
    typeof props.usageLimit !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'usageLimit' in props for UsageLimitWarningEmail template!",
    );
  }
  if (
    typeof props.percentUsed !== "number" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'percentUsed' in props for UsageLimitWarningEmail template!",
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
  const periodLabel: string =
    typeof props.periodLabel === "string" && props.periodLabel.length > 0
      ? props.periodLabel
      : "this billing period";
  const planName: string | undefined =
    typeof props.planName === "string" && props.planName.length > 0
      ? props.planName
      : undefined;
  const resetsAt: string | undefined =
    typeof props.resetsAt === "string" && props.resetsAt.length > 0
      ? props.resetsAt
      : undefined;
  const dashboardUrl: string | undefined =
    typeof props.dashboardUrl === "string" && props.dashboardUrl.length > 0
      ? props.dashboardUrl
      : undefined;

  const safePercentUsed: number =
    typeof props.percentUsed === "number" && Number.isFinite(props.percentUsed)
      ? Math.max(0, Math.min(100, Math.round(props.percentUsed)))
      : 0;

  const severity: Severity = pickSeverity(safePercentUsed);
  const theme = themeForSeverity(severity);

  const headingText: string =
    severity === "critical"
      ? `You've reached your ${props.resourceName} limit.`
      : severity === "warning"
        ? `You're approaching your ${props.resourceName} limit.`
        : `${props.resourceName} usage update.`;

  const previewText: string =
    severity === "critical"
      ? `${productName}: ${props.resourceName} is at ${safePercentUsed}% (${props.currentUsage} of ${props.usageLimit}) for ${periodLabel}.`
      : `${productName}: ${props.resourceName} is at ${safePercentUsed}% (${props.currentUsage} of ${props.usageLimit}) for ${periodLabel}.`;

  const metaRows: Array<[string, string]> = [
    [props.resourceName, `${props.currentUsage} / ${props.usageLimit}`],
    ["Period", periodLabel],
  ];
  if (planName) {
    metaRows.push(["Current plan", planName]);
  }
  if (resetsAt) {
    metaRows.push(["Resets", resetsAt]);
  }

  const calloutBody: string =
    severity === "critical"
      ? `New ${props.resourceName.toLowerCase()} requests will be rejected until your usage resets${
          resetsAt ? ` on ${resetsAt}` : ""
        } or you upgrade your plan.`
      : severity === "warning"
        ? `At your current rate you'll exhaust your ${props.resourceName.toLowerCase()} allowance before${
            resetsAt ? ` ${resetsAt}` : " the period resets"
          }. Upgrade now to avoid interruption.`
        : `Track your ${props.resourceName.toLowerCase()} usage in the dashboard. We'll keep you posted as you approach your plan limit.`;

  const ctaLabel: string =
    severity === "critical"
      ? "Upgrade to restore service"
      : severity === "warning"
        ? "Upgrade plan"
        : "View upgrade options";

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
              background: `linear-gradient(135deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)`,
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
              {productName} · Usage alert
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
              {theme.badgeLabel} · {safePercentUsed}%
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
              You've used <strong>{props.currentUsage}</strong> of your{" "}
              <strong>{props.usageLimit}</strong> {props.resourceName} allowance
              for {periodLabel}
              {planName ? (
                <>
                  {" "}
                  on the <strong>{planName}</strong> plan
                </>
              ) : null}
              .
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 4px 32px" }}>
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
                      paddingBottom: "8px",
                      textTransform: "uppercase",
                    }}
                  >
                    {props.resourceName}
                  </td>
                  <td
                    style={{
                      color: FOREGROUND,
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      paddingBottom: "8px",
                      textAlign: "right",
                      textTransform: "uppercase",
                    }}
                  >
                    {safePercentUsed}%
                  </td>
                </tr>
                <tr>
                  <td colSpan={2}>
                    <div
                      style={{
                        backgroundColor: theme.barTrackBg,
                        border: `1px solid ${BORDER}`,
                        borderRadius: "999px",
                        height: "10px",
                        overflow: "hidden",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: theme.barFillBg,
                          borderRadius: "999px",
                          height: "10px",
                          width: `${safePercentUsed}%`,
                        }}
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      color: MUTED_FOREGROUND,
                      fontSize: "12px",
                      paddingTop: "6px",
                    }}
                  >
                    {props.currentUsage} used
                  </td>
                  <td
                    style={{
                      color: MUTED_FOREGROUND,
                      fontSize: "12px",
                      paddingTop: "6px",
                      textAlign: "right",
                    }}
                  >
                    {props.usageLimit} total
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section style={{ padding: "16px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: theme.calloutBg,
                border: `1px solid ${theme.calloutBorder}`,
                borderLeft: `4px solid ${theme.calloutAccent}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: theme.calloutForeground,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 6px 0",
                  textTransform: "uppercase",
                }}
              >
                {severity === "critical"
                  ? "Service impact"
                  : severity === "warning"
                    ? "Heads up"
                    : "FYI"}
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                {calloutBody}
              </Text>
            </div>
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

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={props.upgradeUrl}
              style={{
                backgroundColor: theme.ctaBg,
                borderRadius: "8px",
                color: "#ffffff",
                display: "inline-block",
                fontSize: "15px",
                fontWeight: 600,
                padding: "12px 22px",
                textDecoration: "none",
              }}
            >
              {ctaLabel}
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
                style={{ color: theme.link, textDecoration: "none" }}
              >
                {props.upgradeUrl}
              </a>
            </Text>
          </Section>

          {dashboardUrl ? (
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
                  Want a detailed breakdown by endpoint, day, or team? Open your{" "}
                  <a
                    href={dashboardUrl}
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
              Questions about plan limits, overage pricing, or custom quotas?
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
            © {new Date().getFullYear()} {productName}. You are receiving this
            email because usage on your account crossed an alert threshold.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

UsageLimitWarningEmail.PreviewProps = {
  recipientName: "Jane Doe",
  resourceName: "API requests",
  currentUsage: "84,210",
  usageLimit: "100,000",
  percentUsed: 84,
  periodLabel: "June 2026",
  resetsAt: "Jul 1, 2026 00:00 UTC",
  planName: "Pro",
  upgradeUrl: "https://schemavaults.com/billing/upgrade?plan=scale",
  dashboardUrl: "https://schemavaults.com/account/usage",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies UsageLimitWarningEmailProps;
