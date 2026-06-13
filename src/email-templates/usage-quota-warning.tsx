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

export interface UsageQuotaMetric {
  label: string;
  used: number;
  limit: number;
  unit?: string;
}

export interface UsageQuotaWarningEmailProps {
  recipientName?: string;
  planName: string;
  billingPeriodEndsAt?: string;
  metrics: UsageQuotaMetric[];
  upgradeUrl: string;
  upgradePlanName?: string;
  manageBillingUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties or oklch(), so token values are inlined as hex.
// AMBER values approximate `--warning: oklch(82% 0.189 84.429)` / `--warning-foreground: oklch(41% 0.112 45.904)`.
// RED values mirror `--schemavaults-brand-red: #dc2626` / `--destructive` for at-limit metrics.
const BRAND_BLUE_DARK = "#2563eb";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const TRACK_BG = "#e2e8f0";
const AMBER = "#f59e0b";
const AMBER_DARK = "#b45309";
const AMBER_BG = "#fffbeb";
const AMBER_BORDER = "#fde68a";
const AMBER_FOREGROUND = "#78350f";
const RED = "#dc2626";
const RED_DARK = "#991b1b";
const GREEN = "#16a34a";

interface NormalizedMetric {
  label: string;
  used: number;
  limit: number;
  unit: string;
  percent: number;
  severity: "ok" | "warn" | "critical";
  barColor: string;
  displayUsed: string;
  displayLimit: string;
}

function severityFor(percent: number): NormalizedMetric["severity"] {
  if (percent >= 100) {
    return "critical";
  }
  if (percent >= 80) {
    return "warn";
  }
  return "ok";
}

function barColorFor(severity: NormalizedMetric["severity"]): string {
  if (severity === "critical") {
    return RED;
  }
  if (severity === "warn") {
    return AMBER;
  }
  return GREEN;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return String(value);
  }
  if (Math.abs(value) >= 1000) {
    return Math.round(value).toLocaleString("en-US");
  }
  if (Number.isInteger(value)) {
    return String(value);
  }
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function normalizeMetrics(
  metrics: readonly UsageQuotaMetric[],
): NormalizedMetric[] {
  return metrics
    .filter(
      (m): m is UsageQuotaMetric =>
        m !== null &&
        typeof m === "object" &&
        typeof m.label === "string" &&
        m.label.length > 0 &&
        typeof m.used === "number" &&
        Number.isFinite(m.used) &&
        typeof m.limit === "number" &&
        Number.isFinite(m.limit),
    )
    .map((m) => {
      const safeLimit: number = m.limit > 0 ? m.limit : 0;
      const safeUsed: number = Math.max(0, m.used);
      const rawPercent: number =
        safeLimit > 0 ? (safeUsed / safeLimit) * 100 : safeUsed > 0 ? 100 : 0;
      const percent: number = Math.min(
        100,
        Math.max(0, Math.round(rawPercent)),
      );
      const severity = severityFor(rawPercent);
      const unit: string =
        typeof m.unit === "string" && m.unit.length > 0 ? m.unit : "";
      return {
        label: m.label,
        used: safeUsed,
        limit: safeLimit,
        unit,
        percent,
        severity,
        barColor: barColorFor(severity),
        displayUsed: formatNumber(safeUsed),
        displayLimit: formatNumber(safeLimit),
      };
    });
}

export default function UsageQuotaWarningEmail(
  props: UsageQuotaWarningEmailProps,
): ReactElement {
  if (
    typeof props.planName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'planName' in props for UsageQuotaWarningEmail template!",
    );
  }
  if (
    typeof props.upgradeUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'upgradeUrl' in props for UsageQuotaWarningEmail template!",
    );
  }
  if (
    !Array.isArray(props.metrics) &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'metrics' in props for UsageQuotaWarningEmail template!",
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
  const upgradePlanName: string =
    typeof props.upgradePlanName === "string" &&
    props.upgradePlanName.length > 0
      ? props.upgradePlanName
      : "the next tier";
  const billingPeriodEndsAt: string | undefined =
    typeof props.billingPeriodEndsAt === "string" &&
    props.billingPeriodEndsAt.length > 0
      ? props.billingPeriodEndsAt
      : undefined;
  const manageBillingUrl: string | undefined =
    typeof props.manageBillingUrl === "string" &&
    props.manageBillingUrl.length > 0
      ? props.manageBillingUrl
      : undefined;

  const metrics: NormalizedMetric[] = Array.isArray(props.metrics)
    ? normalizeMetrics(props.metrics)
    : [];
  const hasCritical: boolean = metrics.some((m) => m.severity === "critical");
  const hasWarn: boolean = metrics.some((m) => m.severity === "warn");
  const worstPercent: number = metrics.reduce(
    (acc, m) => (m.percent > acc ? m.percent : acc),
    0,
  );

  const headlineEyebrow: string = hasCritical
    ? `${productName} · Quota limit reached`
    : `${productName} · Quota warning`;
  const headlineColor: string = hasCritical ? RED : AMBER;
  const headlineColorDark: string = hasCritical ? RED_DARK : AMBER_DARK;
  const headingText: string = hasCritical
    ? `You've hit a limit on the ${props.planName} plan.`
    : `You're approaching a limit on the ${props.planName} plan.`;
  const subheadingText: string = hasCritical
    ? `One or more usage metrics have reached 100%. New work may be blocked until you upgrade or your billing period resets.`
    : `One or more usage metrics have crossed 80%. Upgrade to ${upgradePlanName} to avoid hitting a hard limit before your billing period resets.`;
  const previewText: string = hasCritical
    ? `Hi ${greetingName} — your ${props.planName} plan has reached a usage limit. Review and upgrade to keep going.`
    : `Hi ${greetingName} — you're at ${worstPercent}% on your ${props.planName} plan. Review and upgrade before you hit a limit.`;

  const calloutBg: string = hasCritical ? "#fef2f2" : AMBER_BG;
  const calloutBorder: string = hasCritical ? "#fecaca" : AMBER_BORDER;
  const calloutFg: string = hasCritical ? "#7f1d1d" : AMBER_FOREGROUND;
  const calloutTitle: string = hasCritical
    ? "Service may be interrupted"
    : "Action recommended";
  const calloutBody: string = hasCritical
    ? `Until usage drops or you upgrade, new writes against any metric at 100% will return a quota error. Upgrade to ${upgradePlanName} to lift the limit immediately.`
    : `Upgrading now keeps everything you've built running without a service interruption. Your usage carries over to the new plan.`;

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
              background: `linear-gradient(135deg, ${headlineColor} 0%, ${headlineColorDark} 100%)`,
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
              {headlineEyebrow}
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
            {billingPeriodEndsAt ? (
              <span
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.18)",
                  borderRadius: "999px",
                  color: "#ffffff",
                  display: "inline-block",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  padding: "4px 10px",
                  textTransform: "uppercase",
                }}
              >
                Resets {billingPeriodEndsAt}
              </span>
            ) : null}
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
              {subheadingText}
            </Text>
          </Section>

          {metrics.length > 0 ? (
            <Section style={{ padding: "20px 32px 4px 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  margin: "0 0 12px 0",
                  textTransform: "uppercase",
                }}
              >
                Current usage
              </Text>
              {metrics.map((metric) => {
                const unitSuffix: string = metric.unit
                  ? ` ${metric.unit}`
                  : "";
                const statusLabel: string =
                  metric.severity === "critical"
                    ? "At limit"
                    : metric.severity === "warn"
                      ? "Approaching"
                      : "On track";
                const statusBg: string =
                  metric.severity === "critical"
                    ? "#fee2e2"
                    : metric.severity === "warn"
                      ? AMBER_BG
                      : "#dcfce7";
                const statusFg: string =
                  metric.severity === "critical"
                    ? RED_DARK
                    : metric.severity === "warn"
                      ? AMBER_FOREGROUND
                      : "#166534";
                return (
                  <div
                    key={metric.label}
                    style={{
                      backgroundColor: PANEL_BG,
                      border: `1px solid ${BORDER}`,
                      borderRadius: "8px",
                      marginBottom: "10px",
                      padding: "12px 14px",
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
                              color: FOREGROUND,
                              fontSize: "14px",
                              fontWeight: 600,
                              lineHeight: "1.4",
                              padding: 0,
                              verticalAlign: "middle",
                            }}
                          >
                            {metric.label}
                          </td>
                          <td
                            style={{
                              padding: 0,
                              textAlign: "right",
                              verticalAlign: "middle",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span
                              style={{
                                backgroundColor: statusBg,
                                borderRadius: "999px",
                                color: statusFg,
                                display: "inline-block",
                                fontSize: "11px",
                                fontWeight: 600,
                                letterSpacing: "0.04em",
                                padding: "2px 8px",
                                textTransform: "uppercase",
                              }}
                            >
                              {statusLabel}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div
                      style={{
                        backgroundColor: TRACK_BG,
                        borderRadius: "999px",
                        height: "8px",
                        margin: "10px 0 6px 0",
                        overflow: "hidden",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: metric.barColor,
                          borderRadius: "999px",
                          height: "8px",
                          width: `${metric.percent}%`,
                        }}
                      />
                    </div>
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
                              lineHeight: "1.4",
                              padding: 0,
                              verticalAlign: "middle",
                            }}
                          >
                            {metric.displayUsed}
                            {unitSuffix} of {metric.displayLimit}
                            {unitSuffix}
                          </td>
                          <td
                            style={{
                              color: FOREGROUND,
                              fontSize: "12px",
                              fontWeight: 600,
                              padding: 0,
                              textAlign: "right",
                              verticalAlign: "middle",
                            }}
                          >
                            {metric.percent}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </Section>
          ) : null}

          {hasCritical || hasWarn ? (
            <Section style={{ padding: "12px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: calloutBg,
                  border: `1px solid ${calloutBorder}`,
                  borderLeft: `4px solid ${headlineColorDark}`,
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <Text
                  style={{
                    color: calloutFg,
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    margin: "0 0 4px 0",
                    textTransform: "uppercase",
                  }}
                >
                  {calloutTitle}
                </Text>
                <Text
                  style={{
                    color: calloutFg,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  {calloutBody}
                </Text>
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={props.upgradeUrl}
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
              Upgrade to {upgradePlanName}
            </Button>
          </Section>

          <Section style={{ padding: "8px 32px 24px 32px" }}>
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
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {props.upgradeUrl}
              </a>
            </Text>
          </Section>

          {manageBillingUrl ? (
            <Section style={{ padding: "0 32px 24px 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                Prefer to manage your plan yourself? Visit your{" "}
                <a
                  href={manageBillingUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  billing settings
                </a>{" "}
                to change plans, raise limits, or review past invoices.
              </Text>
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
              Questions about which plan fits your workload, custom limits, or
              enterprise pricing? Reply to this email or reach us at{" "}
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
            email because your account is approaching or has reached a plan
            limit.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

UsageQuotaWarningEmail.PreviewProps = {
  recipientName: "Jane Doe",
  planName: "Starter",
  upgradePlanName: "Pro",
  billingPeriodEndsAt: "Jul 1, 2026",
  metrics: [
    { label: "Schemas published", used: 47, limit: 50 },
    { label: "API calls (this month)", used: 92340, limit: 100000 },
    { label: "Team members", used: 5, limit: 5 },
    { label: "Vault storage", used: 1.8, limit: 5, unit: "GB" },
  ],
  upgradeUrl: "https://schemavaults.com/billing/upgrade?plan=pro",
  manageBillingUrl: "https://schemavaults.com/settings/billing",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies UsageQuotaWarningEmailProps;
