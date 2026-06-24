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

export interface UsageQuotaWarningEmailProps {
  recipientName?: string;
  metricName: string;
  currentUsage: string;
  usageLimit: string;
  usagePercent: number;
  unit?: string;
  planName?: string;
  resetDate?: string;
  recommendedPlan?: string;
  upgradeUrl: string;
  upgradeLabel?: string;
  usageDashboardUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand and warning tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties or oklch(), so the token values are inlined as hex.
// AMBER values approximate `--warning: oklch(82% 0.189 84.429)` and `--warning-foreground: oklch(41% 0.112 45.904)`.
// RED values approximate `--schemavaults-brand-red: #dc2626` for the critical (>=95%) state.
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
const TRACK_BG = "#e5e7eb";

export default function UsageQuotaWarningEmail(
  props: UsageQuotaWarningEmailProps,
): ReactElement {
  if (
    typeof props.metricName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'metricName' in props for UsageQuotaWarningEmail template!",
    );
  }
  if (
    typeof props.currentUsage !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'currentUsage' in props for UsageQuotaWarningEmail template!",
    );
  }
  if (
    typeof props.usageLimit !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'usageLimit' in props for UsageQuotaWarningEmail template!",
    );
  }
  if (
    typeof props.usagePercent !== "number" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'usagePercent' in props for UsageQuotaWarningEmail template!",
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
  const planName: string | undefined =
    typeof props.planName === "string" && props.planName.length > 0
      ? props.planName
      : undefined;
  const recommendedPlan: string | undefined =
    typeof props.recommendedPlan === "string" &&
    props.recommendedPlan.length > 0
      ? props.recommendedPlan
      : undefined;
  const resetDate: string | undefined =
    typeof props.resetDate === "string" && props.resetDate.length > 0
      ? props.resetDate
      : undefined;
  const upgradeLabel: string =
    typeof props.upgradeLabel === "string" && props.upgradeLabel.length > 0
      ? props.upgradeLabel
      : "Upgrade your plan";
  const usageDashboardUrl: string | undefined =
    typeof props.usageDashboardUrl === "string" &&
    props.usageDashboardUrl.length > 0
      ? props.usageDashboardUrl
      : undefined;

  const rawPercent: number =
    typeof props.usagePercent === "number" && Number.isFinite(props.usagePercent)
      ? props.usagePercent
      : 0;
  const clampedPercent: number = Math.max(0, Math.min(100, rawPercent));
  const displayPercent: number = Math.round(clampedPercent);
  const isCritical: boolean = clampedPercent >= 95;

  const headerGradient: string = isCritical
    ? `linear-gradient(135deg, ${RED} 0%, ${RED_DARK} 100%)`
    : `linear-gradient(135deg, ${AMBER} 0%, ${AMBER_DARK} 100%)`;
  const calloutBg: string = isCritical ? RED_BG : AMBER_BG;
  const calloutBorder: string = isCritical ? RED_BORDER : AMBER_BORDER;
  const calloutBorderLeft: string = isCritical ? RED : AMBER_DARK;
  const calloutFg: string = isCritical ? RED_FOREGROUND : AMBER_FOREGROUND;
  const barFill: string = isCritical ? RED : AMBER;
  const ctaBg: string = isCritical ? RED : BRAND_BLUE_DARK;
  const eyebrowLabel: string = isCritical
    ? "Usage limit nearly reached"
    : "Usage approaching limit";

  const usageWithUnit = (value: string): string =>
    unit.length > 0 ? `${value} ${unit}` : value;
  const currentUsageDisplay: string = usageWithUnit(props.currentUsage);
  const usageLimitDisplay: string = usageWithUnit(props.usageLimit);

  const previewText: string = isCritical
    ? `You've used ${displayPercent}% of your ${productName} ${props.metricName} quota.`
    : `Heads up — you're at ${displayPercent}% of your ${productName} ${props.metricName} quota.`;

  const metaRows: Array<[string, string]> = [
    [props.metricName, `${currentUsageDisplay} of ${usageLimitDisplay}`],
  ];
  if (planName) {
    metaRows.push(["Current plan", planName]);
  }
  if (recommendedPlan) {
    metaRows.push(["Recommended", recommendedPlan]);
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
              {productName} · {eyebrowLabel}
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
              You've used {displayPercent}% of your {props.metricName} quota.
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
              {isCritical ? (
                <>
                  Your {productName} workspace is at{" "}
                  <strong>{displayPercent}%</strong> of its{" "}
                  <strong>{props.metricName}</strong> quota for the current
                  billing period. Once you hit 100%, new {props.metricName}{" "}
                  requests will be rejected until the quota resets or you
                  upgrade.
                </>
              ) : (
                <>
                  Your {productName} workspace has used{" "}
                  <strong>{displayPercent}%</strong> of its{" "}
                  <strong>{props.metricName}</strong> quota for the current
                  billing period. You're still under the limit — this is just
                  a heads-up so you can upgrade or adjust usage before it
                  becomes a blocker.
                </>
              )}
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
                    {props.metricName}
                  </td>
                  <td
                    style={{
                      color: FOREGROUND,
                      fontSize: "13px",
                      fontWeight: 600,
                      paddingBottom: "8px",
                      textAlign: "right",
                    }}
                  >
                    {currentUsageDisplay} / {usageLimitDisplay}{" "}
                    <span style={{ color: MUTED_FOREGROUND, fontWeight: 500 }}>
                      ({displayPercent}%)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              style={{
                backgroundColor: TRACK_BG,
                borderCollapse: "collapse",
                borderRadius: "999px",
                height: "10px",
                overflow: "hidden",
                width: "100%",
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      backgroundColor: barFill,
                      borderRadius: "999px",
                      height: "10px",
                      lineHeight: "10px",
                      padding: 0,
                      width: `${clampedPercent}%`,
                    }}
                  >
                    {" "}
                  </td>
                  <td
                    style={{
                      backgroundColor: TRACK_BG,
                      height: "10px",
                      lineHeight: "10px",
                      padding: 0,
                      width: `${100 - clampedPercent}%`,
                    }}
                  >
                    {" "}
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section style={{ padding: "16px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: calloutBg,
                border: `1px solid ${calloutBorder}`,
                borderLeft: `4px solid ${calloutBorderLeft}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: calloutFg,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                {isCritical
                  ? `At your current pace you may hit the ${props.metricName} cap before ${resetDate ?? "the next reset"}. Upgrading now keeps your workspace running without interruption.`
                  : `If usage keeps climbing, you may hit the ${props.metricName} cap before ${resetDate ?? "the next reset"}. Upgrading raises the cap immediately — no migration required.`}
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
                backgroundColor: ctaBg,
                borderRadius: "8px",
                color: "#ffffff",
                display: "inline-block",
                fontSize: "15px",
                fontWeight: 600,
                padding: "12px 22px",
                textDecoration: "none",
              }}
            >
              {upgradeLabel}
            </Button>
          </Section>

          {usageDashboardUrl ? (
            <Section style={{ padding: "0 32px 16px 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                Prefer to dig into the numbers first?{" "}
                <a
                  href={usageDashboardUrl}
                  style={{
                    color: BRAND_BLUE_DARK,
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  View your usage dashboard →
                </a>
              </Text>
            </Section>
          ) : null}

          <Section style={{ padding: "8px 32px 24px 32px" }}>
            <div
              style={{
                backgroundColor: PANEL_BG,
                border: `1px solid ${BORDER}`,
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
                Tips to stay under the cap
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                Batch repeated requests, cache hot schema reads on your side,
                or rotate non-critical jobs to off-peak windows. The usage
                dashboard breaks consumption down by API key so you can spot
                the biggest contributors.
              </Text>
            </div>
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
              Questions about plans or limits? Reach us at{" "}
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
            email because your workspace usage crossed an alert threshold.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

UsageQuotaWarningEmail.PreviewProps = {
  recipientName: "Jane Doe",
  metricName: "API requests",
  currentUsage: "8,500",
  usageLimit: "10,000",
  usagePercent: 85,
  unit: "requests",
  planName: "Team",
  resetDate: "Jul 1, 2026",
  recommendedPlan: "Scale",
  upgradeUrl: "https://schemavaults.com/billing/upgrade",
  upgradeLabel: "Upgrade to Scale",
  usageDashboardUrl: "https://schemavaults.com/dashboard/usage",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies UsageQuotaWarningEmailProps;
