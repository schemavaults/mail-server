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
  currentUsage: number;
  limit: number;
  unit?: string;
  severity?: "approaching" | "critical" | "exceeded";
  periodLabel?: string;
  resetsAt?: string;
  currentPlan?: string;
  upgradePlanName?: string;
  upgradeUrl?: string;
  manageUsageUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand and warning tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties or oklch(), so the token values are inlined as hex.
// AMBER values approximate `--warning: oklch(82% 0.189 84.429)` and `--warning-foreground: oklch(41% 0.112 45.904)`.
const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
const BRAND_RED = "#dc2626";
const BRAND_RED_DARK = "#b91c1c";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const AMBER = "#f59e0b";
const AMBER_DARK = "#b45309";
const AMBER_BG = "#fffbeb";
const AMBER_BORDER = "#fde68a";
const AMBER_FOREGROUND = "#78350f";
const RED_BG = "#fef2f2";
const RED_BORDER = "#fecaca";
const TRACK_BG = "#e5e7eb";

interface SeverityCopy {
  badge: string;
  heading: (resource: string) => string;
  lede: (resource: string, pct: number, product: string) => string;
  calloutTitle: string;
  calloutBody: (resource: string, product: string) => string;
  primaryLabel: string;
  barColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  calloutBg: string;
  calloutBorder: string;
  calloutAccent: string;
}

const SEVERITY_COPY: Record<
  NonNullable<UsageLimitWarningEmailProps["severity"]>,
  SeverityCopy
> = {
  approaching: {
    badge: "Heads up",
    heading: (resource) => `You're approaching your ${resource} limit`,
    lede: (resource, pct, product) =>
      `Your account on ${product} has used ${pct}% of its ${resource} allotment for the current billing period. You won't be interrupted yet, but it's a good time to plan ahead.`,
    calloutTitle: "What happens next",
    calloutBody: (resource, _product) =>
      `If you stay on the current trajectory you'll reach the ${resource} limit before this period resets. Upgrading now keeps everything running without interruption.`,
    primaryLabel: "Review plans",
    barColor: AMBER,
    badgeBg: AMBER_BG,
    badgeBorder: AMBER_BORDER,
    badgeText: AMBER_FOREGROUND,
    calloutBg: AMBER_BG,
    calloutBorder: AMBER_BORDER,
    calloutAccent: AMBER_DARK,
  },
  critical: {
    badge: "Action recommended",
    heading: (resource) => `You've nearly used all of your ${resource}`,
    lede: (resource, pct, product) =>
      `Your ${product} account has used ${pct}% of its ${resource} allotment for the current billing period. New requests will start being rejected once the limit is reached.`,
    calloutTitle: "Avoid interruptions",
    calloutBody: (resource, _product) =>
      `Upgrade now to keep ${resource} flowing without throttling. You can also adjust usage from the dashboard if you'd prefer to stay on your current plan.`,
    primaryLabel: "Upgrade plan",
    barColor: AMBER_DARK,
    badgeBg: AMBER_BG,
    badgeBorder: AMBER_BORDER,
    badgeText: AMBER_FOREGROUND,
    calloutBg: AMBER_BG,
    calloutBorder: AMBER_BORDER,
    calloutAccent: AMBER_DARK,
  },
  exceeded: {
    badge: "Limit reached",
    heading: (resource) => `Your ${resource} limit has been reached`,
    lede: (resource, _pct, product) =>
      `Your ${product} account has hit its ${resource} limit for the current billing period. Further ${resource} requests will be rejected until the period resets or you upgrade.`,
    calloutTitle: "Restore access",
    calloutBody: (resource, _product) =>
      `Upgrade your plan to immediately restore ${resource} access. If you'd prefer to wait, things will resume automatically when the period resets.`,
    primaryLabel: "Upgrade now",
    barColor: BRAND_RED,
    badgeBg: RED_BG,
    badgeBorder: RED_BORDER,
    badgeText: BRAND_RED_DARK,
    calloutBg: RED_BG,
    calloutBorder: RED_BORDER,
    calloutAccent: BRAND_RED,
  },
};

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) {
    return String(n);
  }
  return n.toLocaleString("en-US");
}

function clampPercent(used: number, limit: number): number {
  if (!Number.isFinite(used) || !Number.isFinite(limit) || limit <= 0) {
    return 0;
  }
  const pct = Math.round((used / limit) * 100);
  if (pct < 0) return 0;
  if (pct > 100) return 100;
  return pct;
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
    typeof props.currentUsage !== "number" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'currentUsage' in props for UsageLimitWarningEmail template!",
    );
  }
  if (
    typeof props.limit !== "number" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'limit' in props for UsageLimitWarningEmail template!",
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
  const unit: string =
    typeof props.unit === "string" && props.unit.length > 0 ? props.unit : "";
  const periodLabel: string =
    typeof props.periodLabel === "string" && props.periodLabel.length > 0
      ? props.periodLabel
      : "current billing period";
  const upgradeUrl: string =
    typeof props.upgradeUrl === "string" && props.upgradeUrl.length > 0
      ? props.upgradeUrl
      : "https://schemavaults.com/billing/plans";
  const manageUsageUrl: string | undefined =
    typeof props.manageUsageUrl === "string" && props.manageUsageUrl.length > 0
      ? props.manageUsageUrl
      : undefined;
  const resetsAt: string | undefined =
    typeof props.resetsAt === "string" && props.resetsAt.length > 0
      ? props.resetsAt
      : undefined;
  const currentPlan: string | undefined =
    typeof props.currentPlan === "string" && props.currentPlan.length > 0
      ? props.currentPlan
      : undefined;
  const upgradePlanName: string | undefined =
    typeof props.upgradePlanName === "string" &&
    props.upgradePlanName.length > 0
      ? props.upgradePlanName
      : undefined;

  const pct: number = clampPercent(props.currentUsage, props.limit);
  const inferredSeverity: NonNullable<UsageLimitWarningEmailProps["severity"]> =
    pct >= 100 ? "exceeded" : pct >= 90 ? "critical" : "approaching";
  const severity: NonNullable<UsageLimitWarningEmailProps["severity"]> =
    props.severity ?? inferredSeverity;
  const copy: SeverityCopy = SEVERITY_COPY[severity];

  const usageDisplay: string = unit
    ? `${formatNumber(props.currentUsage)} ${unit} of ${formatNumber(props.limit)} ${unit}`
    : `${formatNumber(props.currentUsage)} of ${formatNumber(props.limit)}`;

  const previewText: string = `${pct}% of your ${props.resourceName} used on ${productName}.`;

  const metaRows: Array<[string, string]> = [
    ["Resource", props.resourceName],
    ["Usage", usageDisplay],
    ["Period", periodLabel],
  ];
  if (currentPlan) {
    metaRows.push(["Current plan", currentPlan]);
  }
  if (resetsAt) {
    metaRows.push(["Resets", resetsAt]);
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
              background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_BLUE_DARK} 100%)`,
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
                fontSize: "24px",
                fontWeight: 700,
                lineHeight: "1.25",
                margin: "8px 0 0 0",
              }}
            >
              {copy.heading(props.resourceName)}
            </Heading>
          </Section>

          <Section style={{ padding: "28px 32px 8px 32px" }}>
            <div
              style={{
                backgroundColor: copy.badgeBg,
                border: `1px solid ${copy.badgeBorder}`,
                borderRadius: "999px",
                color: copy.badgeText,
                display: "inline-block",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                padding: "4px 10px",
                textTransform: "uppercase",
              }}
            >
              {copy.badge}
            </div>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "16px",
                lineHeight: "1.6",
                margin: "14px 0 8px 0",
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
              {copy.lede(props.resourceName, pct, productName)}
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
                      fontSize: "13px",
                      fontWeight: 700,
                      paddingBottom: "8px",
                      textAlign: "right",
                    }}
                  >
                    {pct}%
                  </td>
                </tr>
              </tbody>
            </table>
            <div
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
                  backgroundColor: copy.barColor,
                  borderRadius: "999px",
                  height: "10px",
                  width: `${pct}%`,
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
              {usageDisplay}
            </Text>
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

          <Section style={{ padding: "16px 32px 8px 32px" }}>
            <div
              style={{
                backgroundColor: copy.calloutBg,
                border: `1px solid ${copy.calloutBorder}`,
                borderLeft: `4px solid ${copy.calloutAccent}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: copy.calloutAccent,
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                {copy.calloutTitle}
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                {copy.calloutBody(props.resourceName, productName)}
              </Text>
              {upgradePlanName ? (
                <Text
                  style={{
                    color: MUTED_FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.55",
                    margin: "8px 0 0 0",
                  }}
                >
                  Suggested plan: <strong>{upgradePlanName}</strong>
                </Text>
              ) : null}
            </div>
          </Section>

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={upgradeUrl}
              style={{
                backgroundColor: BRAND_BLUE_DARK,
                borderRadius: "8px",
                color: "#ffffff",
                display: "inline-block",
                fontSize: "15px",
                fontWeight: 600,
                padding: "12px 22px",
                textDecoration: "none",
              }}
            >
              {copy.primaryLabel}
            </Button>
            {manageUsageUrl ? (
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: "12px 0 0 0",
                }}
              >
                Prefer to stay on your current plan? You can{" "}
                <a
                  href={manageUsageUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  review and adjust usage
                </a>{" "}
                from the dashboard.
              </Text>
            ) : null}
          </Section>

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
              Questions about your usage or billing? Reach us at{" "}
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
            © {new Date().getFullYear()} {productName}. You're receiving this
            email because usage on your account crossed an alerting threshold.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

UsageLimitWarningEmail.PreviewProps = {
  recipientName: "Jane Doe",
  resourceName: "API requests",
  currentUsage: 87_500,
  limit: 100_000,
  unit: "requests",
  severity: "critical",
  periodLabel: "June 2026 billing period",
  resetsAt: "Jul 01, 2026 00:00 UTC",
  currentPlan: "Starter",
  upgradePlanName: "Team",
  upgradeUrl: "https://schemavaults.com/billing/plans",
  manageUsageUrl: "https://schemavaults.com/dashboard/usage",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies UsageLimitWarningEmailProps;
