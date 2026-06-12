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

export interface SubscriptionCancelledEmailProps {
  recipientName?: string;
  planName: string;
  cancelledAt: string;
  accessEndsAt: string;
  refundAmount?: string;
  dataRetentionDays?: number;
  reactivateUrl: string;
  feedbackUrl?: string;
  manageBillingUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties, so the token values are inlined as hex.
const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
// Neutral slate header to communicate a calmer, post-cancellation tone
// (distinct from the brand-blue gradient used in active-state emails like
// team-invitation and welcome).
const SLATE_DARK = "#0f172a";
const SLATE_MID = "#334155";

export default function SubscriptionCancelledEmail(
  props: SubscriptionCancelledEmailProps,
): ReactElement {
  if (
    typeof props.planName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'planName' in props for SubscriptionCancelledEmail template!",
    );
  }
  if (
    typeof props.cancelledAt !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'cancelledAt' in props for SubscriptionCancelledEmail template!",
    );
  }
  if (
    typeof props.accessEndsAt !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'accessEndsAt' in props for SubscriptionCancelledEmail template!",
    );
  }
  if (
    typeof props.reactivateUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'reactivateUrl' in props for SubscriptionCancelledEmail template!",
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
  const refundAmount: string | undefined =
    typeof props.refundAmount === "string" && props.refundAmount.length > 0
      ? props.refundAmount
      : undefined;
  const dataRetentionDays: number | undefined =
    typeof props.dataRetentionDays === "number" && props.dataRetentionDays > 0
      ? props.dataRetentionDays
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

  const previewText = `Your ${productName} ${props.planName} subscription is cancelled — access continues until ${props.accessEndsAt}.`;

  const metaRows: Array<[string, string]> = [
    ["Plan", props.planName],
    ["Cancelled on", props.cancelledAt],
    ["Access ends", props.accessEndsAt],
  ];
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
              background: `linear-gradient(135deg, ${SLATE_DARK} 0%, ${SLATE_MID} 100%)`,
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
              {productName} · Subscription cancelled
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
              Your subscription has been cancelled.
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
              We've cancelled your <strong>{props.planName}</strong> subscription
              as requested. You'll keep full access to {productName} until{" "}
              <strong>{props.accessEndsAt}</strong> — after that, your account
              will switch to read-only and we won't bill you again.
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

          {dataRetentionDays ? (
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
                  Your data
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  We'll keep your schemas, vaults, and history for{" "}
                  <strong>{dataRetentionDays} days</strong> after{" "}
                  {props.accessEndsAt}. Reactivate any time before then and pick
                  up exactly where you left off.
                </Text>
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={props.reactivateUrl}
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
              Reactivate subscription
            </Button>
            {manageBillingUrl ? (
              <span
                style={{
                  color: MUTED_FOREGROUND,
                  display: "inline-block",
                  fontSize: "14px",
                  marginLeft: "12px",
                }}
              >
                or{" "}
                <a
                  href={manageBillingUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  manage billing
                </a>
              </span>
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
                href={props.reactivateUrl}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {props.reactivateUrl}
              </a>
            </Text>
          </Section>

          {feedbackUrl ? (
            <>
              <Hr style={{ borderColor: BORDER, margin: "0 32px" }} />
              <Section style={{ padding: "20px 32px 4px 32px" }}>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    fontWeight: 600,
                    lineHeight: "1.5",
                    margin: "0 0 6px 0",
                  }}
                >
                  One quick favor?
                </Text>
                <Text
                  style={{
                    color: MUTED_FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.6",
                    margin: "0 0 12px 0",
                  }}
                >
                  We'd love a minute of your time to learn what we could have
                  done better. Honest feedback helps us improve {productName}{" "}
                  for everyone.
                </Text>
                <a
                  href={feedbackUrl}
                  style={{
                    border: `1px solid ${BRAND_BLUE}`,
                    borderRadius: "8px",
                    color: BRAND_BLUE_DARK,
                    display: "inline-block",
                    fontSize: "14px",
                    fontWeight: 600,
                    padding: "10px 18px",
                    textDecoration: "none",
                  }}
                >
                  Share feedback
                </a>
              </Section>
            </>
          ) : null}

          <Hr style={{ borderColor: BORDER, margin: "20px 32px 0 32px" }} />

          <Section style={{ padding: "20px 32px 28px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Didn't request this cancellation? Reach us right away at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>{" "}
              and we'll help sort it out.
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
            email because your subscription was cancelled.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

SubscriptionCancelledEmail.PreviewProps = {
  recipientName: "Jane Doe",
  planName: "Team — Annual",
  cancelledAt: "Jun 12, 2026",
  accessEndsAt: "Jul 11, 2026",
  refundAmount: "$48.00 (prorated)",
  dataRetentionDays: 30,
  reactivateUrl:
    "https://schemavaults.com/billing/reactivate?token=example-token",
  feedbackUrl: "https://schemavaults.com/feedback/cancellation?u=example",
  manageBillingUrl: "https://schemavaults.com/billing",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies SubscriptionCancelledEmailProps;
