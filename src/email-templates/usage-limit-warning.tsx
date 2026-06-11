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
  usedAmount: string;
  limitAmount: string;
  percentUsed: number;
  resetDate?: string;
  currentPlan?: string;
  upgradePlanName?: string;
  upgradePlanLimit?: string;
  upgradeUrl: string;
  manageBillingUrl?: string;
  recommendations?: string[];
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand and warning tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties or oklch(), so the token values are inlined as hex.
// AMBER values approximate `--warning: oklch(82% 0.189 84.429)` and `--warning-foreground: oklch(41% 0.112 45.904)`.
// RED values approximate `--schemavaults-brand-red` / `--destructive` for the over-limit (>=100%) state.
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

const DEFAULT_RECOMMENDATIONS: readonly string[] = [
  "Review recent usage in your dashboard to identify spikes",
  "Archive or delete resources you no longer need",
  "Upgrade your plan to unlock a higher limit",
];

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
  const recommendations: readonly string[] =
    Array.isArray(props.recommendations) && props.recommendations.length > 0
      ? props.recommendations
      : DEFAULT_RECOMMENDATIONS;

  const rawPercent: number =
    typeof props.percentUsed === "number" && Number.isFinite(props.percentUsed)
      ? props.percentUsed
      : 0;
  const clampedPercent: number = Math.max(0, Math.min(rawPercent, 100));
  const displayPercent: number = Math.round(rawPercent);
  const isOverLimit: boolean = rawPercent >= 100;

  const accent: string = isOverLimit ? RED : AMBER;
  const accentDark: string = isOverLimit ? RED_DARK : AMBER_DARK;
  const accentBg: string = isOverLimit ? RED_BG : AMBER_BG;
  const accentBorder: string = isOverLimit ? RED_BORDER : AMBER_BORDER;
  const accentForeground: string = isOverLimit ? RED_FOREGROUND : AMBER_FOREGROUND;

  const statusLabel: string = isOverLimit ? "Limit reached" : "Usage warning";
  const headerHeadline: string = isOverLimit
    ? `You've hit your ${props.resourceName} limit.`
    : `You're nearing your ${props.resourceName} limit.`;
  const bodyLead: string = isOverLimit
    ? `Your ${productName} account has reached its ${props.resourceName} allowance for the current billing period. Some operations may be paused until usage drops or your plan is upgraded.`
    : `Your ${productName} account has used ${displayPercent}% of its ${props.resourceName} allowance for the current billing period. We're sending this heads-up so nothing breaks unexpectedly.`;

  const previewText = `${displayPercent}% of your ${props.resourceName} used on ${productName}.`;

  const metaRows: Array<[string, string]> = [
    ["Resource", props.resourceName],
    ["Used", `${props.usedAmount} of ${props.limitAmount} (${displayPercent}%)`],
  ];
  if (typeof props.currentPlan === "string" && props.currentPlan.length > 0) {
    metaRows.push(["Current plan", props.currentPlan]);
  }
  if (typeof props.resetDate === "string" && props.resetDate.length > 0) {
    metaRows.push(["Resets on", props.resetDate]);
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
              {productName} · {statusLabel}
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
              {headerHeadline}
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
              {bodyLead}
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: accentBg,
                border: `1px solid ${accentBorder}`,
                borderRadius: "10px",
                padding: "18px 18px 16px 18px",
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
                        color: accentForeground,
                        fontSize: "13px",
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {props.resourceName}
                    </td>
                    <td
                      style={{
                        color: accentForeground,
                        fontSize: "20px",
                        fontWeight: 700,
                        textAlign: "right",
                      }}
                    >
                      {displayPercent}%
                    </td>
                  </tr>
                </tbody>
              </table>
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: `1px solid ${accentBorder}`,
                  borderRadius: "999px",
                  height: "10px",
                  overflow: "hidden",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    backgroundColor: accentDark,
                    borderRadius: "999px",
                    height: "10px",
                    width: `${clampedPercent}%`,
                  }}
                />
              </div>
              <Text
                style={{
                  color: accentForeground,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: "10px 0 0 0",
                }}
              >
                {props.usedAmount} used · {props.limitAmount} included
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

          {typeof props.upgradePlanName === "string" &&
          props.upgradePlanName.length > 0 ? (
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
                    margin: "0 0 4px 0",
                    textTransform: "uppercase",
                  }}
                >
                  Recommended upgrade
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  <strong>{props.upgradePlanName}</strong>
                  {typeof props.upgradePlanLimit === "string" &&
                  props.upgradePlanLimit.length > 0
                    ? ` includes ${props.upgradePlanLimit} of ${props.resourceName} — about ${displayPercent >= 100 ? "more than" : ""} enough headroom for your current usage.`
                    : ` includes a higher ${props.resourceName} allowance.`}
                </Text>
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 4px 32px" }}>
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
              {isOverLimit ? "Upgrade now" : "Review upgrade options"}
            </Button>
            {typeof props.manageBillingUrl === "string" &&
            props.manageBillingUrl.length > 0 ? (
              <a
                href={props.manageBillingUrl}
                style={{
                  color: BRAND_BLUE_DARK,
                  display: "inline-block",
                  fontSize: "14px",
                  fontWeight: 500,
                  marginLeft: "12px",
                  textDecoration: "none",
                }}
              >
                Manage billing →
              </a>
            ) : null}
          </Section>

          <Hr style={{ borderColor: BORDER, margin: "20px 32px 0 32px" }} />

          <Section style={{ padding: "20px 32px 4px 32px" }}>
            <Heading
              as="h2"
              style={{
                color: FOREGROUND,
                fontSize: "15px",
                fontWeight: 600,
                margin: "0 0 10px 0",
              }}
            >
              What you can do
            </Heading>
            {recommendations.map((item, idx) => (
              <Text
                key={idx}
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.6",
                  margin: "0 0 6px 0",
                  paddingLeft: "20px",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    color: accentDark,
                    fontWeight: 700,
                    left: 0,
                    position: "absolute",
                  }}
                >
                  →
                </span>
                {item}
              </Text>
            ))}
          </Section>

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
              Questions about your usage or billing? Reply to this email or
              reach us at{" "}
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
  usedAmount: "85,420",
  limitAmount: "100,000",
  percentUsed: 85,
  resetDate: "Jul 1, 2026",
  currentPlan: "Team",
  upgradePlanName: "Scale",
  upgradePlanLimit: "500,000",
  upgradeUrl: "https://schemavaults.com/billing/upgrade?source=usage-warning",
  manageBillingUrl: "https://schemavaults.com/billing",
  recommendations: [
    "Open the usage dashboard to see which API keys drove the most traffic",
    "Cache schema fetches in your client SDK to reduce repeat requests",
    "Upgrade to the Scale plan for 5× the monthly request allowance",
  ],
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies UsageLimitWarningEmailProps;
