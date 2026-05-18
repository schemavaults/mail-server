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

export type UsageLimitWarningStatus = "approaching" | "exceeded";

export interface UsageLimitWarningEmailProps {
  recipientName?: string;
  metricName: string;
  usedAmount: string;
  limitAmount: string;
  percentUsed: number;
  status?: UsageLimitWarningStatus;
  planName?: string;
  periodLabel?: string;
  resetsAt?: string;
  upgradeUrl: string;
  manageUsageUrl?: string;
  consequences?: string[];
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand/warning/destructive tokens
// (see node_modules/@schemavaults/theme/globals.css). Email clients don't
// resolve CSS custom properties or oklch(), so token values are inlined as hex.
// AMBER_* approximate `--warning: oklch(82% 0.189 84.429)` /
// `--warning-foreground: oklch(41% 0.112 45.904)`; RED_* mirror the
// `--schemavaults-brand-red` token and `--destructive`.
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
const RED_BG = "#fef2f2";
const RED_BORDER = "#fecaca";
const RED_FOREGROUND = "#7f1d1d";

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
  const metricName: string =
    typeof props.metricName === "string" && props.metricName.length > 0
      ? props.metricName
      : "usage";
  const usedAmount: string =
    typeof props.usedAmount === "string" && props.usedAmount.length > 0
      ? props.usedAmount
      : "0";
  const limitAmount: string =
    typeof props.limitAmount === "string" && props.limitAmount.length > 0
      ? props.limitAmount
      : "0";
  const planName: string =
    typeof props.planName === "string" && props.planName.length > 0
      ? props.planName
      : "current plan";
  const periodLabel: string =
    typeof props.periodLabel === "string" && props.periodLabel.length > 0
      ? props.periodLabel
      : "this billing period";
  const resetsAt: string | undefined =
    typeof props.resetsAt === "string" && props.resetsAt.length > 0
      ? props.resetsAt
      : undefined;
  const manageUsageUrl: string | undefined =
    typeof props.manageUsageUrl === "string" && props.manageUsageUrl.length > 0
      ? props.manageUsageUrl
      : undefined;
  const consequences: string[] = Array.isArray(props.consequences)
    ? props.consequences.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      )
    : [];

  const rawPercent: number =
    typeof props.percentUsed === "number" &&
    Number.isFinite(props.percentUsed)
      ? props.percentUsed
      : 0;
  const displayPercent: number = Math.max(0, Math.round(rawPercent));
  const barPercent: number = Math.min(100, Math.max(0, Math.round(rawPercent)));

  const isExceeded: boolean =
    props.status === "exceeded" || rawPercent >= 100;

  const ACCENT = isExceeded ? RED : AMBER;
  const ACCENT_DARK = isExceeded ? RED_DARK : AMBER_DARK;
  const CALLOUT_BG = isExceeded ? RED_BG : AMBER_BG;
  const CALLOUT_BORDER = isExceeded ? RED_BORDER : AMBER_BORDER;
  const CALLOUT_FOREGROUND = isExceeded ? RED_FOREGROUND : AMBER_FOREGROUND;

  const eyebrow: string = isExceeded
    ? `${productName} · Usage limit reached`
    : `${productName} · Usage limit warning`;
  const headingText: string = isExceeded
    ? `You've reached your ${metricName} limit.`
    : `You're approaching your ${metricName} limit.`;
  const statusPill: string = isExceeded
    ? "Limit reached"
    : `${displayPercent}% used`;

  const previewText: string = isExceeded
    ? `Hi ${greetingName} — you've used ${usedAmount} of ${limitAmount} ${metricName} on your ${productName} ${planName}. Upgrade to keep going.`
    : `Hi ${greetingName} — you've used ${usedAmount} of ${limitAmount} ${metricName} (${displayPercent}%) on your ${productName} ${planName}.`;

  const introText: string = isExceeded
    ? `You've used all of your ${metricName} allowance for ${periodLabel} on your ${productName} ${planName}. New requests against this limit may be rejected until usage resets or you upgrade.`
    : `You've used most of your ${metricName} allowance for ${periodLabel} on your ${productName} ${planName}. Upgrade now to avoid any interruption before usage resets.`;

  const metaRows: Array<[string, string]> = [
    ["Metric", metricName],
    ["Plan", planName],
    ["Used", `${usedAmount} of ${limitAmount} (${displayPercent}%)`],
  ];
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
              background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`,
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
              {statusPill}
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
                      fontSize: "13px",
                      fontWeight: 600,
                      letterSpacing: "0.02em",
                      padding: "0 0 6px 0",
                      textTransform: "uppercase",
                    }}
                  >
                    {metricName}
                  </td>
                  <td
                    style={{
                      color: ACCENT_DARK,
                      fontSize: "13px",
                      fontWeight: 700,
                      padding: "0 0 6px 0",
                      textAlign: "right",
                    }}
                  >
                    {usedAmount} / {limitAmount}
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
                  backgroundColor: ACCENT,
                  borderRadius: "999px",
                  height: "12px",
                  width: `${barPercent}%`,
                }}
              />
            </div>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "12px",
                lineHeight: "1.5",
                margin: "8px 0 0 0",
                textAlign: "right",
              }}
            >
              {displayPercent}% of your {planName} {metricName} allowance used
            </Text>
          </Section>

          <Section style={{ padding: "12px 32px 8px 32px" }}>
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

          {consequences.length > 0 ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: CALLOUT_BG,
                  border: `1px solid ${CALLOUT_BORDER}`,
                  borderLeft: `4px solid ${ACCENT_DARK}`,
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <Text
                  style={{
                    color: CALLOUT_FOREGROUND,
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    margin: "0 0 6px 0",
                    textTransform: "uppercase",
                  }}
                >
                  {isExceeded
                    ? "What happens now"
                    : "What happens when you hit the limit"}
                </Text>
                <ul
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                    paddingLeft: "20px",
                  }}
                >
                  {consequences.map((item) => (
                    <li key={item} style={{ margin: "2px 0" }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={props.upgradeUrl}
              style={{
                backgroundColor: ACCENT_DARK,
                borderRadius: "8px",
                color: "#ffffff",
                display: "inline-block",
                fontSize: "15px",
                fontWeight: 600,
                padding: "12px 22px",
                textDecoration: "none",
              }}
            >
              {isExceeded ? "Upgrade to restore access" : "Upgrade your plan"}
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
                style={{ color: ACCENT_DARK, textDecoration: "none" }}
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
                  Want to inspect your usage breakdown or set up alerts? Open
                  your{" "}
                  <a
                    href={manageUsageUrl}
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
              Questions about plan limits, overage pricing, or raising a quota?
              Reply to this email or reach us at{" "}
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
            usage limit.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

UsageLimitWarningEmail.PreviewProps = {
  recipientName: "Jane Doe",
  metricName: "API requests",
  usedAmount: "8,200",
  limitAmount: "10,000",
  percentUsed: 82,
  status: "approaching",
  planName: "Pro",
  periodLabel: "May 2026",
  resetsAt: "Jun 1, 2026 00:00 UTC",
  upgradeUrl: "https://schemavaults.com/billing/upgrade?reason=usage",
  manageUsageUrl: "https://schemavaults.com/account/usage",
  consequences: [
    "Additional API requests beyond the limit are rejected with HTTP 429",
    "Scheduled schema-sync jobs pause until usage resets",
    "Webhook delivery retries are throttled",
  ],
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies UsageLimitWarningEmailProps;
