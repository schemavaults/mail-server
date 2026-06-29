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

export interface UsageThresholdWarningEmailProps {
  metricName: string;
  currentUsage: number;
  usageLimit: number;
  unit: string;
  resetAt: string;
  upgradeUrl: string;
  recipientName?: string;
  planName?: string;
  usageDashboardUrl?: string;
  recommendedPlanName?: string;
  recommendedPlanLimitLabel?: string;
  recommendedPlanPrice?: string;
  consequences?: string[];
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand / warning / destructive tokens
// (see node_modules/@schemavaults/theme/globals.css). Email clients don't
// resolve CSS custom properties, so token values are inlined as hex.
const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
const BRAND_RED = "#dc2626";
const BRAND_RED_DARK = "#991b1b";
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
const RED_BG = "#fef2f2";
const RED_BORDER = "#fecaca";
const RED_FOREGROUND = "#7f1d1d";
const BLUE_BG = "#eff6ff";
const BLUE_BORDER = "#bfdbfe";
const BLUE_FOREGROUND = "#1e3a8a";

const DEFAULT_CONSEQUENCES: readonly string[] = [
  "New requests start receiving 429 Too Many Requests responses",
  "Background jobs depending on the quota will be paused",
  "Your team's dashboards may show stale data until the quota resets",
];

type Severity = "info" | "warning" | "critical" | "over";

function pickSeverity(percent: number): Severity {
  if (percent >= 1) return "over";
  if (percent >= 0.95) return "critical";
  if (percent >= 0.8) return "warning";
  return "info";
}

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

export default function UsageThresholdWarningEmail(
  props: UsageThresholdWarningEmailProps,
): ReactElement {
  if (
    typeof props.metricName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'metricName' in props for UsageThresholdWarningEmail template!",
    );
  }
  if (
    typeof props.currentUsage !== "number" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'currentUsage' in props for UsageThresholdWarningEmail template!",
    );
  }
  if (
    typeof props.usageLimit !== "number" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'usageLimit' in props for UsageThresholdWarningEmail template!",
    );
  }
  if (
    typeof props.unit !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'unit' in props for UsageThresholdWarningEmail template!",
    );
  }
  if (
    typeof props.resetAt !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'resetAt' in props for UsageThresholdWarningEmail template!",
    );
  }
  if (
    typeof props.upgradeUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'upgradeUrl' in props for UsageThresholdWarningEmail template!",
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
  const planName: string =
    typeof props.planName === "string" && props.planName.length > 0
      ? props.planName
      : "your current plan";
  const usageDashboardUrl: string | undefined =
    typeof props.usageDashboardUrl === "string" &&
    props.usageDashboardUrl.length > 0
      ? props.usageDashboardUrl
      : undefined;
  const recommendedPlanName: string | undefined =
    typeof props.recommendedPlanName === "string" &&
    props.recommendedPlanName.length > 0
      ? props.recommendedPlanName
      : undefined;
  const recommendedPlanLimitLabel: string | undefined =
    typeof props.recommendedPlanLimitLabel === "string" &&
    props.recommendedPlanLimitLabel.length > 0
      ? props.recommendedPlanLimitLabel
      : undefined;
  const recommendedPlanPrice: string | undefined =
    typeof props.recommendedPlanPrice === "string" &&
    props.recommendedPlanPrice.length > 0
      ? props.recommendedPlanPrice
      : undefined;
  const consequences: readonly string[] =
    Array.isArray(props.consequences) && props.consequences.length > 0
      ? props.consequences.filter(
          (item): item is string => typeof item === "string" && item.length > 0,
        )
      : DEFAULT_CONSEQUENCES;

  const safeCurrentUsage: number =
    typeof props.currentUsage === "number" &&
    Number.isFinite(props.currentUsage)
      ? Math.max(0, props.currentUsage)
      : 0;
  const safeUsageLimit: number =
    typeof props.usageLimit === "number" &&
    Number.isFinite(props.usageLimit) &&
    props.usageLimit > 0
      ? props.usageLimit
      : 1;

  const rawPercent: number = safeCurrentUsage / safeUsageLimit;
  const severity: Severity = pickSeverity(rawPercent);
  const percentLabel: number = Math.min(999, Math.round(rawPercent * 100));
  const barFillPercent: number = Math.max(
    2,
    Math.min(100, Math.round(rawPercent * 100)),
  );

  const headerStart: string =
    severity === "over"
      ? BRAND_RED
      : severity === "critical"
        ? "#ef4444"
        : severity === "warning"
          ? AMBER
          : BRAND_BLUE;
  const headerEnd: string =
    severity === "over"
      ? BRAND_RED_DARK
      : severity === "critical"
        ? BRAND_RED
        : severity === "warning"
          ? AMBER_DARK
          : BRAND_BLUE_DARK;
  const accentColor: string =
    severity === "over" || severity === "critical"
      ? BRAND_RED
      : severity === "warning"
        ? AMBER_DARK
        : BRAND_BLUE_DARK;
  const ctaColor: string =
    severity === "over" || severity === "critical"
      ? BRAND_RED_DARK
      : severity === "warning"
        ? AMBER_DARK
        : BRAND_BLUE_DARK;
  const calloutBg: string =
    severity === "over" || severity === "critical"
      ? RED_BG
      : severity === "warning"
        ? AMBER_BG
        : BLUE_BG;
  const calloutBorder: string =
    severity === "over" || severity === "critical"
      ? RED_BORDER
      : severity === "warning"
        ? AMBER_BORDER
        : BLUE_BORDER;
  const calloutForeground: string =
    severity === "over" || severity === "critical"
      ? RED_FOREGROUND
      : severity === "warning"
        ? AMBER_FOREGROUND
        : BLUE_FOREGROUND;

  const severityLabel: string =
    severity === "over"
      ? "Quota exceeded"
      : severity === "critical"
        ? "Critical"
        : severity === "warning"
          ? "Warning"
          : "Approaching limit";

  const headingText: string =
    severity === "over"
      ? `You've exceeded your ${props.metricName} quota.`
      : severity === "critical"
        ? `You're at ${percentLabel}% of your ${props.metricName} quota.`
        : severity === "warning"
          ? `Heads up — ${percentLabel}% of your ${props.metricName} quota used.`
          : `You're at ${percentLabel}% of your ${props.metricName} quota.`;

  const previewText: string =
    severity === "over"
      ? `${props.metricName}: ${formatNumber(safeCurrentUsage)} / ${formatNumber(safeUsageLimit)} ${props.unit} — quota exceeded. Resets ${props.resetAt}.`
      : `${props.metricName}: ${formatNumber(safeCurrentUsage)} / ${formatNumber(safeUsageLimit)} ${props.unit} (${percentLabel}%). Resets ${props.resetAt}.`;

  const metaRows: Array<[string, string]> = [
    ["Plan", planName],
    [
      "Usage",
      `${formatNumber(safeCurrentUsage)} of ${formatNumber(safeUsageLimit)} ${props.unit}`,
    ],
    ["Quota resets", props.resetAt],
  ];
  if (recommendedPlanName && recommendedPlanLimitLabel) {
    metaRows.push([
      `${recommendedPlanName} limit`,
      recommendedPlanPrice
        ? `${recommendedPlanLimitLabel} · ${recommendedPlanPrice}`
        : recommendedPlanLimitLabel,
    ]);
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
              background: `linear-gradient(135deg, ${headerStart} 0%, ${headerEnd} 100%)`,
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
              {severityLabel}
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
              {severity === "over" ? (
                <>
                  Your <strong>{props.metricName}</strong> usage on{" "}
                  <strong>{planName}</strong> has gone over its quota. New
                  requests against this metric will be throttled until the
                  quota resets on <strong>{props.resetAt}</strong>.
                </>
              ) : (
                <>
                  Your <strong>{props.metricName}</strong> usage on{" "}
                  <strong>{planName}</strong> is at{" "}
                  <strong>{percentLabel}%</strong> of its quota. The quota
                  resets on <strong>{props.resetAt}</strong>.
                </>
              )}
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <div
              style={{
                backgroundColor: PANEL_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: "10px",
                padding: "16px",
              }}
            >
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{
                  borderCollapse: "collapse",
                  marginBottom: "10px",
                  width: "100%",
                }}
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
                        verticalAlign: "middle",
                      }}
                    >
                      {props.metricName}
                    </td>
                    <td
                      style={{
                        color: accentColor,
                        fontSize: "18px",
                        fontWeight: 700,
                        textAlign: "right",
                        verticalAlign: "middle",
                      }}
                    >
                      {percentLabel}%
                    </td>
                  </tr>
                </tbody>
              </table>
              <div
                style={{
                  backgroundColor: "#e2e8f0",
                  borderRadius: "999px",
                  height: "10px",
                  overflow: "hidden",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    backgroundColor: accentColor,
                    borderRadius: "999px",
                    height: "10px",
                    width: `${barFillPercent}%`,
                  }}
                />
              </div>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "12px",
                  lineHeight: "1.55",
                  margin: "10px 0 0 0",
                }}
              >
                {formatNumber(safeCurrentUsage)} of{" "}
                {formatNumber(safeUsageLimit)} {props.unit} used
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

          {severity !== "info" && consequences.length > 0 ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: calloutBg,
                  border: `1px solid ${calloutBorder}`,
                  borderLeft: `4px solid ${accentColor}`,
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <Text
                  style={{
                    color: calloutForeground,
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    margin: "0 0 6px 0",
                    textTransform: "uppercase",
                  }}
                >
                  {severity === "over"
                    ? "What's happening now"
                    : "What happens if you hit the limit"}
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
                  {consequences.map((line) => (
                    <li key={line} style={{ margin: "2px 0" }}>
                      {line}
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
                backgroundColor: ctaColor,
                borderRadius: "8px",
                color: "#ffffff",
                display: "inline-block",
                fontSize: "15px",
                fontWeight: 600,
                padding: "12px 22px",
                textDecoration: "none",
              }}
            >
              {recommendedPlanName
                ? `Upgrade to ${recommendedPlanName}`
                : "Upgrade your plan"}
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
                style={{ color: ctaColor, textDecoration: "none" }}
              >
                {props.upgradeUrl}
              </a>
            </Text>
          </Section>

          {usageDashboardUrl ? (
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
                  Want a detailed breakdown by API key, endpoint, or day? Open
                  the{" "}
                  <a
                    href={usageDashboardUrl}
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
              Questions about quotas, custom limits, or annual pricing? Reply
              to this email or reach us at{" "}
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
            email because your account crossed a usage threshold you opted into
            notifications for.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

UsageThresholdWarningEmail.PreviewProps = {
  recipientName: "Jane Doe",
  metricName: "API requests",
  currentUsage: 86_420,
  usageLimit: 100_000,
  unit: "requests",
  resetAt: "July 1, 2026 00:00 UTC",
  planName: "Starter",
  upgradeUrl: "https://schemavaults.com/billing/upgrade?from=usage-alert",
  usageDashboardUrl: "https://schemavaults.com/account/usage",
  recommendedPlanName: "Pro",
  recommendedPlanLimitLabel: "1,000,000 requests/mo",
  recommendedPlanPrice: "$29 / month",
  consequences: [
    "New API requests start receiving 429 Too Many Requests responses",
    "Scheduled schema-sync jobs will be paused until the quota resets",
    "Webhook deliveries on this key are queued, not dropped, for up to 24h",
  ],
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies UsageThresholdWarningEmailProps;
