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

export interface TrialEndingEmailProps {
  recipientName?: string;
  daysRemaining: number;
  trialEndsAt: string;
  currentPlan?: string;
  upgradePlanName?: string;
  upgradePlanPrice?: string;
  upgradeUrl: string;
  manageBillingUrl?: string;
  featuresAtRisk?: string[];
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand and warning tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties or oklch(), so the token values are inlined as hex.
// AMBER values approximate `--warning: oklch(82% 0.189 84.429)` and `--warning-foreground: oklch(41% 0.112 45.904)`.
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

export default function TrialEndingEmail(
  props: TrialEndingEmailProps,
): ReactElement {
  if (
    typeof props.daysRemaining !== "number" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'daysRemaining' in props for TrialEndingEmail template!",
    );
  }
  if (
    typeof props.trialEndsAt !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'trialEndsAt' in props for TrialEndingEmail template!",
    );
  }
  if (
    typeof props.upgradeUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'upgradeUrl' in props for TrialEndingEmail template!",
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
      : "free trial";
  const upgradePlanName: string =
    typeof props.upgradePlanName === "string" &&
    props.upgradePlanName.length > 0
      ? props.upgradePlanName
      : "Pro";
  const upgradePlanPrice: string | undefined =
    typeof props.upgradePlanPrice === "string" &&
    props.upgradePlanPrice.length > 0
      ? props.upgradePlanPrice
      : undefined;
  const manageBillingUrl: string | undefined =
    typeof props.manageBillingUrl === "string" &&
    props.manageBillingUrl.length > 0
      ? props.manageBillingUrl
      : undefined;
  const featuresAtRisk: string[] = Array.isArray(props.featuresAtRisk)
    ? props.featuresAtRisk.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      )
    : [];

  const safeDaysRemaining: number =
    typeof props.daysRemaining === "number" &&
    Number.isFinite(props.daysRemaining)
      ? Math.max(0, Math.floor(props.daysRemaining))
      : 0;

  const countdownLabel: string =
    safeDaysRemaining === 0
      ? "ends today"
      : safeDaysRemaining === 1
        ? "1 day left"
        : `${safeDaysRemaining} days left`;

  const headingText: string =
    safeDaysRemaining === 0
      ? `Your ${productName} trial ends today.`
      : safeDaysRemaining === 1
        ? `Your ${productName} trial ends tomorrow.`
        : `Your ${productName} trial ends in ${safeDaysRemaining} days.`;

  const previewText: string =
    safeDaysRemaining === 0
      ? `Hi ${greetingName} — your ${productName} ${currentPlan} ends today (${props.trialEndsAt}). Upgrade to keep ${upgradePlanName} features.`
      : `Hi ${greetingName} — your ${productName} ${currentPlan} ends in ${safeDaysRemaining} day${
          safeDaysRemaining === 1 ? "" : "s"
        } (${props.trialEndsAt}). Upgrade to keep ${upgradePlanName} features.`;

  const metaRows: Array<[string, string]> = [
    ["Current plan", currentPlan],
    ["Trial ends", props.trialEndsAt],
  ];
  if (upgradePlanPrice) {
    metaRows.push([`${upgradePlanName} plan`, upgradePlanPrice]);
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
              background: `linear-gradient(135deg, ${AMBER} 0%, ${AMBER_DARK} 100%)`,
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
              {productName} · Trial reminder
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
              {countdownLabel}
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
              Your {productName} {currentPlan} is ending on{" "}
              <strong>{props.trialEndsAt}</strong>. Upgrade to{" "}
              <strong>{upgradePlanName}</strong> to keep using everything you've
              built without interruption.
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

          {featuresAtRisk.length > 0 ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: AMBER_BG,
                  border: `1px solid ${AMBER_BORDER}`,
                  borderLeft: `4px solid ${AMBER_DARK}`,
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <Text
                  style={{
                    color: AMBER_FOREGROUND,
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    margin: "0 0 6px 0",
                    textTransform: "uppercase",
                  }}
                >
                  What you'll lose without {upgradePlanName}
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
                  {featuresAtRisk.map((feature) => (
                    <li key={feature} style={{ margin: "2px 0" }}>
                      {feature}
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
                backgroundColor: AMBER_DARK,
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
                style={{ color: AMBER_DARK, textDecoration: "none" }}
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
                  Need to change plans, update billing details, or cancel? Visit
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
              Questions about pricing, plan limits, or migrating data? Reply to
              this email or reach us at{" "}
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
            email because your trial is about to end.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

TrialEndingEmail.PreviewProps = {
  recipientName: "Jane Doe",
  daysRemaining: 3,
  trialEndsAt: "May 2, 2026 23:59 UTC",
  currentPlan: "Pro trial",
  upgradePlanName: "Pro",
  upgradePlanPrice: "$29 / month",
  upgradeUrl: "https://schemavaults.com/billing/upgrade?plan=pro",
  manageBillingUrl: "https://schemavaults.com/account/billing",
  featuresAtRisk: [
    "Private vaults beyond the free-tier limit",
    "Schema-evolution diff history older than 7 days",
    "Team seats above 3 collaborators",
    "API request quota above 1,000 requests/day",
  ],
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies TrialEndingEmailProps;
