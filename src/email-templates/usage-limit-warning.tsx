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
import { getEmailBrand } from "./brand";

export interface UsageLimitWarningEmailProps {
  recipientName?: string;
  metricLabel: string;
  used: number;
  limit: number;
  unit?: string;
  planName?: string;
  resetAt?: string;
  upgradeUrl: string;
  manageBillingUrl?: string;
  viewUsageUrl?: string;
  additionalMetrics?: Array<{
    label: string;
    used: number;
    limit: number;
    unit?: string;
  }>;
  productName?: string;
  supportEmail?: string;
}

// Neutral palette. Email clients don't resolve CSS custom properties or
// oklch(), so concrete hex values are inlined here. The severity palette
// below mirrors the theme's `--warning` (amber) and `--destructive` (red)
// semantic tokens; the brand accent still comes from the configured brand
// inside the component.
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const TRACK_BG = "#e2e8f0";

// Amber — mirrors theme `--warning: oklch(82% 0.189 84.429)`.
const AMBER = "#f59e0b";
const AMBER_DARK = "#b45309";
const AMBER_BG = "#fffbeb";
const AMBER_BORDER = "#fde68a";
const AMBER_FOREGROUND = "#78350f";

// Red — mirrors theme `--destructive: 0 84.2% 60.2%` (#dc2626 family).
const RED = "#ef4444";
const RED_DARK = "#b91c1c";
const RED_BG = "#fef2f2";
const RED_BORDER = "#fecaca";
const RED_FOREGROUND = "#7f1d1d";

type Severity = "approaching" | "reached" | "exceeded";

interface SeverityPalette {
  gradientStart: string;
  gradientEnd: string;
  fill: string;
  chipBg: string;
  chipBorder: string;
  chipFg: string;
  chipLabel: string;
}

function severityFor(percent: number): Severity {
  if (percent >= 100) {
    return "exceeded";
  }
  if (percent >= 90) {
    return "reached";
  }
  return "approaching";
}

function paletteFor(severity: Severity): SeverityPalette {
  if (severity === "exceeded") {
    return {
      gradientStart: RED,
      gradientEnd: RED_DARK,
      fill: RED_DARK,
      chipBg: RED_BG,
      chipBorder: RED_BORDER,
      chipFg: RED_FOREGROUND,
      chipLabel: "Limit exceeded",
    };
  }
  if (severity === "reached") {
    return {
      gradientStart: RED,
      gradientEnd: AMBER_DARK,
      fill: RED,
      chipBg: RED_BG,
      chipBorder: RED_BORDER,
      chipFg: RED_FOREGROUND,
      chipLabel: "Limit reached",
    };
  }
  return {
    gradientStart: AMBER,
    gradientEnd: AMBER_DARK,
    fill: AMBER_DARK,
    chipBg: AMBER_BG,
    chipBorder: AMBER_BORDER,
    chipFg: AMBER_FOREGROUND,
    chipLabel: "Approaching limit",
  };
}

function formatQuantity(value: number, unit: string | undefined): string {
  const safe = Number.isFinite(value) ? value : 0;
  const rounded = Number.isInteger(safe) ? safe : Math.round(safe * 100) / 100;
  const withCommas = rounded.toLocaleString("en-US");
  return unit && unit.length > 0 ? `${withCommas} ${unit}` : withCommas;
}

function percentFor(used: number, limit: number): number {
  if (!Number.isFinite(used) || !Number.isFinite(limit) || limit <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(999, Math.round((used / limit) * 100)));
}

export default function UsageLimitWarningEmail(
  props: UsageLimitWarningEmailProps,
): ReactElement {
  if (
    typeof props.metricLabel !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'metricLabel' in props for UsageLimitWarningEmail template!",
    );
  }
  if (
    typeof props.used !== "number" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'used' in props for UsageLimitWarningEmail template!",
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

  const brand = getEmailBrand();
  const BRAND_BLUE_DARK = brand.colors.accentDark;

  const productName: string =
    typeof props.productName === "string" && props.productName.length > 0
      ? props.productName
      : brand.productName;
  const supportEmail: string =
    typeof props.supportEmail === "string" && props.supportEmail.length > 0
      ? props.supportEmail
      : brand.supportEmail;
  const greetingName: string =
    typeof props.recipientName === "string" && props.recipientName.length > 0
      ? props.recipientName
      : "there";
  const metricLabel: string =
    typeof props.metricLabel === "string" && props.metricLabel.length > 0
      ? props.metricLabel
      : "usage";
  const unit: string | undefined =
    typeof props.unit === "string" && props.unit.length > 0
      ? props.unit
      : undefined;
  const planName: string | undefined =
    typeof props.planName === "string" && props.planName.length > 0
      ? props.planName
      : undefined;
  const resetAt: string | undefined =
    typeof props.resetAt === "string" && props.resetAt.length > 0
      ? props.resetAt
      : undefined;
  const manageBillingUrl: string | undefined =
    typeof props.manageBillingUrl === "string" &&
    props.manageBillingUrl.length > 0
      ? props.manageBillingUrl
      : undefined;
  const viewUsageUrl: string | undefined =
    typeof props.viewUsageUrl === "string" && props.viewUsageUrl.length > 0
      ? props.viewUsageUrl
      : undefined;

  const additionalMetrics = Array.isArray(props.additionalMetrics)
    ? props.additionalMetrics.filter(
        (
          m,
        ): m is {
          label: string;
          used: number;
          limit: number;
          unit?: string;
        } =>
          typeof m === "object" &&
          m !== null &&
          typeof (m as { label: unknown }).label === "string" &&
          ((m as { label: string }).label as string).length > 0 &&
          typeof (m as { used: unknown }).used === "number" &&
          Number.isFinite((m as { used: number }).used) &&
          typeof (m as { limit: unknown }).limit === "number" &&
          Number.isFinite((m as { limit: number }).limit),
      )
    : [];

  const used =
    typeof props.used === "number" && Number.isFinite(props.used)
      ? props.used
      : 0;
  const limit =
    typeof props.limit === "number" && Number.isFinite(props.limit)
      ? props.limit
      : 0;
  const percent = percentFor(used, limit);
  const displayPercent = Math.min(100, percent);
  const severity = severityFor(percent);
  const palette = paletteFor(severity);

  const remaining = Math.max(0, limit - used);
  const overage = Math.max(0, used - limit);

  const headingText: string =
    severity === "exceeded"
      ? `You've exceeded your ${metricLabel} limit.`
      : severity === "reached"
        ? `You've reached your ${metricLabel} limit.`
        : `You're approaching your ${metricLabel} limit.`;

  const previewText: string =
    severity === "exceeded"
      ? `Hi ${greetingName} — ${productName} ${metricLabel} usage is ${percent}% of your limit (${formatQuantity(
          used,
          unit,
        )} / ${formatQuantity(limit, unit)}).`
      : `Hi ${greetingName} — ${productName} ${metricLabel} usage is ${percent}% of your limit (${formatQuantity(
          used,
          unit,
        )} / ${formatQuantity(limit, unit)}). Upgrade to raise it.`;

  const metaRows: Array<[string, string]> = [
    ["Metric", metricLabel],
    ["Used", formatQuantity(used, unit)],
    ["Limit", formatQuantity(limit, unit)],
  ];
  if (severity === "exceeded") {
    metaRows.push(["Overage", formatQuantity(overage, unit)]);
  } else {
    metaRows.push(["Remaining", formatQuantity(remaining, unit)]);
  }
  if (planName) {
    metaRows.push(["Current plan", planName]);
  }
  if (resetAt) {
    metaRows.push(["Resets on", resetAt]);
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
              background: `linear-gradient(135deg, ${palette.gradientStart} 0%, ${palette.gradientEnd} 100%)`,
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
              {productName} · Usage alert
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
              {palette.chipLabel} · {percent}%
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
              <strong>{formatQuantity(used, unit)}</strong> of your{" "}
              <strong>{formatQuantity(limit, unit)}</strong> {metricLabel}{" "}
              allowance
              {planName ? (
                <>
                  {" "}
                  on the <strong>{planName}</strong> plan
                </>
              ) : null}
              {resetAt ? (
                <>
                  {" "}
                  before it resets on <strong>{resetAt}</strong>
                </>
              ) : null}
              .
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 0 32px" }}>
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
                    {metricLabel}
                  </td>
                  <td
                    style={{
                      color: palette.fill,
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "0 0 6px 0",
                      textAlign: "right",
                    }}
                  >
                    {percent}%
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
                width: "100%",
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      backgroundColor: palette.fill,
                      borderRadius: "999px",
                      height: "10px",
                      lineHeight: "10px",
                      padding: 0,
                      width: `${displayPercent}%`,
                    }}
                  >
                    &nbsp;
                  </td>
                  <td
                    style={{
                      padding: 0,
                      width: `${100 - displayPercent}%`,
                    }}
                  >
                    &nbsp;
                  </td>
                </tr>
              </tbody>
            </table>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "12px",
                lineHeight: "1.55",
                margin: "6px 0 0 0",
              }}
            >
              {formatQuantity(used, unit)} of {formatQuantity(limit, unit)} used
              {severity === "exceeded" ? (
                <>
                  {" "}
                  · <strong style={{ color: palette.fill }}>
                    {formatQuantity(overage, unit)} over
                  </strong>
                </>
              ) : (
                <>
                  {" "}
                  · {formatQuantity(remaining, unit)} remaining
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

          {severity === "exceeded" ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: RED_BG,
                  border: `1px solid ${RED_BORDER}`,
                  borderLeft: `4px solid ${RED_DARK}`,
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <Text
                  style={{
                    color: RED_FOREGROUND,
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    margin: "0 0 6px 0",
                    textTransform: "uppercase",
                  }}
                >
                  What happens next
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  New {metricLabel} requests may be throttled or rejected until
                  your usage resets
                  {resetAt ? (
                    <>
                      {" "}
                      on <strong>{resetAt}</strong>
                    </>
                  ) : null}
                  , or until you raise your limit by upgrading your plan.
                </Text>
              </div>
            </Section>
          ) : null}

          {additionalMetrics.length > 0 ? (
            <Section style={{ padding: "20px 32px 0 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 10px 0",
                  textTransform: "uppercase",
                }}
              >
                Other metrics this period
              </Text>
              {additionalMetrics.map((metric) => {
                const p = percentFor(metric.used, metric.limit);
                const dp = Math.min(100, p);
                const sev = severityFor(p);
                const pal = paletteFor(sev);
                const metricUnit =
                  typeof metric.unit === "string" && metric.unit.length > 0
                    ? metric.unit
                    : undefined;
                return (
                  <div key={metric.label} style={{ margin: "0 0 12px 0" }}>
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
                              fontSize: "13px",
                              fontWeight: 500,
                              padding: "0 0 4px 0",
                            }}
                          >
                            {metric.label}
                          </td>
                          <td
                            style={{
                              color: MUTED_FOREGROUND,
                              fontSize: "12px",
                              padding: "0 0 4px 0",
                              textAlign: "right",
                            }}
                          >
                            {formatQuantity(metric.used, metricUnit)} /{" "}
                            {formatQuantity(metric.limit, metricUnit)} ·{" "}
                            <span style={{ color: pal.fill, fontWeight: 600 }}>
                              {p}%
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
                        height: "6px",
                        width: "100%",
                      }}
                    >
                      <tbody>
                        <tr>
                          <td
                            style={{
                              backgroundColor: pal.fill,
                              borderRadius: "999px",
                              height: "6px",
                              lineHeight: "6px",
                              padding: 0,
                              width: `${dp}%`,
                            }}
                          >
                            &nbsp;
                          </td>
                          <td
                            style={{
                              padding: 0,
                              width: `${100 - dp}%`,
                            }}
                          >
                            &nbsp;
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={props.upgradeUrl}
              style={{
                backgroundColor: palette.fill,
                borderRadius: "8px",
                color: "#ffffff",
                display: "inline-block",
                fontSize: "15px",
                fontWeight: 600,
                padding: "12px 22px",
                textDecoration: "none",
              }}
            >
              Upgrade plan
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
                style={{ color: palette.fill, textDecoration: "none" }}
              >
                {props.upgradeUrl}
              </a>
            </Text>
          </Section>

          {viewUsageUrl || manageBillingUrl ? (
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
                  {viewUsageUrl ? (
                    <>
                      See a detailed breakdown in your{" "}
                      <a
                        href={viewUsageUrl}
                        style={{
                          color: BRAND_BLUE_DARK,
                          textDecoration: "none",
                        }}
                      >
                        usage dashboard
                      </a>
                      .
                    </>
                  ) : null}
                  {viewUsageUrl && manageBillingUrl ? " " : null}
                  {manageBillingUrl ? (
                    <>
                      Manage plans, seats, and payment in your{" "}
                      <a
                        href={manageBillingUrl}
                        style={{
                          color: BRAND_BLUE_DARK,
                          textDecoration: "none",
                        }}
                      >
                        billing settings
                      </a>
                      .
                    </>
                  ) : null}
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
              Questions about limits, overage pricing, or the right plan for
              your workload? Reply to this email or reach us at{" "}
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
            limit.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

UsageLimitWarningEmail.PreviewProps = {
  recipientName: "Jane Doe",
  metricLabel: "API requests",
  used: 87500,
  limit: 100000,
  unit: "requests",
  planName: "Starter",
  resetAt: "August 1, 2026",
  upgradeUrl: "https://example.com/billing/upgrade?plan=pro",
  manageBillingUrl: "https://example.com/account/billing",
  viewUsageUrl: "https://example.com/account/usage",
  additionalMetrics: [
    {
      label: "Storage",
      used: 6.4,
      limit: 10,
      unit: "GB",
    },
    {
      label: "Seats",
      used: 3,
      limit: 5,
    },
    {
      label: "Outbound emails",
      used: 42000,
      limit: 50000,
      unit: "sends",
    },
  ],
} satisfies UsageLimitWarningEmailProps;
