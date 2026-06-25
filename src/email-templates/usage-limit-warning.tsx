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
  metricName: string;
  currentUsage: number;
  limit: number;
  unit?: string;
  planName?: string;
  periodEndsAt?: string;
  severity?: "warning" | "critical";
  upgradeUrl: string;
  manageBillingUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand / warning / destructive tokens
// (see node_modules/@schemavaults/theme/globals.css). Email clients don't
// resolve CSS custom properties or oklch(), so the token values are inlined
// as hex. AMBER values approximate `--warning: oklch(82% 0.189 84.429)`;
// RED values approximate `--destructive` and the brand red token
// `--schemavaults-brand-red: #dc2626`.
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

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) {
    return String(n);
  }
  if (Number.isInteger(n)) {
    return n.toLocaleString("en-US");
  }
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export default function UsageLimitWarningEmail(
  props: UsageLimitWarningEmailProps,
): ReactElement {
  if (
    typeof props.metricName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'metricName' in props for UsageLimitWarningEmail template!",
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
  const planName: string =
    typeof props.planName === "string" && props.planName.length > 0
      ? props.planName
      : "current plan";
  const unit: string =
    typeof props.unit === "string" && props.unit.length > 0 ? props.unit : "";
  const periodEndsAt: string | undefined =
    typeof props.periodEndsAt === "string" && props.periodEndsAt.length > 0
      ? props.periodEndsAt
      : undefined;
  const manageBillingUrl: string | undefined =
    typeof props.manageBillingUrl === "string" &&
    props.manageBillingUrl.length > 0
      ? props.manageBillingUrl
      : undefined;

  const safeCurrent: number =
    typeof props.currentUsage === "number" && Number.isFinite(props.currentUsage)
      ? Math.max(0, props.currentUsage)
      : 0;
  const safeLimit: number =
    typeof props.limit === "number" &&
    Number.isFinite(props.limit) &&
    props.limit > 0
      ? props.limit
      : 1;

  const rawRatio = safeCurrent / safeLimit;
  const ratio = Math.min(1.5, Math.max(0, rawRatio));
  const percentDisplay = Math.round(ratio * 100);
  const barFillPercent = Math.min(100, Math.max(0, Math.round(rawRatio * 100)));
  const isOverLimit = rawRatio >= 1;

  const inferredSeverity: "warning" | "critical" =
    rawRatio >= 0.95 ? "critical" : "warning";
  const severity: "warning" | "critical" =
    props.severity === "warning" || props.severity === "critical"
      ? props.severity
      : inferredSeverity;

  const isCritical = severity === "critical";

  const themeAccent = isCritical ? RED : AMBER;
  const themeAccentDark = isCritical ? RED_DARK : AMBER_DARK;
  const themeBg = isCritical ? RED_BG : AMBER_BG;
  const themeBorder = isCritical ? RED_BORDER : AMBER_BORDER;
  const themeForeground = isCritical ? RED_FOREGROUND : AMBER_FOREGROUND;

  const eyebrow = isCritical
    ? `${productName} · Usage limit reached`
    : `${productName} · Usage limit warning`;

  const headingText = isOverLimit
    ? `You've exceeded your ${planName} ${props.metricName} limit.`
    : isCritical
      ? `You're about to hit your ${props.metricName} limit.`
      : `You've used ${percentDisplay}% of your ${props.metricName} limit.`;

  const previewText = isOverLimit
    ? `You've exceeded your ${planName} ${props.metricName} limit (${formatNumber(safeCurrent)}${unit ? " " + unit : ""} of ${formatNumber(safeLimit)}${unit ? " " + unit : ""}).`
    : `You've used ${percentDisplay}% of your ${planName} ${props.metricName} limit on ${productName}.`;

  const usageText = `${formatNumber(safeCurrent)}${unit ? " " + unit : ""} of ${formatNumber(safeLimit)}${unit ? " " + unit : ""}`;

  const metaRows: Array<[string, string]> = [
    ["Metric", props.metricName],
    ["Current usage", usageText],
    ["Plan", planName],
  ];
  if (periodEndsAt) {
    metaRows.push(["Resets", periodEndsAt]);
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
              background: `linear-gradient(135deg, ${themeAccent} 0%, ${themeAccentDark} 100%)`,
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
                margin: "8px 0 0 0",
              }}
            >
              {headingText}
            </Heading>
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
              {isOverLimit ? (
                <>
                  Your <strong>{planName}</strong> has exceeded its{" "}
                  <strong>{props.metricName}</strong> limit for the current
                  billing period. To avoid service interruption, upgrade your
                  plan or wait until the limit resets
                  {periodEndsAt ? ` on ${periodEndsAt}` : ""}.
                </>
              ) : (
                <>
                  Your <strong>{planName}</strong> is at{" "}
                  <strong>{percentDisplay}%</strong> of its{" "}
                  <strong>{props.metricName}</strong> limit
                  {periodEndsAt ? ` for the period ending ${periodEndsAt}` : ""}
                  . We&apos;re letting you know early so you can keep things
                  running smoothly.
                </>
              )}
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 4px 32px" }}>
            <div
              style={{
                backgroundColor: themeBg,
                border: `1px solid ${themeBorder}`,
                borderRadius: "10px",
                padding: "16px 18px",
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
                        color: themeForeground,
                        fontSize: "13px",
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
                        color: themeForeground,
                        fontSize: "20px",
                        fontWeight: 700,
                        textAlign: "right",
                        verticalAlign: "middle",
                      }}
                    >
                      {percentDisplay}%
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
                    backgroundColor: themeAccentDark,
                    borderRadius: "999px",
                    height: "10px",
                    width: `${barFillPercent}%`,
                  }}
                />
              </div>

              <Text
                style={{
                  color: themeForeground,
                  fontSize: "13px",
                  fontWeight: 500,
                  lineHeight: "1.5",
                  margin: "10px 0 0 0",
                }}
              >
                {usageText}
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
              {isOverLimit ? "Upgrade to restore service" : "Upgrade your plan"}
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
              Or open this link in your browser:{" "}
              <a
                href={props.upgradeUrl}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {props.upgradeUrl}
              </a>
            </Text>
          </Section>

          {manageBillingUrl ? (
            <Section style={{ padding: "12px 32px 8px 32px" }}>
              <div
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "8px",
                  padding: "12px 14px",
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
                  Need to change plans or review usage details?{" "}
                  <a
                    href={manageBillingUrl}
                    style={{
                      color: BRAND_BLUE_DARK,
                      textDecoration: "none",
                    }}
                  >
                    Manage billing &amp; usage →
                  </a>
                </Text>
              </div>
            </Section>
          ) : null}

          <Hr style={{ borderColor: BORDER, margin: "16px 32px 0 32px" }} />

          <Section style={{ padding: "20px 32px 28px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Questions about your usage, plan limits, or pricing? Reply to
              this email or reach us at{" "}
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
            email because your account is approaching a plan limit.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

UsageLimitWarningEmail.PreviewProps = {
  recipientName: "Jordan Lee",
  metricName: "API requests",
  currentUsage: 87_400,
  limit: 100_000,
  unit: "requests",
  planName: "Starter",
  periodEndsAt: "Jul 1, 2026 00:00 UTC",
  severity: "warning",
  upgradeUrl: "https://schemavaults.com/billing/upgrade?from=usage-warning",
  manageBillingUrl: "https://schemavaults.com/billing",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies UsageLimitWarningEmailProps;
