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
  metricName: string;
  usagePercent: string;
  currentUsage: string;
  usageLimit: string;
  userName?: string;
  unit?: string;
  periodLabel?: string;
  resetAt?: string;
  planName?: string;
  upgradeUrl?: string;
  manageUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients do not resolve CSS custom properties (or oklch), so token values are
// inlined as sRGB hex equivalents.
const BRAND_BLUE = "#60a5fa"; // --schemavaults-brand-blue
const BRAND_BLUE_DARK = "#2563eb";
const WARNING = "#f59e0b"; // --warning  (oklch(82% 0.189 84.429))
const WARNING_DARK = "#b45309"; // --warning-foreground (oklch(41% 0.112 45.904))
const DESTRUCTIVE = "#dc2626"; // --schemavaults-brand-red / --destructive
const DESTRUCTIVE_DARK = "#991b1b";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const TRACK_BG = "#e2e8f0";

type Severity = "info" | "warning" | "critical";

function clampPercent(raw: string): number {
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed)) return 0;
  if (parsed < 0) return 0;
  if (parsed > 100) return 100;
  return parsed;
}

function severityFor(percent: number): Severity {
  if (percent >= 95) return "critical";
  if (percent >= 75) return "warning";
  return "info";
}

const SEVERITY_PALETTE: Record<
  Severity,
  { from: string; to: string; bar: string; eyebrow: string; label: string }
> = {
  info: {
    from: BRAND_BLUE,
    to: BRAND_BLUE_DARK,
    bar: BRAND_BLUE_DARK,
    eyebrow: "Usage update",
    label: "On track",
  },
  warning: {
    from: WARNING,
    to: WARNING_DARK,
    bar: WARNING,
    eyebrow: "Usage approaching limit",
    label: "Approaching limit",
  },
  critical: {
    from: DESTRUCTIVE,
    to: DESTRUCTIVE_DARK,
    bar: DESTRUCTIVE,
    eyebrow: "Usage limit reached",
    label: "Limit reached",
  },
};

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
    typeof props.usagePercent !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'usagePercent' in props for UsageLimitWarningEmail template!",
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

  const productName: string =
    typeof props.productName === "string" && props.productName.length > 0
      ? props.productName
      : "SchemaVaults";
  const supportEmail: string =
    typeof props.supportEmail === "string" && props.supportEmail.length > 0
      ? props.supportEmail
      : "support@schemavaults.com";
  const greetingName: string =
    typeof props.userName === "string" && props.userName.length > 0
      ? props.userName
      : "there";
  const unit: string | undefined =
    typeof props.unit === "string" && props.unit.length > 0
      ? props.unit
      : undefined;
  const periodLabel: string =
    typeof props.periodLabel === "string" && props.periodLabel.length > 0
      ? props.periodLabel
      : "this billing period";
  const planName: string | undefined =
    typeof props.planName === "string" && props.planName.length > 0
      ? props.planName
      : undefined;
  const resetAt: string | undefined =
    typeof props.resetAt === "string" && props.resetAt.length > 0
      ? props.resetAt
      : undefined;
  const upgradeUrl: string | undefined =
    typeof props.upgradeUrl === "string" && props.upgradeUrl.length > 0
      ? props.upgradeUrl
      : undefined;
  const manageUrl: string | undefined =
    typeof props.manageUrl === "string" && props.manageUrl.length > 0
      ? props.manageUrl
      : undefined;

  const percent = clampPercent(props.usagePercent);
  const severity = severityFor(percent);
  const palette = SEVERITY_PALETTE[severity];
  const percentDisplay = `${Number.isInteger(percent) ? percent.toString() : percent.toFixed(1)}%`;

  const previewText =
    severity === "critical"
      ? `${props.metricName} limit reached on ${productName} (${percentDisplay} of ${props.usageLimit}${unit ? ` ${unit}` : ""}).`
      : `${productName}: ${percentDisplay} of your ${props.metricName} used ${periodLabel}.`;

  const usageDisplay = `${props.currentUsage}${unit ? ` ${unit}` : ""} of ${props.usageLimit}${unit ? ` ${unit}` : ""}`;

  const metaRows: Array<[string, string]> = [
    ["Metric", props.metricName],
    ["Usage", usageDisplay],
    ["Period", periodLabel],
  ];
  if (planName) metaRows.push(["Plan", planName]);
  if (resetAt) metaRows.push(["Resets", resetAt]);

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
              background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
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
                margin: "8px 0 0 0",
              }}
            >
              {severity === "critical"
                ? `You've hit your ${props.metricName} limit.`
                : `You've used ${percentDisplay} of your ${props.metricName}.`}
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
              {severity === "critical" ? (
                <>
                  Your account has reached its <strong>{props.metricName}</strong>{" "}
                  limit for {periodLabel}. Further usage may be throttled or
                  rejected until your quota resets
                  {resetAt ? <> on {resetAt}</> : null}.
                </>
              ) : (
                <>
                  Your account is at <strong>{percentDisplay}</strong> of its{" "}
                  <strong>{props.metricName}</strong> allowance for {periodLabel}.
                  No action is required yet — this is a heads-up so you can
                  upgrade or adjust before hitting the cap.
                </>
              )}
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
                    {props.metricName} used
                  </td>
                  <td
                    style={{
                      color: palette.bar,
                      fontSize: "13px",
                      fontWeight: 700,
                      padding: "0 0 6px 0",
                      textAlign: "right",
                    }}
                  >
                    {percentDisplay} · {palette.label}
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
                  backgroundColor: palette.bar,
                  borderRadius: "999px",
                  height: "10px",
                  width: `${percent}%`,
                }}
              />
            </div>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "12px",
                lineHeight: "1.55",
                margin: "8px 0 0 0",
              }}
            >
              {usageDisplay}
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 8px 32px" }}>
            <div
              style={{
                backgroundColor: PANEL_BG,
                border: `1px solid ${BORDER}`,
                borderLeft: `4px solid ${palette.bar}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
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
            </div>
          </Section>

          {upgradeUrl ? (
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
                {severity === "critical" ? "Upgrade now" : "Upgrade plan"}
              </Button>
            </Section>
          ) : null}

          {manageUrl ? (
            <Section style={{ padding: "0 32px 8px 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                View detailed usage in your dashboard:{" "}
                <a
                  href={manageUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  {manageUrl}
                </a>
              </Text>
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
              Need a custom limit or have questions about your plan? Reach us at{" "}
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

UsageLimitWarningEmail.PreviewProps = {
  userName: "Jane Doe",
  metricName: "API requests",
  usagePercent: "85",
  currentUsage: "8,500",
  usageLimit: "10,000",
  unit: "requests",
  periodLabel: "this billing cycle",
  planName: "Pro",
  resetAt: "Jul 1, 2026 00:00 UTC",
  upgradeUrl: "https://schemavaults.com/billing/upgrade",
  manageUrl: "https://schemavaults.com/dashboard/usage",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies UsageLimitWarningEmailProps;
