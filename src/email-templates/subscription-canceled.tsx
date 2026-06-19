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

export interface SubscriptionCanceledEmailProps {
  recipientName?: string;
  planName: string;
  cancellationDate: string;
  accessEndsAt: string;
  finalChargeAmount?: string;
  cancellationReason?: string;
  reactivateUrl?: string;
  feedbackUrl?: string;
  manageBillingUrl?: string;
  retainedFeatures?: string[];
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand and slate tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties or oklch(), so the token values are inlined as hex.
// SLATE values approximate the muted/foreground tokens; calmer than the brand-blue header used by
// positive transactional flows because cancellation is a neutral, factual confirmation — not a "problem".
const BRAND_BLUE_DARK = "#2563eb";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const SLATE = "#475569";
const SLATE_DARK = "#1e293b";

export default function SubscriptionCanceledEmail(
  props: SubscriptionCanceledEmailProps,
): ReactElement {
  if (
    typeof props.planName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'planName' in props for SubscriptionCanceledEmail template!",
    );
  }
  if (
    typeof props.cancellationDate !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'cancellationDate' in props for SubscriptionCanceledEmail template!",
    );
  }
  if (
    typeof props.accessEndsAt !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'accessEndsAt' in props for SubscriptionCanceledEmail template!",
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
  const finalChargeAmount: string | undefined =
    typeof props.finalChargeAmount === "string" &&
    props.finalChargeAmount.length > 0
      ? props.finalChargeAmount
      : undefined;
  const cancellationReason: string | undefined =
    typeof props.cancellationReason === "string" &&
    props.cancellationReason.length > 0
      ? props.cancellationReason
      : undefined;
  const reactivateUrl: string | undefined =
    typeof props.reactivateUrl === "string" && props.reactivateUrl.length > 0
      ? props.reactivateUrl
      : undefined;
  const feedbackUrl: string | undefined =
    typeof props.feedbackUrl === "string" && props.feedbackUrl.length > 0
      ? props.feedbackUrl
      : undefined;
  const manageBillingUrl: string | undefined =
    typeof props.manageBillingUrl === "string" &&
    props.manageBillingUrl.length > 0
      ? props.manageBillingUrl
      : undefined;
  const retainedFeatures: string[] = Array.isArray(props.retainedFeatures)
    ? props.retainedFeatures.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      )
    : [];

  const previewText = `Your ${productName} ${props.planName} subscription has been canceled. Access continues until ${props.accessEndsAt}.`;

  const metaRows: Array<[string, string]> = [
    ["Plan", props.planName],
    ["Canceled on", props.cancellationDate],
    ["Access ends", props.accessEndsAt],
  ];
  if (finalChargeAmount) {
    metaRows.push(["Final charge", finalChargeAmount]);
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
              background: `linear-gradient(135deg, ${SLATE} 0%, ${SLATE_DARK} 100%)`,
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
              {productName} · Subscription canceled
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
              Your {props.planName} subscription has been canceled.
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
              Access until {props.accessEndsAt}
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
              We've received your request to cancel your{" "}
              <strong>{props.planName}</strong> subscription on {productName}.
              You'll continue to have full access until{" "}
              <strong>{props.accessEndsAt}</strong>, after which your account
              will switch to the free tier — your data and projects will remain
              intact.
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

          {cancellationReason ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
                  borderLeft: `4px solid ${SLATE}`,
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
                  Reason you shared
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  {cancellationReason}
                </Text>
              </div>
            </Section>
          ) : null}

          {retainedFeatures.length > 0 ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
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
                  Still available on the free tier
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
                  {retainedFeatures.map((feature) => (
                    <li key={feature} style={{ margin: "2px 0" }}>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </Section>
          ) : null}

          {reactivateUrl ? (
            <Section style={{ padding: "20px 32px 8px 32px" }}>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: "0 0 12px 0",
                }}
              >
                Changed your mind? You can reactivate your subscription any time
                before {props.accessEndsAt} and pick up right where you left
                off.
              </Text>
              <Button
                href={reactivateUrl}
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
                Reactivate {props.planName}
              </Button>
            </Section>
          ) : null}

          {reactivateUrl ? (
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
                  href={reactivateUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  {reactivateUrl}
                </a>
              </Text>
            </Section>
          ) : null}

          {feedbackUrl ? (
            <Section style={{ padding: "12px 32px 8px 32px" }}>
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
                  We'd love to know what went wrong.{" "}
                  <a
                    href={feedbackUrl}
                    style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                  >
                    Share two minutes of feedback
                  </a>{" "}
                  — it goes straight to the product team and shapes what we
                  build next.
                </Text>
              </div>
            </Section>
          ) : null}

          {manageBillingUrl ? (
            <Section style={{ padding: "12px 32px 24px 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                Need to download invoices or update payment details? Visit your{" "}
                <a
                  href={manageBillingUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  billing settings
                </a>
                .
              </Text>
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
              Didn't request this cancellation? Reply to this email immediately
              or reach us at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>{" "}
              and we'll restore your subscription right away.
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
            email because a subscription change was made on your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

SubscriptionCanceledEmail.PreviewProps = {
  recipientName: "Jane Doe",
  planName: "Pro",
  cancellationDate: "Jun 19, 2026",
  accessEndsAt: "Jul 14, 2026 23:59 UTC",
  finalChargeAmount: "$29.00 USD",
  cancellationReason:
    "Switching to a self-hosted setup for an internal compliance pilot.",
  reactivateUrl: "https://schemavaults.com/billing/reactivate?plan=pro",
  feedbackUrl: "https://schemavaults.com/feedback/cancellation",
  manageBillingUrl: "https://schemavaults.com/account/billing",
  retainedFeatures: [
    "All public vaults and schemas you've authored",
    "Read-only access to private vaults below the free-tier limit",
    "Schema-evolution diff history for the last 7 days",
    "Up to 1,000 API requests per day",
  ],
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies SubscriptionCanceledEmailProps;
