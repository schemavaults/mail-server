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
  usageAmount: number;
  usageLimit: number;
  usageUnit?: string;
  periodLabel?: string;
  resetsAt?: string;
  currentPlan?: string;
  upgradePlanName?: string;
  upgradePlanLimit?: string;
  upgradeUrl: string;
  manageBillingUrl?: string;
  recommendations?: string[];
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand + warning + destructive tokens
// (see node_modules/@schemavaults/theme/globals.css). Email clients don't
// resolve CSS custom properties or oklch(), so token values are inlined
// as hex. AMBER approximates `--warning: oklch(82% 0.189 84.429)` and
// `--warning-foreground: oklch(41% 0.112 45.904)`; RED mirrors the
// SchemaVaults brand-red / `--destructive` token.
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
  if (!Number.isFinite(n)) return "0";
  try {
    return new Intl.NumberFormat("en-US").format(n);
  } catch {
    return String(Math.round(n));
  }
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
    typeof props.usageAmount !== "number" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'usageAmount' in props for UsageLimitWarningEmail template!",
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
  const resourceName: string =
    typeof props.resourceName === "string" && props.resourceName.length > 0
      ? props.resourceName
      : "usage";
  const usageUnit: string =
    typeof props.usageUnit === "string" && props.usageUnit.length > 0
      ? props.usageUnit
      : "";
  const periodLabel: string =
    typeof props.periodLabel === "string" && props.periodLabel.length > 0
      ? props.periodLabel
      : "this billing period";
  const currentPlan: string | undefined =
    typeof props.currentPlan === "string" && props.currentPlan.length > 0
      ? props.currentPlan
      : undefined;
  const upgradePlanName: string =
    typeof props.upgradePlanName === "string" &&
    props.upgradePlanName.length > 0
      ? props.upgradePlanName
      : "the next tier";
  const upgradePlanLimit: string | undefined =
    typeof props.upgradePlanLimit === "string" &&
    props.upgradePlanLimit.length > 0
      ? props.upgradePlanLimit
      : undefined;
  const resetsAt: string | undefined =
    typeof props.resetsAt === "string" && props.resetsAt.length > 0
      ? props.resetsAt
      : undefined;
  const manageBillingUrl: string | undefined =
    typeof props.manageBillingUrl === "string" &&
    props.manageBillingUrl.length > 0
      ? props.manageBillingUrl
      : undefined;
  const recommendations: string[] = Array.isArray(props.recommendations)
    ? props.recommendations.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      )
    : [];

  const safeUsage: number =
    typeof props.usageAmount === "number" && Number.isFinite(props.usageAmount)
      ? Math.max(0, props.usageAmount)
      : 0;
  const safeLimit: number =
    typeof props.usageLimit === "number" &&
    Number.isFinite(props.usageLimit) &&
    props.usageLimit > 0
      ? props.usageLimit
      : 1;

  const rawPercent: number = (safeUsage / safeLimit) * 100;
  const percentUsed: number = Math.max(
    0,
    Math.min(100, Math.round(rawPercent)),
  );
  const barWidthPercent: number = Math.max(4, Math.min(100, percentUsed));
  const overLimit: boolean = safeUsage >= safeLimit;
  const critical: boolean = overLimit || percentUsed >= 95;

  const ACCENT = critical ? RED : AMBER;
  const ACCENT_DARK = critical ? RED_DARK : AMBER_DARK;
  const CALLOUT_BG = critical ? RED_BG : AMBER_BG;
  const CALLOUT_BORDER = critical ? RED_BORDER : AMBER_BORDER;
  const CALLOUT_FOREGROUND = critical ? RED_FOREGROUND : AMBER_FOREGROUND;

  const usageText: string = usageUnit
    ? `${formatNumber(safeUsage)} of ${formatNumber(safeLimit)} ${usageUnit}`
    : `${formatNumber(safeUsage)} of ${formatNumber(safeLimit)}`;

  const headingText: string = overLimit
    ? `You've reached your ${resourceName} limit.`
    : critical
      ? `You're almost out of ${resourceName}.`
      : `You've used ${percentUsed}% of your ${resourceName} quota.`;

  const previewText: string = overLimit
    ? `You've used 100% of your ${resourceName} allowance for ${periodLabel} (${usageText}).`
    : `You've used ${percentUsed}% of your ${resourceName} allowance for ${periodLabel} (${usageText}).`;

  const metaRows: Array<[string, string]> = [
    ["Resource", resourceName],
    ["Usage", usageText],
    ["Percent used", `${percentUsed}%`],
  ];
  if (currentPlan) {
    metaRows.push(["Current plan", currentPlan]);
  }
  if (resetsAt) {
    metaRows.push(["Resets", resetsAt]);
  }
  if (upgradePlanLimit) {
    metaRows.push([`${upgradePlanName} plan`, upgradePlanLimit]);
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
              {productName} · Usage {overLimit ? "limit reached" : "warning"}
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
              {overLimit ? "Limit reached" : `${percentUsed}% used`}
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
              {overLimit ? (
                <>
                  Your <strong>{resourceName}</strong> usage for {periodLabel}{" "}
                  has reached your plan's limit
                  {currentPlan ? (
                    <>
                      {" "}on the <strong>{currentPlan}</strong> plan
                    </>
                  ) : null}
                  . New requests may be throttled until{" "}
                  {resetsAt ? (
                    <>
                      quota resets on <strong>{resetsAt}</strong>
                    </>
                  ) : (
                    "quota resets"
                  )}
                  , or you can upgrade to keep going without interruption.
                </>
              ) : (
                <>
                  You've used <strong>{usageText}</strong> ({percentUsed}%) of
                  your <strong>{resourceName}</strong> quota for {periodLabel}
                  {currentPlan ? (
                    <>
                      {" "}on the <strong>{currentPlan}</strong> plan
                    </>
                  ) : null}
                  . Upgrade to {upgradePlanName} to raise your limit before you
                  hit it.
                </>
              )}
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 4px 32px" }}>
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              style={{
                backgroundColor: TRACK_BG,
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
                      backgroundColor: ACCENT_DARK,
                      borderRadius: "999px 0 0 999px",
                      fontSize: "1px",
                      height: "10px",
                      lineHeight: "10px",
                      width: `${barWidthPercent}%`,
                    }}
                  >
                    &nbsp;
                  </td>
                  <td
                    style={{
                      backgroundColor: TRACK_BG,
                      fontSize: "1px",
                      height: "10px",
                      lineHeight: "10px",
                      width: `${100 - barWidthPercent}%`,
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
                      lineHeight: "1.5",
                      textAlign: "left",
                    }}
                  >
                    {formatNumber(safeUsage)}
                    {usageUnit ? ` ${usageUnit}` : ""} used
                  </td>
                  <td
                    style={{
                      color: MUTED_FOREGROUND,
                      fontSize: "12px",
                      lineHeight: "1.5",
                      textAlign: "right",
                    }}
                  >
                    {formatNumber(safeLimit)}
                    {usageUnit ? ` ${usageUnit}` : ""} limit
                  </td>
                </tr>
              </tbody>
            </table>
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

          {recommendations.length > 0 ? (
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
                  What you can do
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
                  {recommendations.map((tip) => (
                    <li key={tip} style={{ margin: "2px 0" }}>
                      {tip}
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
              Upgrade to {upgradePlanName}
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
                  Not ready to upgrade? Review usage details or change plans in
                  your{" "}
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
              Questions about limits, custom quotas, or migrating data? Reply
              to this email or reach us at{" "}
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
            email because your account is approaching a usage limit.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

UsageLimitWarningEmail.PreviewProps = {
  recipientName: "Jane Doe",
  resourceName: "API requests",
  usageAmount: 8734,
  usageLimit: 10000,
  usageUnit: "requests",
  periodLabel: "this month",
  resetsAt: "May 1, 2026 00:00 UTC",
  currentPlan: "Pro",
  upgradePlanName: "Business",
  upgradePlanLimit: "100,000 requests / month",
  upgradeUrl: "https://schemavaults.com/billing/upgrade?plan=business",
  manageBillingUrl: "https://schemavaults.com/account/billing",
  recommendations: [
    "Batch schema-validation calls where possible to cut request volume",
    "Cache validated schema fingerprints for at least 15 minutes",
    "Upgrade to Business for 10× the request quota and per-endpoint usage analytics",
  ],
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies UsageLimitWarningEmailProps;
