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
  usedAmount: string;
  limitAmount: string;
  upgradeUrl: string;
  usagePercent?: number;
  userName?: string;
  planName?: string;
  resetDate?: string;
  overageConsequence?: string;
  dashboardUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties or oklch(), so token values are inlined as hex.
// BRAND_BLUE === `--schemavaults-brand-blue`; BRAND_RED === `--schemavaults-brand-red`.
// AMBER values approximate `--warning: oklch(82% 0.189 84.429)`.
const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
const BRAND_RED = "#dc2626";
const BRAND_RED_DARK = "#b91c1c";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const TRACK_BG = "#e2e8f0";
const AMBER = "#f59e0b";
const AMBER_DARK = "#b45309";

type Severity = "notice" | "warning" | "critical";

interface SeverityTheme {
  severity: Severity;
  accent: string;
  accentDark: string;
  gradientFrom: string;
  gradientTo: string;
  eyebrow: string;
  pill: string;
}

function parseNumericValue(raw: string | undefined): number | undefined {
  if (typeof raw !== "string") {
    return undefined;
  }
  const cleaned = raw.replace(/[^0-9.\-]/g, "");
  if (cleaned.length === 0) {
    return undefined;
  }
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function resolveEffectivePercent(props: UsageLimitWarningEmailProps): number {
  if (
    typeof props.usagePercent === "number" &&
    Number.isFinite(props.usagePercent)
  ) {
    return Math.max(0, props.usagePercent);
  }
  const used = parseNumericValue(props.usedAmount);
  const limit = parseNumericValue(props.limitAmount);
  if (
    typeof used === "number" &&
    typeof limit === "number" &&
    limit > 0
  ) {
    return Math.max(0, (used / limit) * 100);
  }
  return 90;
}

function resolveSeverityTheme(percent: number): SeverityTheme {
  if (percent >= 90) {
    return {
      severity: "critical",
      accent: BRAND_RED,
      accentDark: BRAND_RED_DARK,
      gradientFrom: BRAND_RED,
      gradientTo: BRAND_RED_DARK,
      eyebrow: percent >= 100 ? "Limit reached" : "Usage critical",
      pill: percent >= 100 ? "Over limit" : "Action needed",
    };
  }
  if (percent >= 75) {
    return {
      severity: "warning",
      accent: AMBER,
      accentDark: AMBER_DARK,
      gradientFrom: AMBER,
      gradientTo: AMBER_DARK,
      eyebrow: "Usage warning",
      pill: "Approaching limit",
    };
  }
  return {
    severity: "notice",
    accent: BRAND_BLUE,
    accentDark: BRAND_BLUE_DARK,
    gradientFrom: BRAND_BLUE,
    gradientTo: BRAND_BLUE_DARK,
    eyebrow: "Usage notice",
    pill: "Heads up",
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
    typeof props.usedAmount !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'usedAmount' in props for UsageLimitWarningEmail template!",
    );
  }
  if (
    typeof props.limitAmount !== "string" &&
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
    typeof props.userName === "string" && props.userName.length > 0
      ? props.userName
      : "there";
  const resourceName: string =
    typeof props.resourceName === "string" && props.resourceName.length > 0
      ? props.resourceName
      : "your plan resources";
  const planName: string | undefined =
    typeof props.planName === "string" && props.planName.length > 0
      ? props.planName
      : undefined;
  const resetDate: string | undefined =
    typeof props.resetDate === "string" && props.resetDate.length > 0
      ? props.resetDate
      : undefined;
  const overageConsequence: string | undefined =
    typeof props.overageConsequence === "string" &&
    props.overageConsequence.length > 0
      ? props.overageConsequence
      : undefined;
  const dashboardUrl: string | undefined =
    typeof props.dashboardUrl === "string" && props.dashboardUrl.length > 0
      ? props.dashboardUrl
      : undefined;

  const effectivePercent: number = resolveEffectivePercent(props);
  const roundedPercent: number = Math.round(effectivePercent);
  const barWidth: number = Math.min(100, Math.max(2, effectivePercent));
  const theme: SeverityTheme = resolveSeverityTheme(effectivePercent);
  const overLimit: boolean = effectivePercent >= 100;

  const headingText: string = overLimit
    ? `You've reached your ${resourceName} limit.`
    : `You've used ${roundedPercent}% of your ${resourceName}.`;

  const previewText: string = overLimit
    ? `Hi ${greetingName} — you've reached your ${resourceName} limit (${props.usedAmount} / ${props.limitAmount}) on ${productName}.`
    : `Hi ${greetingName} — you've used ${roundedPercent}% of your ${resourceName} (${props.usedAmount} / ${props.limitAmount}) on ${productName}.`;

  const introText: string = overLimit
    ? `Your ${productName} account has hit its ${resourceName} limit for the current period. New requests against this resource may be throttled or rejected until you upgrade or the quota resets.`
    : `Your ${productName} account is approaching its ${resourceName} limit for the current period. Upgrade now to avoid interruptions when you hit the cap.`;

  const metaRows: Array<[string, string]> = [
    ["Resource", resourceName],
    ["Used", `${props.usedAmount} / ${props.limitAmount} (${roundedPercent}%)`],
  ];
  if (planName) {
    metaRows.push(["Current plan", planName]);
  }
  if (resetDate) {
    metaRows.push(["Quota resets", resetDate]);
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
              {productName} · {theme.eyebrow}
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
              {theme.pill}
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
                    {resourceName} used
                  </td>
                  <td
                    style={{
                      color: theme.accentDark,
                      fontSize: "14px",
                      fontWeight: 700,
                      paddingBottom: "8px",
                      textAlign: "right",
                    }}
                  >
                    {roundedPercent}%
                  </td>
                </tr>
              </tbody>
            </table>
            <div
              style={{
                backgroundColor: TRACK_BG,
                borderRadius: "999px",
                height: "12px",
                overflow: "hidden",
                width: "100%",
              }}
            >
              <div
                style={{
                  backgroundColor: theme.accent,
                  borderRadius: "999px",
                  height: "12px",
                  width: `${barWidth}%`,
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
              {props.usedAmount} of {props.limitAmount} {resourceName} used
              {resetDate ? ` · resets ${resetDate}` : ""}
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

          {overageConsequence ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
                  borderLeft: `4px solid ${theme.accentDark}`,
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
                    margin: "0 0 4px 0",
                    textTransform: "uppercase",
                  }}
                >
                  What happens at the limit
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  {overageConsequence}
                </Text>
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={props.upgradeUrl}
              style={{
                backgroundColor: theme.accentDark,
                borderRadius: "8px",
                color: "#ffffff",
                display: "inline-block",
                fontSize: "15px",
                fontWeight: 600,
                padding: "12px 22px",
                textDecoration: "none",
              }}
            >
              {overLimit ? "Upgrade to restore access" : "Upgrade your plan"}
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
                style={{ color: theme.accentDark, textDecoration: "none" }}
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
                  Want a detailed breakdown of your consumption? Open your{" "}
                  <a
                    href={dashboardUrl}
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
              Questions about plan limits, usage-based pricing, or raising your
              quota? Reply to this email or reach us at{" "}
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
            email because your account is approaching a plan usage limit.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

UsageLimitWarningEmail.PreviewProps = {
  resourceName: "API requests",
  usedAmount: "9,120",
  limitAmount: "10,000",
  upgradeUrl: "https://schemavaults.com/billing/upgrade?plan=scale",
  usagePercent: 91,
  userName: "Jane Doe",
  planName: "Pro",
  resetDate: "Jun 1, 2026 00:00 UTC",
  overageConsequence:
    "Once you hit 10,000 API requests, additional requests in this billing period return HTTP 429 until the quota resets or you upgrade to a higher plan.",
  dashboardUrl: "https://schemavaults.com/account/usage",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies UsageLimitWarningEmailProps;
