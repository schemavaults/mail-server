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
  recipientName?: string;
  resourceName: string;
  currentUsage: number;
  usageLimit: number;
  unit?: string;
  periodLabel?: string;
  planName?: string;
  upgradeUrl?: string;
  usageUrl: string;
  manageBillingUrl?: string;
  additionalContext?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties or oklch(), so the token values are inlined as hex.
// BRAND_BLUE maps to `--schemavaults-brand-blue`. RED maps to `--destructive` (0 84.2% 60.2%) and
// `--schemavaults-brand-red`. AMBER values approximate `--warning: oklch(82% 0.189 84.429)` and
// `--warning-foreground: oklch(41% 0.112 45.904)`.
const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
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
const RED = "#dc2626";
const RED_DARK = "#991b1b";
const RED_BG = "#fef2f2";
const RED_BORDER = "#fecaca";
const RED_FOREGROUND = "#7f1d1d";
const TRACK_BG = "#e2e8f0";

type Severity = "approaching" | "critical" | "exceeded";

function classify(percent: number): Severity {
  if (percent >= 100) return "exceeded";
  if (percent >= 90) return "critical";
  return "approaching";
}

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat("en-US").format(n);
}

export default function UsageThresholdWarningEmail(
  props: UsageThresholdWarningEmailProps,
): ReactElement {
  if (
    typeof props.resourceName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'resourceName' in props for UsageThresholdWarningEmail template!",
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
    typeof props.usageUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'usageUrl' in props for UsageThresholdWarningEmail template!",
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
  const periodLabel: string | undefined =
    typeof props.periodLabel === "string" && props.periodLabel.length > 0
      ? props.periodLabel
      : undefined;
  const planName: string | undefined =
    typeof props.planName === "string" && props.planName.length > 0
      ? props.planName
      : undefined;
  const upgradeUrl: string | undefined =
    typeof props.upgradeUrl === "string" && props.upgradeUrl.length > 0
      ? props.upgradeUrl
      : undefined;
  const manageBillingUrl: string | undefined =
    typeof props.manageBillingUrl === "string" &&
    props.manageBillingUrl.length > 0
      ? props.manageBillingUrl
      : undefined;
  const additionalContext: string | undefined =
    typeof props.additionalContext === "string" &&
    props.additionalContext.length > 0
      ? props.additionalContext
      : undefined;

  const safeCurrent: number =
    typeof props.currentUsage === "number" &&
    Number.isFinite(props.currentUsage)
      ? Math.max(0, props.currentUsage)
      : 0;
  const safeLimit: number =
    typeof props.usageLimit === "number" &&
    Number.isFinite(props.usageLimit) &&
    props.usageLimit > 0
      ? props.usageLimit
      : 1;

  const rawPercent = (safeCurrent / safeLimit) * 100;
  const percent: number = Math.max(0, rawPercent);
  const barPercent: number = Math.min(100, percent);
  const percentLabel: string = `${percent >= 10 ? Math.round(percent) : percent.toFixed(1)}%`;

  const severity: Severity = classify(percent);
  const isExceeded = severity === "exceeded";
  const isCritical = severity === "critical";

  const accent = isExceeded || isCritical ? RED : AMBER;
  const accentDark = isExceeded || isCritical ? RED_DARK : AMBER_DARK;
  const calloutBg = isExceeded || isCritical ? RED_BG : AMBER_BG;
  const calloutBorder = isExceeded || isCritical ? RED_BORDER : AMBER_BORDER;
  const calloutFg = isExceeded || isCritical ? RED_FOREGROUND : AMBER_FOREGROUND;

  const eyebrow: string = isExceeded
    ? `${productName} · Usage limit exceeded`
    : isCritical
      ? `${productName} · Usage limit critical`
      : `${productName} · Usage threshold warning`;

  const headingText: string = isExceeded
    ? `You've exceeded your ${props.resourceName} limit.`
    : isCritical
      ? `You're nearly out of ${props.resourceName}.`
      : `You're approaching your ${props.resourceName} limit.`;

  const usageDisplay: string = unit
    ? `${formatNumber(safeCurrent)} ${unit} of ${formatNumber(safeLimit)} ${unit}`
    : `${formatNumber(safeCurrent)} of ${formatNumber(safeLimit)}`;

  const previewText: string = isExceeded
    ? `${props.resourceName} usage is at ${percentLabel} (${usageDisplay})${
        periodLabel ? ` ${periodLabel}` : ""
      } — limit exceeded.`
    : `${props.resourceName} usage is at ${percentLabel} (${usageDisplay})${
        periodLabel ? ` ${periodLabel}` : ""
      }.`;

  const metaRows: Array<[string, string]> = [
    ["Resource", props.resourceName],
    ["Current usage", usageDisplay],
    ["Utilization", percentLabel],
  ];
  if (periodLabel) {
    metaRows.push(["Period", periodLabel]);
  }
  if (planName) {
    metaRows.push(["Current plan", planName]);
  }

  const calloutHeading: string = isExceeded
    ? "What happens next"
    : "What this means";
  const calloutBody: string = isExceeded
    ? `Further ${props.resourceName.toLowerCase()} consumption may be blocked or throttled until usage falls below the limit or you upgrade your plan. Existing data is unaffected.`
    : isCritical
      ? `At your current pace, you'll hit the ${props.resourceName.toLowerCase()} limit soon. Once exceeded, additional ${props.resourceName.toLowerCase()} usage may be blocked or throttled.`
      : `You still have headroom, but you may want to plan ahead. Upgrading or freeing unused ${props.resourceName.toLowerCase()} now avoids any service interruption.`;

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
              background: `linear-gradient(135deg, ${accent} 0%, ${accentDark} 100%)`,
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
              {percentLabel} used
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
              Your {productName} account has used{" "}
              <strong>{usageDisplay}</strong>
              {periodLabel ? ` ${periodLabel}` : ""} of your{" "}
              <strong>{props.resourceName}</strong> allowance — that's{" "}
              <strong>{percentLabel}</strong> of your current limit.
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
                    Usage
                  </td>
                  <td
                    style={{
                      color: accentDark,
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "0 0 6px 0",
                      textAlign: "right",
                    }}
                  >
                    {percentLabel}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ padding: 0 }}>
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
                          backgroundColor: accent,
                          borderRadius: "999px",
                          height: "10px",
                          width: `${barPercent}%`,
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
                      padding: "6px 0 0 0",
                    }}
                  >
                    0
                  </td>
                  <td
                    style={{
                      color: MUTED_FOREGROUND,
                      fontSize: "12px",
                      padding: "6px 0 0 0",
                      textAlign: "right",
                    }}
                  >
                    Limit: {formatNumber(safeLimit)}
                    {unit ? ` ${unit}` : ""}
                  </td>
                </tr>
              </tbody>
            </table>
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
                borderLeft: `4px solid ${accentDark}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: calloutFg,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 6px 0",
                  textTransform: "uppercase",
                }}
              >
                {calloutHeading}
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

          {additionalContext ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
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
                  {additionalContext}
                </Text>
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={upgradeUrl ?? props.usageUrl}
              style={{
                backgroundColor: accentDark,
                borderRadius: "8px",
                color: "#ffffff",
                display: "inline-block",
                fontSize: "15px",
                fontWeight: 600,
                padding: "12px 22px",
                textDecoration: "none",
              }}
            >
              {upgradeUrl ? "Upgrade plan" : "View usage details"}
            </Button>
            {upgradeUrl ? (
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: "10px 0 0 0",
                }}
              >
                Or{" "}
                <a
                  href={props.usageUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  review your current usage
                </a>{" "}
                first.
              </Text>
            ) : null}
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
                href={upgradeUrl ?? props.usageUrl}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {upgradeUrl ?? props.usageUrl}
              </a>
            </Text>
          </Section>

          {manageBillingUrl ? (
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
                  Need to change plans or update billing details? Visit your{" "}
                  <a
                    href={manageBillingUrl}
                    style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                  >
                    billing settings
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
              Questions about plan limits, overage policies, or how this is
              measured? Reply to this email or reach us at{" "}
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
            email because your account is approaching or has exceeded a usage
            limit.{" "}
            <span style={{ color: BRAND_BLUE }}>·</span>{" "}
            <a
              href={props.usageUrl}
              style={{ color: MUTED_FOREGROUND, textDecoration: "underline" }}
            >
              Manage notifications
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

UsageThresholdWarningEmail.PreviewProps = {
  recipientName: "Jane Doe",
  resourceName: "API requests",
  currentUsage: 8742,
  usageLimit: 10000,
  unit: "requests",
  periodLabel: "this month",
  planName: "Pro",
  upgradeUrl: "https://schemavaults.com/billing/upgrade?plan=team",
  usageUrl: "https://schemavaults.com/account/usage",
  manageBillingUrl: "https://schemavaults.com/account/billing",
  additionalContext:
    "Your API request quota resets on the 1st of each month. Overage requests above the limit return HTTP 429 unless your plan allows pay-as-you-go.",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies UsageThresholdWarningEmailProps;
