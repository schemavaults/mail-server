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
  usageLimit: number;
  unit?: string;
  periodEndsAt?: string;
  planName?: string;
  upgradeUrl: string;
  dashboardUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand, warning, and destructive tokens
// (see node_modules/@schemavaults/theme/globals.css). Email clients don't
// resolve CSS custom properties or oklch(), so the token values are inlined.
const BRAND_BLUE_DARK = "#2563eb";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const TRACK_BG = "#e2e8f0";
// AMBER ≈ `--warning: oklch(82% 0.189 84.429)`
const AMBER = "#f59e0b";
const AMBER_DARK = "#b45309";
const AMBER_BG = "#fffbeb";
const AMBER_BORDER = "#fde68a";
const AMBER_FOREGROUND = "#78350f";
// RED ≈ `--schemavaults-brand-red: #dc2626` / `--destructive`
const RED = "#dc2626";
const RED_DARK = "#991b1b";
const RED_BG = "#fef2f2";
const RED_BORDER = "#fecaca";
const RED_FOREGROUND = "#7f1d1d";

function formatUsageNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return String(value);
  }
  if (Number.isInteger(value)) {
    return value.toLocaleString("en-US");
  }
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
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
    typeof props.usageLimit !== "number" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'usageLimit' in props for UsageLimitWarningEmail template!",
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
  const unit: string =
    typeof props.unit === "string" && props.unit.length > 0 ? props.unit : "";
  const planName: string | undefined =
    typeof props.planName === "string" && props.planName.length > 0
      ? props.planName
      : undefined;
  const periodEndsAt: string | undefined =
    typeof props.periodEndsAt === "string" && props.periodEndsAt.length > 0
      ? props.periodEndsAt
      : undefined;
  const dashboardUrl: string | undefined =
    typeof props.dashboardUrl === "string" && props.dashboardUrl.length > 0
      ? props.dashboardUrl
      : undefined;

  const safeLimit: number =
    typeof props.usageLimit === "number" && props.usageLimit > 0
      ? props.usageLimit
      : 1;
  const safeUsage: number =
    typeof props.currentUsage === "number" && props.currentUsage >= 0
      ? props.currentUsage
      : 0;
  const rawPercentage: number = (safeUsage / safeLimit) * 100;
  const clampedPercentage: number = Math.max(0, Math.min(100, rawPercentage));
  const displayPercentage: number = Math.round(rawPercentage);
  const hasExceeded: boolean = safeUsage >= safeLimit;

  // Severity-tiered theming: red when limit reached/exceeded, amber otherwise.
  const accent = hasExceeded ? RED : AMBER;
  const accentDark = hasExceeded ? RED_DARK : AMBER_DARK;
  const calloutBg = hasExceeded ? RED_BG : AMBER_BG;
  const calloutBorder = hasExceeded ? RED_BORDER : AMBER_BORDER;
  const calloutForeground = hasExceeded ? RED_FOREGROUND : AMBER_FOREGROUND;

  const headerKicker = hasExceeded
    ? `${productName} · Usage limit reached`
    : `${productName} · Usage limit warning`;
  const headline = hasExceeded
    ? `You've reached your ${props.resourceName} limit.`
    : `You're approaching your ${props.resourceName} limit.`;
  const previewText = hasExceeded
    ? `You've used ${formatUsageNumber(safeUsage)}${unit ? ` ${unit}` : ""} of ${formatUsageNumber(safeLimit)}${unit ? ` ${unit}` : ""} ${props.resourceName} on ${productName}.`
    : `You've used ${displayPercentage}% of your ${props.resourceName} on ${productName}.`;

  const usageDisplay = unit
    ? `${formatUsageNumber(safeUsage)} ${unit} of ${formatUsageNumber(safeLimit)} ${unit}`
    : `${formatUsageNumber(safeUsage)} of ${formatUsageNumber(safeLimit)}`;

  const metaRows: Array<[string, string]> = [
    ["Resource", props.resourceName],
    ["Usage", usageDisplay],
    ["Percent used", `${displayPercentage}%`],
  ];
  if (planName) {
    metaRows.push(["Current plan", planName]);
  }
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
              {headerKicker}
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
              {headline}
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
              {hasExceeded ? (
                <>
                  Your account has reached its{" "}
                  <strong>{props.resourceName}</strong> limit for the current
                  billing period on {productName}. New {props.resourceName}{" "}
                  requests may be rejected or throttled until you upgrade or the
                  period resets.
                </>
              ) : (
                <>
                  Your account has used{" "}
                  <strong>{displayPercentage}%</strong> of its{" "}
                  <strong>{props.resourceName}</strong> allowance for the
                  current billing period on {productName}. Upgrade your plan or
                  reduce usage to avoid interruptions.
                </>
              )}
            </Text>
          </Section>

          {/* Usage progress card — table-based progress bar for email-client compatibility. */}
          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <div
              style={{
                backgroundColor: PANEL_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: "10px",
                padding: "18px 18px 16px 18px",
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
                        color: MUTED_FOREGROUND,
                        fontSize: "12px",
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        padding: 0,
                        textTransform: "uppercase",
                        verticalAlign: "top",
                      }}
                    >
                      {props.resourceName}
                    </td>
                    <td
                      style={{
                        color: accentDark,
                        fontSize: "13px",
                        fontWeight: 700,
                        padding: 0,
                        textAlign: "right",
                        verticalAlign: "top",
                      }}
                    >
                      {displayPercentage}%
                    </td>
                  </tr>
                </tbody>
              </table>

              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "20px",
                  fontWeight: 700,
                  lineHeight: "1.3",
                  margin: "6px 0 12px 0",
                }}
              >
                {usageDisplay}
              </Text>

              {/* Progress bar: outer track + inner filled segment, both <table> cells
                  so Outlook/Gmail render the color blocks instead of collapsing them. */}
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
                        backgroundColor: accent,
                        borderRadius: "999px",
                        fontSize: 0,
                        height: "10px",
                        lineHeight: 0,
                        padding: 0,
                        width: `${clampedPercentage}%`,
                      }}
                    >
                      &nbsp;
                    </td>
                    <td
                      style={{
                        fontSize: 0,
                        height: "10px",
                        lineHeight: 0,
                        padding: 0,
                        width: `${100 - clampedPercentage}%`,
                      }}
                    >
                      &nbsp;
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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
                  color: calloutForeground,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                {hasExceeded ? (
                  <>
                    <strong>Action required.</strong> Upgrade your plan to
                    restore full access immediately, or wait for the billing
                    period to reset
                    {periodEndsAt ? ` on ${periodEndsAt}` : ""}.
                  </>
                ) : (
                  <>
                    <strong>Heads up.</strong> You'll hit your limit soon at
                    current usage
                    {periodEndsAt
                      ? `. Your allowance resets on ${periodEndsAt}.`
                      : "."}
                  </>
                )}
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
              {hasExceeded ? "Upgrade plan" : "Upgrade to avoid interruption"}
            </Button>
            {dashboardUrl ? (
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: "12px 0 0 0",
                }}
              >
                Prefer to review usage first?{" "}
                <a
                  href={dashboardUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  Open the usage dashboard
                </a>
                .
              </Text>
            ) : null}
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
              Questions about your usage or plan? Reach us at{" "}
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
            email because your account is approaching or has reached a usage
            limit.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

UsageLimitWarningEmail.PreviewProps = {
  recipientName: "Jane Doe",
  resourceName: "API requests",
  currentUsage: 8500,
  usageLimit: 10000,
  unit: "requests",
  periodEndsAt: "Feb 1, 2026",
  planName: "Pro",
  upgradeUrl: "https://schemavaults.com/billing/upgrade",
  dashboardUrl: "https://schemavaults.com/dashboard/usage",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies UsageLimitWarningEmailProps;
