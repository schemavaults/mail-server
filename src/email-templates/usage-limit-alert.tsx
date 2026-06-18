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

export type UsageLimitAlertSeverity = "warning" | "critical" | "exceeded";

export interface UsageLimitAlertEmailProps {
  recipientName?: string;
  metricLabel: string;
  currentUsage: number;
  usageLimit: number;
  unit?: string;
  usagePeriod?: string;
  resetAt?: string;
  severity?: UsageLimitAlertSeverity;
  currentPlan?: string;
  recommendedActions?: string[];
  upgradeUrl: string;
  manageUsageUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand and warning tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties or oklch(), so the token values are inlined as hex.
// AMBER values approximate `--warning: oklch(82% 0.189 84.429)` and `--warning-foreground: oklch(41% 0.112 45.904)`.
// BRAND_RED matches `--schemavaults-brand-red: #dc2626` and is used for critical/exceeded states.
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
const ALERT_BG = "#fef2f2";
const ALERT_BORDER = "#fecaca";
const ALERT_FOREGROUND = "#7f1d1d";

const VALID_SEVERITIES: readonly UsageLimitAlertSeverity[] = [
  "warning",
  "critical",
  "exceeded",
];

function inferSeverity(percent: number): UsageLimitAlertSeverity {
  if (percent >= 100) return "exceeded";
  if (percent >= 90) return "critical";
  return "warning";
}

function formatCount(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return Math.max(0, Math.floor(n)).toLocaleString("en-US");
}

const DEFAULT_RECOMMENDED_ACTIONS: readonly string[] = [
  "Upgrade your plan to raise the limit",
  "Review which integrations are driving the highest usage",
  "Throttle non-essential jobs until the quota resets",
];

export default function UsageLimitAlertEmail(
  props: UsageLimitAlertEmailProps,
): ReactElement {
  if (
    typeof props.metricLabel !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'metricLabel' in props for UsageLimitAlertEmail template!",
    );
  }
  if (
    typeof props.currentUsage !== "number" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'currentUsage' in props for UsageLimitAlertEmail template!",
    );
  }
  if (
    typeof props.usageLimit !== "number" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'usageLimit' in props for UsageLimitAlertEmail template!",
    );
  }
  if (
    typeof props.upgradeUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'upgradeUrl' in props for UsageLimitAlertEmail template!",
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
  const metricLabel: string =
    typeof props.metricLabel === "string" && props.metricLabel.length > 0
      ? props.metricLabel
      : "usage";
  const unit: string =
    typeof props.unit === "string" && props.unit.length > 0 ? props.unit : "";
  const usagePeriod: string =
    typeof props.usagePeriod === "string" && props.usagePeriod.length > 0
      ? props.usagePeriod
      : "this billing period";
  const currentPlan: string | undefined =
    typeof props.currentPlan === "string" && props.currentPlan.length > 0
      ? props.currentPlan
      : undefined;
  const manageUsageUrl: string | undefined =
    typeof props.manageUsageUrl === "string" && props.manageUsageUrl.length > 0
      ? props.manageUsageUrl
      : undefined;
  const resetAt: string | undefined =
    typeof props.resetAt === "string" && props.resetAt.length > 0
      ? props.resetAt
      : undefined;
  const recommendedActions: string[] = Array.isArray(props.recommendedActions)
    ? props.recommendedActions.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      )
    : [];
  const finalRecommendedActions: readonly string[] =
    recommendedActions.length > 0
      ? recommendedActions
      : DEFAULT_RECOMMENDED_ACTIONS;

  const safeCurrentUsage: number =
    typeof props.currentUsage === "number" && Number.isFinite(props.currentUsage)
      ? Math.max(0, Math.floor(props.currentUsage))
      : 0;
  const safeUsageLimit: number =
    typeof props.usageLimit === "number" &&
    Number.isFinite(props.usageLimit) &&
    props.usageLimit > 0
      ? Math.floor(props.usageLimit)
      : 1;

  const percentRaw: number = (safeCurrentUsage / safeUsageLimit) * 100;
  const percent: number = Math.max(0, Math.min(percentRaw, 999));
  const percentDisplay: string = `${percent.toFixed(percent >= 100 ? 0 : 1)}%`;
  const percentBarWidth: number = Math.max(2, Math.min(percentRaw, 100));

  const severity: UsageLimitAlertSeverity =
    props.severity && VALID_SEVERITIES.includes(props.severity)
      ? props.severity
      : inferSeverity(percentRaw);

  const isAlertState: boolean =
    severity === "critical" || severity === "exceeded";

  const headerGradient: string = isAlertState
    ? `linear-gradient(135deg, ${BRAND_RED} 0%, ${BRAND_RED_DARK} 100%)`
    : `linear-gradient(135deg, ${AMBER} 0%, ${AMBER_DARK} 100%)`;
  const accentColor: string = isAlertState ? BRAND_RED_DARK : AMBER_DARK;
  const calloutBg: string = isAlertState ? ALERT_BG : AMBER_BG;
  const calloutBorder: string = isAlertState ? ALERT_BORDER : AMBER_BORDER;
  const calloutForeground: string = isAlertState
    ? ALERT_FOREGROUND
    : AMBER_FOREGROUND;
  const progressBarBg: string = isAlertState ? "#fee2e2" : "#fef3c7";
  const progressBarFill: string = isAlertState ? BRAND_RED : AMBER;

  const eyebrow: string =
    severity === "exceeded"
      ? `${productName} · Usage limit reached`
      : severity === "critical"
        ? `${productName} · Usage limit nearing`
        : `${productName} · Usage notice`;

  const headingText: string =
    severity === "exceeded"
      ? `You've hit your ${metricLabel} limit.`
      : severity === "critical"
        ? `You're close to your ${metricLabel} limit.`
        : `Heads up on your ${metricLabel} usage.`;

  const unitSuffix: string = unit.length > 0 ? ` ${unit}` : "";
  const usageString: string = `${formatCount(safeCurrentUsage)} / ${formatCount(safeUsageLimit)}${unitSuffix}`;

  const pillLabel: string =
    severity === "exceeded"
      ? `${percentDisplay} used · over limit`
      : `${percentDisplay} used`;

  const previewText: string =
    severity === "exceeded"
      ? `${metricLabel}: ${usageString} (${percentDisplay}) — limit reached for ${usagePeriod}.`
      : `${metricLabel}: ${usageString} (${percentDisplay}) — approaching limit for ${usagePeriod}.`;

  const introCopy: string =
    severity === "exceeded"
      ? `Your ${productName} account has hit its ${metricLabel} limit for ${usagePeriod}. Further ${metricLabel.toLowerCase()} may be throttled or rejected until the quota resets${resetAt ? ` on ${resetAt}` : ""}.`
      : severity === "critical"
        ? `Your ${productName} account is within 10% of its ${metricLabel} limit for ${usagePeriod}. Acting now avoids interruption${resetAt ? ` before usage resets on ${resetAt}` : ""}.`
        : `Your ${productName} account has used a significant share of its ${metricLabel} quota for ${usagePeriod}.${resetAt ? ` Usage resets on ${resetAt}.` : ""}`;

  const metaRows: Array<[string, string]> = [
    [metricLabel, usageString],
    ["Used", percentDisplay],
  ];
  if (currentPlan) {
    metaRows.push(["Plan", currentPlan]);
  }
  metaRows.push(["Period", usagePeriod]);
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
              background: headerGradient,
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
              {eyebrow}
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
              {pillLabel}
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
              {introCopy}
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
                      padding: "0 0 6px 0",
                      textTransform: "uppercase",
                    }}
                  >
                    {metricLabel}
                  </td>
                  <td
                    align="right"
                    style={{
                      color: accentColor,
                      fontSize: "13px",
                      fontWeight: 700,
                      padding: "0 0 6px 0",
                    }}
                  >
                    {percentDisplay}
                  </td>
                </tr>
              </tbody>
            </table>
            <div
              style={{
                backgroundColor: progressBarBg,
                borderRadius: "999px",
                height: "10px",
                overflow: "hidden",
                width: "100%",
              }}
            >
              <div
                style={{
                  backgroundColor: progressBarFill,
                  borderRadius: "999px",
                  height: "10px",
                  width: `${percentBarWidth}%`,
                }}
              />
            </div>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "12px",
                lineHeight: "1.5",
                margin: "8px 0 0 0",
              }}
            >
              {usageString}
              {resetAt ? ` · resets ${resetAt}` : ""}
            </Text>
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
                Recommended next steps
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
                {finalRecommendedActions.map((action) => (
                  <li key={action} style={{ margin: "2px 0" }}>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={props.upgradeUrl}
              style={{
                backgroundColor: accentColor,
                borderRadius: "8px",
                color: "#ffffff",
                display: "inline-block",
                fontSize: "15px",
                fontWeight: 600,
                padding: "12px 22px",
                textDecoration: "none",
              }}
            >
              {severity === "exceeded"
                ? "Upgrade to restore service"
                : "Upgrade plan"}
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
                style={{ color: accentColor, textDecoration: "none" }}
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
                  Want to see what's driving usage? Open your{" "}
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
              Questions about plan limits, quota calculations, or rate-limit
              behavior? Reply to this email or reach us at{" "}
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
            email because your account crossed a usage threshold.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

UsageLimitAlertEmail.PreviewProps = {
  recipientName: "Jane Doe",
  metricLabel: "API requests",
  currentUsage: 92_400,
  usageLimit: 100_000,
  unit: "requests",
  usagePeriod: "this billing period",
  resetAt: "May 1, 2026",
  severity: "critical",
  currentPlan: "Pro",
  recommendedActions: [
    "Upgrade to Team to raise the API quota to 1,000,000 requests/mo",
    "Audit recent pipelines for runaway retries",
    "Stagger non-essential batch jobs until reset",
  ],
  upgradeUrl: "https://schemavaults.com/billing/upgrade?plan=team",
  manageUsageUrl: "https://schemavaults.com/account/usage",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies UsageLimitAlertEmailProps;
