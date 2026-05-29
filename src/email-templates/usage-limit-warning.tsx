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

// Brand tokens from @schemavaults/theme, inlined as hex because email clients
// don't resolve CSS custom properties.
const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
const BRAND_RED = "#dc2626";
const BRAND_RED_LIGHT = "#f87171";
// The theme has no dedicated "warning" token, so amber is used for the
// approaching-limit tier as the closest semantic accent.
const WARNING_AMBER = "#f59e0b";
const WARNING_AMBER_LIGHT = "#fbbf24";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const TRACK_BG = "#eef2f7";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";

export interface UsageLimitWarningEmailProps {
  resourceName: string;
  usedAmount: number;
  limitAmount: number;
  recipientName?: string;
  planName?: string;
  unit?: string;
  percentUsed?: number;
  periodResetDate?: string;
  upgradeUrl?: string;
  supportEmail?: string;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export default function UsageLimitWarningEmail(
  props: UsageLimitWarningEmailProps,
): ReactElement {
  const recipientName =
    typeof props.recipientName === "string" && props.recipientName.length > 0
      ? props.recipientName
      : "there";
  const resourceName =
    typeof props.resourceName === "string" && props.resourceName.length > 0
      ? props.resourceName
      : "usage";
  const planName =
    typeof props.planName === "string" && props.planName.length > 0
      ? props.planName
      : null;
  const unit =
    typeof props.unit === "string" && props.unit.length > 0 ? props.unit : "";
  const upgradeUrl =
    typeof props.upgradeUrl === "string" && props.upgradeUrl.length > 0
      ? props.upgradeUrl
      : "https://schemavaults.com/account/billing";
  const supportEmail =
    typeof props.supportEmail === "string" && props.supportEmail.length > 0
      ? props.supportEmail
      : "support@schemavaults.com";
  const periodResetDate =
    typeof props.periodResetDate === "string" &&
    props.periodResetDate.length > 0
      ? props.periodResetDate
      : null;

  const usedAmount =
    typeof props.usedAmount === "number" && Number.isFinite(props.usedAmount)
      ? props.usedAmount
      : 0;
  const limitAmount =
    typeof props.limitAmount === "number" &&
    Number.isFinite(props.limitAmount) &&
    props.limitAmount > 0
      ? props.limitAmount
      : 0;
  const rawPercent =
    typeof props.percentUsed === "number" && Number.isFinite(props.percentUsed)
      ? props.percentUsed
      : limitAmount > 0
        ? (usedAmount / limitAmount) * 100
        : 0;
  const percent = Math.max(0, Math.round(rawPercent));
  const barWidth = Math.min(100, percent);

  const atLimit = percent >= 100;
  const approaching = percent >= 80 && percent < 100;
  const barColor = atLimit
    ? BRAND_RED
    : approaching
      ? WARNING_AMBER
      : BRAND_BLUE_DARK;
  const headerGradient = atLimit
    ? `linear-gradient(135deg, ${BRAND_RED_LIGHT} 0%, ${BRAND_RED} 100%)`
    : approaching
      ? `linear-gradient(135deg, ${WARNING_AMBER_LIGHT} 0%, ${WARNING_AMBER} 100%)`
      : `linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_BLUE_DARK} 100%)`;

  const headline = atLimit
    ? `You've reached your ${resourceName} limit`
    : `You're approaching your ${resourceName} limit`;
  const previewText = atLimit
    ? `Your ${resourceName} limit has been reached (${percent}% used)`
    : `You've used ${percent}% of your ${resourceName} this period`;

  const usedLabel = unit
    ? `${formatNumber(usedAmount)} ${unit}`
    : formatNumber(usedAmount);
  const limitLabel = unit
    ? `${formatNumber(limitAmount)} ${unit}`
    : formatNumber(limitAmount);

  const bodyIntro = atLimit
    ? `You've used all of the ${resourceName} included in${
        planName ? ` your ${planName} plan` : " your current plan"
      }. New requests may be paused or rate-limited until your usage resets${
        periodResetDate ? ` on ${periodResetDate}` : ""
      } or you upgrade your plan.`
    : `You've used most of the ${resourceName} included in${
        planName ? ` your ${planName} plan` : " your current plan"
      }. To avoid any interruption, consider upgrading before you hit the cap${
        periodResetDate ? `, or wait for your usage to reset on ${periodResetDate}` : ""
      }.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body
        style={{
          backgroundColor: PAGE_BG,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "24px 0 48px",
          }}
        >
          <Section
            style={{
              background: headerGradient,
              borderRadius: "12px 12px 0 0",
              padding: "40px 32px",
            }}
          >
            <Text
              style={{
                color: CARD_BG,
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                margin: "0 0 8px",
                opacity: 0.9,
              }}
            >
              {atLimit ? "Limit reached" : "Usage warning"}
            </Text>
            <Heading
              as="h1"
              style={{
                color: CARD_BG,
                fontSize: "26px",
                fontWeight: 700,
                lineHeight: "32px",
                margin: 0,
              }}
            >
              {headline}
            </Heading>
          </Section>

          <Section
            style={{
              backgroundColor: CARD_BG,
              padding: "32px 32px 8px",
            }}
          >
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "16px",
                lineHeight: "26px",
                margin: "0 0 16px",
              }}
            >
              {`Hi ${recipientName},`}
            </Text>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "16px",
                lineHeight: "26px",
                margin: "0 0 24px",
              }}
            >
              {bodyIntro}
            </Text>

            <Section
              style={{
                backgroundColor: PAGE_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: "12px",
                padding: "20px 24px",
              }}
            >
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  margin: "0 0 6px",
                }}
              >
                {resourceName}
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "22px",
                  fontWeight: 700,
                  margin: "0 0 14px",
                }}
              >
                {`${usedLabel} of ${limitLabel}`}
                <span
                  style={{
                    color: barColor,
                    fontSize: "16px",
                    fontWeight: 600,
                    marginLeft: "8px",
                  }}
                >
                  {`(${percent}%)`}
                </span>
              </Text>

              <div
                style={{
                  width: "100%",
                  backgroundColor: TRACK_BG,
                  borderRadius: "999px",
                  height: "14px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: barColor,
                    height: "14px",
                    borderRadius: "999px",
                  }}
                />
              </div>

              {periodResetDate ? (
                <Text
                  style={{
                    color: MUTED_FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "20px",
                    margin: "12px 0 0",
                  }}
                >
                  {`Usage resets on ${periodResetDate}.`}
                </Text>
              ) : null}
            </Section>

            <Section style={{ textAlign: "center", margin: "28px 0 8px" }}>
              <Button
                href={upgradeUrl}
                style={{
                  backgroundColor: atLimit ? BRAND_RED : BRAND_BLUE_DARK,
                  borderRadius: "8px",
                  color: CARD_BG,
                  fontSize: "16px",
                  fontWeight: 600,
                  padding: "14px 28px",
                  textDecoration: "none",
                }}
              >
                {atLimit ? "Upgrade to restore access" : "Upgrade your plan"}
              </Button>
            </Section>
          </Section>

          <Hr style={{ borderColor: BORDER, margin: "0" }} />
          <Section
            style={{
              backgroundColor: CARD_BG,
              borderRadius: "0 0 12px 12px",
              padding: "24px 32px 32px",
            }}
          >
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "14px",
                lineHeight: "22px",
                margin: 0,
              }}
            >
              {"Need a custom limit or have questions about your usage? Reach us at "}
              {supportEmail}
              {"."}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

UsageLimitWarningEmail.PreviewProps = {
  recipientName: "Jane Doe",
  resourceName: "API requests",
  planName: "Starter",
  unit: "requests",
  usedAmount: 9200,
  limitAmount: 10000,
  percentUsed: 92,
  periodResetDate: "June 1, 2026",
  upgradeUrl: "https://schemavaults.com/account/billing",
  supportEmail: "support@schemavaults.com",
} satisfies UsageLimitWarningEmailProps;
