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
  customerName?: string;
  planName: string;
  accessEndsAt: string;
  cancellationDate?: string;
  refundAmount?: string;
  reactivateUrl: string;
  feedbackUrl?: string;
  billingPortalUrl?: string;
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
// Neutral slate gradient — cancellation is not an emergency; we deliberately
// avoid the destructive red token (`--schemavaults-brand-red: #dc2626`) so
// the email reads as a calm, supportive confirmation rather than an alert.
const SLATE_HEADER_START = "#475569";
const SLATE_HEADER_END = "#1e293b";

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
    typeof props.customerName === "string" && props.customerName.length > 0
      ? props.customerName
      : "there";
  const cancellationDate: string | undefined =
    typeof props.cancellationDate === "string" &&
    props.cancellationDate.length > 0
      ? props.cancellationDate
      : undefined;
  const refundAmount: string | undefined =
    typeof props.refundAmount === "string" && props.refundAmount.length > 0
      ? props.refundAmount
      : undefined;
  const feedbackUrl: string | undefined =
    typeof props.feedbackUrl === "string" && props.feedbackUrl.length > 0
      ? props.feedbackUrl
      : undefined;
  const billingPortalUrl: string | undefined =
    typeof props.billingPortalUrl === "string" &&
    props.billingPortalUrl.length > 0
      ? props.billingPortalUrl
      : undefined;

  const previewText = `Your ${productName} ${props.planName} subscription has been cancelled. You'll keep access until ${props.accessEndsAt}.`;

  const metaRows: Array<[string, string]> = [["Plan", props.planName]];
  if (cancellationDate) {
    metaRows.push(["Cancelled", cancellationDate]);
  }
  metaRows.push(["Access ends", props.accessEndsAt]);
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
              background: `linear-gradient(135deg, ${SLATE_HEADER_START} 0%, ${SLATE_HEADER_END} 100%)`,
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
                opacity: 0.85,
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
              Your {props.planName} subscription has been cancelled.
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
              We're confirming that your <strong>{props.planName}</strong>{" "}
              subscription on {productName} has been cancelled. You'll keep
              full access to all paid features until{" "}
              <strong>{props.accessEndsAt}</strong>, after which your account
              will move to the free tier. No further charges will be made.
            </Text>
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
                You still have access
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                Until {props.accessEndsAt}, everything keeps working exactly as
                it does today — vaults, schemas, API keys, integrations, and
                team members. Export any data you'd like to keep before that
                date.
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
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "15px",
                lineHeight: "1.6",
                margin: "0 0 14px 0",
              }}
            >
              Changed your mind? You can reactivate any time before{" "}
              {props.accessEndsAt} and pick up exactly where you left off — no
              data loss, no reconfiguration.
            </Text>
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
              Reactivate {props.planName}
            </Button>
          </Section>

          <Section style={{ padding: "0 32px 8px 32px" }}>
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
            <Section style={{ padding: "16px 32px 8px 32px" }}>
              <div
                style={{
                  backgroundColor: "#eff6ff",
                  border: `1px solid ${BRAND_BLUE}`,
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: "0 0 10px 0",
                  }}
                >
                  Got a minute? We'd love to know what we could have done
                  better. Your feedback shapes what we build next.
                </Text>
                <a
                  href={feedbackUrl}
                  style={{
                    color: BRAND_BLUE_DARK,
                    fontSize: "14px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Share feedback →
                </a>
              </div>
            </Section>
          ) : null}

          {billingPortalUrl ? (
            <Section style={{ padding: "12px 32px 8px 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                Need an invoice or payment history? Visit your{" "}
                <a
                  href={billingPortalUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  billing portal
                </a>
                .
              </Text>
            </Section>
          ) : null}

          <Hr style={{ borderColor: BORDER, margin: "16px 32px 0 32px" }} />

          <Section style={{ padding: "20px 32px 28px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Thanks for trying {productName}. If you didn't request this
              cancellation, or if anything looks off, contact us right away at{" "}
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
            email because you cancelled a subscription on your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

SubscriptionCancelledEmail.PreviewProps = {
  customerName: "Jordan Reyes",
  planName: "Pro",
  cancellationDate: "Jun 2, 2026",
  accessEndsAt: "Jun 28, 2026",
  refundAmount: "$0.00 (no proration)",
  reactivateUrl:
    "https://schemavaults.com/billing/reactivate?token=example-token",
  feedbackUrl: "https://schemavaults.com/feedback/cancellation",
  billingPortalUrl: "https://schemavaults.com/account/billing",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies SubscriptionCancelledEmailProps;
