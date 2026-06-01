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
  currentUsage: string;
  usageLimit: string;
  percentUsed: number;
  upgradeUrl: string;
  recipientName?: string;
  currentPlan?: string;
  recommendedPlanName?: string;
  recommendedPlanLimit?: string;
  recommendedPlanPrice?: string;
  resetDate?: string;
  overageBehavior?: string;
  manageUsageUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand, warning, and destructive tokens
// (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties or oklch(), so the token values are inlined as hex.
// BRAND_BLUE matches `--schemavaults-brand-blue`; BRAND_RED matches `--schemavaults-brand-red`.
// AMBER values approximate `--warning: oklch(82% 0.189 84.429)` / `--warning-foreground: oklch(41% 0.112 45.904)`.
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
const TRACK_BG = "#e2e8f0";

type Severity = "info" | "warning" | "critical";

interface SeverityPalette {
  severity: Severity;
  label: string;
  gradientFrom: string;
  gradientTo: string;
  ctaBg: string;
  barFill: string;
  calloutBg: string;
  calloutBorder: string;
  calloutForeground: string;
  calloutAccent: string;
}

function resolveSeverity(percentUsed: number): SeverityPalette {
  if (percentUsed >= 95) {
    return {
      severity: "critical",
      label: "Critical",
      gradientFrom: BRAND_RED,
      gradientTo: BRAND_RED_DARK,
      ctaBg: BRAND_RED_DARK,
      barFill: BRAND_RED,
      calloutBg: RED_BG,
      calloutBorder: RED_BORDER,
      calloutForeground: RED_FOREGROUND,
      calloutAccent: BRAND_RED_DARK,
    };
  }
  if (percentUsed >= 80) {
    return {
      severity: "warning",
      label: "Warning",
      gradientFrom: AMBER,
      gradientTo: AMBER_DARK,
      ctaBg: AMBER_DARK,
      barFill: AMBER,
      calloutBg: AMBER_BG,
      calloutBorder: AMBER_BORDER,
      calloutForeground: AMBER_FOREGROUND,
      calloutAccent: AMBER_DARK,
    };
  }
  return {
    severity: "info",
    label: "Heads up",
    gradientFrom: BRAND_BLUE,
    gradientTo: BRAND_BLUE_DARK,
    ctaBg: BRAND_BLUE_DARK,
    barFill: BRAND_BLUE,
    calloutBg: PANEL_BG,
    calloutBorder: BORDER,
    calloutForeground: FOREGROUND,
    calloutAccent: BRAND_BLUE_DARK,
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
  const currentPlan: string =
    typeof props.currentPlan === "string" && props.currentPlan.length > 0
      ? props.currentPlan
      : "your current plan";
  const recommendedPlanName: string =
    typeof props.recommendedPlanName === "string" &&
    props.recommendedPlanName.length > 0
      ? props.recommendedPlanName
      : "a higher tier";
  const recommendedPlanLimit: string | undefined =
    typeof props.recommendedPlanLimit === "string" &&
    props.recommendedPlanLimit.length > 0
      ? props.recommendedPlanLimit
      : undefined;
  const recommendedPlanPrice: string | undefined =
    typeof props.recommendedPlanPrice === "string" &&
    props.recommendedPlanPrice.length > 0
      ? props.recommendedPlanPrice
      : undefined;
  const resetDate: string | undefined =
    typeof props.resetDate === "string" && props.resetDate.length > 0
      ? props.resetDate
      : undefined;
  const overageBehavior: string | undefined =
    typeof props.overageBehavior === "string" &&
    props.overageBehavior.length > 0
      ? props.overageBehavior
      : undefined;
  const manageUsageUrl: string | undefined =
    typeof props.manageUsageUrl === "string" && props.manageUsageUrl.length > 0
      ? props.manageUsageUrl
      : undefined;

  const rawPercent: number =
    typeof props.percentUsed === "number" && Number.isFinite(props.percentUsed)
      ? props.percentUsed
      : 0;
  const clampedPercent: number = Math.max(0, Math.min(100, rawPercent));
  const palette = resolveSeverity(clampedPercent);
  const displayPercent: number = Math.round(clampedPercent);
  const fillPercent: number = Math.max(2, displayPercent);
  const remainingPercent: number = 100 - fillPercent;

  const headingText: string =
    palette.severity === "critical"
      ? `You've nearly exhausted your ${props.resourceName} quota.`
      : palette.severity === "warning"
        ? `You're approaching your ${props.resourceName} limit.`
        : `Usage update for ${props.resourceName}.`;

  const previewText: string =
    palette.severity === "critical"
      ? `Hi ${greetingName} — ${displayPercent}% of your ${props.resourceName} quota is used (${props.currentUsage} of ${props.usageLimit}).`
      : `Hi ${greetingName} — you've used ${displayPercent}% of your ${props.resourceName} allotment (${props.currentUsage} of ${props.usageLimit}).`;

  const metaRows: Array<[string, string]> = [
    ["Resource", props.resourceName],
    ["Current plan", currentPlan],
    ["Used", `${props.currentUsage} of ${props.usageLimit}`],
    ["Percent used", `${displayPercent}%`],
  ];
  if (resetDate) {
    metaRows.push(["Resets", resetDate]);
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
              {productName} · Usage {palette.label}
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
              {displayPercent}% used
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
              <strong>{props.currentUsage}</strong> of{" "}
              <strong>{props.usageLimit}</strong> {props.resourceName} on{" "}
              <strong>{currentPlan}</strong>
              {resetDate ? ` for the period ending ${resetDate}` : ""}. Here's
              where you stand:
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 0 32px" }}>
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              style={{
                borderCollapse: "collapse",
                borderRadius: "999px",
                overflow: "hidden",
                width: "100%",
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      backgroundColor: palette.barFill,
                      borderRadius: "999px 0 0 999px",
                      height: "14px",
                      lineHeight: "14px",
                      width: `${fillPercent}%`,
                    }}
                  >
                    &nbsp;
                  </td>
                  <td
                    style={{
                      backgroundColor: TRACK_BG,
                      borderRadius: "0 999px 999px 0",
                      height: "14px",
                      lineHeight: "14px",
                      width: `${remainingPercent}%`,
                    }}
                  >
                    &nbsp;
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              style={{
                borderCollapse: "collapse",
                marginTop: "6px",
                width: "100%",
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      color: MUTED_FOREGROUND,
                      fontSize: "12px",
                      lineHeight: "1.4",
                      textAlign: "left",
                    }}
                  >
                    {props.currentUsage} used
                  </td>
                  <td
                    style={{
                      color: MUTED_FOREGROUND,
                      fontSize: "12px",
                      lineHeight: "1.4",
                      textAlign: "right",
                    }}
                  >
                    {props.usageLimit} limit
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

          {overageBehavior ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: palette.calloutBg,
                  border: `1px solid ${palette.calloutBorder}`,
                  borderLeft: `4px solid ${palette.calloutAccent}`,
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <Text
                  style={{
                    color: palette.calloutForeground,
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    margin: "0 0 4px 0",
                    textTransform: "uppercase",
                  }}
                >
                  What happens if you hit the limit
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  {overageBehavior}
                </Text>
              </div>
            </Section>
          ) : null}

          {recommendedPlanLimit || recommendedPlanPrice ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
                  borderLeft: `4px solid ${BRAND_BLUE_DARK}`,
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <Text
                  style={{
                    color: MUTED_FOREGROUND,
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    margin: "0 0 6px 0",
                    textTransform: "uppercase",
                  }}
                >
                  Recommended: {recommendedPlanName}
                </Text>
                {recommendedPlanLimit ? (
                  <Text
                    style={{
                      color: FOREGROUND,
                      fontSize: "14px",
                      lineHeight: "1.55",
                      margin: "0 0 2px 0",
                    }}
                  >
                    Includes <strong>{recommendedPlanLimit}</strong> of{" "}
                    {props.resourceName}.
                  </Text>
                ) : null}
                {recommendedPlanPrice ? (
                  <Text
                    style={{
                      color: MUTED_FOREGROUND,
                      fontSize: "13px",
                      lineHeight: "1.5",
                      margin: 0,
                    }}
                  >
                    Starting at {recommendedPlanPrice}.
                  </Text>
                ) : null}
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={props.upgradeUrl}
              style={{
                backgroundColor: palette.ctaBg,
                borderRadius: "8px",
                color: "#ffffff",
                display: "inline-block",
                fontSize: "15px",
                fontWeight: 600,
                padding: "12px 22px",
                textDecoration: "none",
              }}
            >
              Upgrade {recommendedPlanName !== "a higher tier"
                ? `to ${recommendedPlanName}`
                : "your plan"}
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
                style={{ color: palette.calloutAccent, textDecoration: "none" }}
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
                  Want a closer look at where this usage is coming from? Open
                  your{" "}
                  <a
                    href={manageUsageUrl}
                    style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                  >
                    usage dashboard
                  </a>{" "}
                  to drill into request volume, top consumers, and historical
                  trends.
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
              You're receiving this because automated usage monitoring detected
              that your account is approaching a plan limit. Need help right-
              sizing your plan or have questions about overage policy? Reach us
              at{" "}
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
  recipientName: "Jane Doe",
  resourceName: "API requests",
  currentUsage: "92,438",
  usageLimit: "100,000",
  percentUsed: 92,
  currentPlan: "Pro",
  recommendedPlanName: "Scale",
  recommendedPlanLimit: "1,000,000 API requests / month",
  recommendedPlanPrice: "$99 / month",
  resetDate: "Jul 1, 2026 00:00 UTC",
  overageBehavior:
    "Once you hit 100%, additional API requests will be rate-limited to 1 request/second until your usage window resets or you upgrade your plan.",
  upgradeUrl: "https://schemavaults.com/billing/upgrade?plan=scale",
  manageUsageUrl: "https://schemavaults.com/account/usage",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies UsageLimitWarningEmailProps;
