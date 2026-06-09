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
  accessUntil: string;
  canceledAt?: string;
  refundAmount?: string;
  reactivateUrl: string;
  manageBillingUrl?: string;
  feedbackUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties, so the token hex values are inlined here.
const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
// Slate header — neutral, confirming, not alarming (vs. brand-blue for invites or amber for warnings).
const SLATE_HEADER = "#475569";
const SLATE_HEADER_DARK = "#1e293b";

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
    typeof props.accessUntil !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'accessUntil' in props for SubscriptionCanceledEmail template!",
    );
  }
  if (
    typeof props.reactivateUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'reactivateUrl' in props for SubscriptionCanceledEmail template!",
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
  const canceledAt: string | undefined =
    typeof props.canceledAt === "string" && props.canceledAt.length > 0
      ? props.canceledAt
      : undefined;
  const refundAmount: string | undefined =
    typeof props.refundAmount === "string" && props.refundAmount.length > 0
      ? props.refundAmount
      : undefined;
  const manageBillingUrl: string | undefined =
    typeof props.manageBillingUrl === "string" &&
    props.manageBillingUrl.length > 0
      ? props.manageBillingUrl
      : undefined;
  const feedbackUrl: string | undefined =
    typeof props.feedbackUrl === "string" && props.feedbackUrl.length > 0
      ? props.feedbackUrl
      : undefined;

  const previewText = `Your ${productName} ${props.planName} subscription is canceled. Access continues through ${props.accessUntil}.`;

  const metaRows: Array<[string, string]> = [
    ["Plan", props.planName],
    ["Access until", props.accessUntil],
  ];
  if (canceledAt) {
    metaRows.push(["Canceled on", canceledAt]);
  }
  if (refundAmount) {
    metaRows.push(["Refund", refundAmount]);
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
              background: `linear-gradient(135deg, ${SLATE_HEADER} 0%, ${SLATE_HEADER_DARK} 100%)`,
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
                margin: "8px 0 0 0",
              }}
            >
              Your {props.planName} subscription is canceled.
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
              We've processed your cancellation for {productName}{" "}
              <strong>{props.planName}</strong>. You'll keep full access through{" "}
              <strong>{props.accessUntil}</strong>, after which your account
              will revert to the free tier. Your data stays put — nothing is
              deleted.
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
                Changed your mind?
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                You can reactivate any time before{" "}
                <strong>{props.accessUntil}</strong> and pick up exactly where
                you left off — no setup, no data migration.
              </Text>
            </div>
          </Section>

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={props.reactivateUrl}
              style={{
                background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_BLUE_DARK} 100%)`,
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
                href={props.reactivateUrl}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {props.reactivateUrl}
              </a>
            </Text>
          </Section>

          {manageBillingUrl ? (
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
                  Need an invoice, want to download your data, or switch to a
                  different plan? Visit your{" "}
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

          {feedbackUrl ? (
            <Section style={{ padding: "12px 32px 24px 32px" }}>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                Mind sharing why you canceled? It takes about 60 seconds and
                helps us improve.{" "}
                <a
                  href={feedbackUrl}
                  style={{
                    color: BRAND_BLUE_DARK,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Share feedback →
                </a>
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
              Didn't cancel this subscription? Reach us at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>{" "}
              and we'll sort it out right away.
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
            email because your subscription was canceled.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

SubscriptionCanceledEmail.PreviewProps = {
  recipientName: "Jane Doe",
  planName: "Pro",
  accessUntil: "Jul 14, 2026 23:59 UTC",
  canceledAt: "Jun 9, 2026 18:42 UTC",
  refundAmount: "$18.33 prorated to original payment method (3–5 business days)",
  reactivateUrl: "https://schemavaults.com/billing/reactivate",
  manageBillingUrl: "https://schemavaults.com/account/billing",
  feedbackUrl: "https://schemavaults.com/feedback/cancel-survey",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies SubscriptionCanceledEmailProps;
