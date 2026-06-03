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
  customerEmail?: string;
  planName: string;
  cancellationDate: string;
  accessUntil: string;
  cancellationReason?: string;
  refundAmount?: string;
  reactivateUrl?: string;
  feedbackUrl?: string;
  dataRetentionPolicy?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties, so the token hex values are inlined here.
// SLATE tokens approximate the theme's secondary/muted palette (hsl 222/217 32% slate scale).
const BRAND_BLUE_DARK = "#2563eb";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const SLATE = "#475569";
const SLATE_DARK = "#1e293b";

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
    typeof props.cancellationDate !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'cancellationDate' in props for SubscriptionCancelledEmail template!",
    );
  }
  if (
    typeof props.accessUntil !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'accessUntil' in props for SubscriptionCancelledEmail template!",
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
  const customerEmail: string | undefined =
    typeof props.customerEmail === "string" && props.customerEmail.length > 0
      ? props.customerEmail
      : undefined;
  const cancellationReason: string | undefined =
    typeof props.cancellationReason === "string" &&
    props.cancellationReason.length > 0
      ? props.cancellationReason
      : undefined;
  const refundAmount: string | undefined =
    typeof props.refundAmount === "string" && props.refundAmount.length > 0
      ? props.refundAmount
      : undefined;
  const reactivateUrl: string | undefined =
    typeof props.reactivateUrl === "string" && props.reactivateUrl.length > 0
      ? props.reactivateUrl
      : undefined;
  const feedbackUrl: string | undefined =
    typeof props.feedbackUrl === "string" && props.feedbackUrl.length > 0
      ? props.feedbackUrl
      : undefined;
  const dataRetentionPolicy: string | undefined =
    typeof props.dataRetentionPolicy === "string" &&
    props.dataRetentionPolicy.length > 0
      ? props.dataRetentionPolicy
      : undefined;

  const previewText = `Your ${productName} ${props.planName} subscription has been cancelled. You have access until ${props.accessUntil}.`;

  const metaRows: Array<[string, string]> = [["Plan", props.planName]];
  if (customerEmail) {
    metaRows.push(["Account", customerEmail]);
  }
  metaRows.push(["Cancelled on", props.cancellationDate]);
  metaRows.push(["Access until", props.accessUntil]);
  if (refundAmount) {
    metaRows.push(["Refund issued", refundAmount]);
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
              {productName} · Subscription cancelled
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
              Your {props.planName} subscription has been cancelled.
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
              Access through {props.accessUntil}
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
              We've cancelled your <strong>{props.planName}</strong>{" "}
              subscription on {productName}, as requested. You'll continue to
              have full access until <strong>{props.accessUntil}</strong>, and
              we won't bill you again.
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
                  Cancellation reason
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

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                margin: "0 0 10px 0",
                textTransform: "uppercase",
              }}
            >
              What happens next
            </Text>
            <ul
              style={{
                color: FOREGROUND,
                fontSize: "14px",
                lineHeight: "1.6",
                margin: 0,
                paddingLeft: "20px",
              }}
            >
              <li style={{ margin: "2px 0" }}>
                You keep full access to {props.planName} features through{" "}
                <strong>{props.accessUntil}</strong>.
              </li>
              <li style={{ margin: "2px 0" }}>
                After that, your account moves to the free tier and paid
                features become read-only.
              </li>
              <li style={{ margin: "2px 0" }}>
                {dataRetentionPolicy
                  ? dataRetentionPolicy
                  : "Your schemas and vaults stay in place — nothing will be deleted automatically."}
              </li>
              <li style={{ margin: "2px 0" }}>
                You can reactivate anytime and pick up right where you left off.
              </li>
            </ul>
          </Section>

          {reactivateUrl ? (
            <>
              <Section style={{ padding: "20px 32px 8px 32px" }}>
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
                  Reactivate subscription
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
                    href={reactivateUrl}
                    style={{
                      color: BRAND_BLUE_DARK,
                      textDecoration: "none",
                    }}
                  >
                    {reactivateUrl}
                  </a>
                </Text>
              </Section>
            </>
          ) : null}

          {feedbackUrl ? (
            <Section style={{ padding: "16px 32px 8px 32px" }}>
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
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: "0 0 8px 0",
                  }}
                >
                  <strong>Mind sharing why you're leaving?</strong> Two minutes
                  of feedback genuinely helps us make {productName} better.
                </Text>
                <a
                  href={feedbackUrl}
                  style={{
                    color: BRAND_BLUE_DARK,
                    fontSize: "13px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Share feedback →
                </a>
              </div>
            </Section>
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
              Didn't request this cancellation? Reach out to us right away at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>{" "}
              and we'll restore your subscription.
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
            © {new Date().getFullYear()} {productName}. Thanks for trying{" "}
            {productName} — we'd love to have you back whenever you're ready.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

SubscriptionCancelledEmail.PreviewProps = {
  customerName: "Jane Doe",
  customerEmail: "jane@acme.co",
  planName: "Pro",
  cancellationDate: "Jun 3, 2026",
  accessUntil: "Jul 3, 2026",
  cancellationReason:
    "Switching to an in-house solution — may revisit next quarter.",
  refundAmount: "$24.00 USD (prorated)",
  reactivateUrl:
    "https://schemavaults.com/billing/reactivate?token=example-token",
  feedbackUrl: "https://schemavaults.com/cancel/feedback?token=example-token",
  dataRetentionPolicy:
    "Your schemas and vaults remain available read-only for 90 days, then are scheduled for deletion unless you reactivate.",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies SubscriptionCancelledEmailProps;
