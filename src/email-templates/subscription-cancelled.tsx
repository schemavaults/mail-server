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
  cancelledAt: string;
  accessEndsAt: string;
  reactivateUrl?: string;
  manageBillingUrl?: string;
  refundAmount?: string;
  refundReceiptUrl?: string;
  finalInvoiceUrl?: string;
  feedbackUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties or oklch(), so the token values are inlined as hex.
// Slate is used for the cancellation-confirmation panel to convey a neutral "wind-down" tone
// (avoiding alarming red or celebratory green), while the brand blue carries the reactivation CTA.
const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const SLATE = "#475569";
const SLATE_DARK = "#334155";
const SLATE_BG = "#f1f5f9";
const SLATE_BORDER = "#cbd5e1";
const SLATE_FOREGROUND = "#1e293b";

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
  const reactivateUrl: string | undefined =
    typeof props.reactivateUrl === "string" && props.reactivateUrl.length > 0
      ? props.reactivateUrl
      : undefined;
  const manageBillingUrl: string | undefined =
    typeof props.manageBillingUrl === "string" &&
    props.manageBillingUrl.length > 0
      ? props.manageBillingUrl
      : undefined;
  const refundAmount: string | undefined =
    typeof props.refundAmount === "string" && props.refundAmount.length > 0
      ? props.refundAmount
      : undefined;
  const refundReceiptUrl: string | undefined =
    typeof props.refundReceiptUrl === "string" &&
    props.refundReceiptUrl.length > 0
      ? props.refundReceiptUrl
      : undefined;
  const finalInvoiceUrl: string | undefined =
    typeof props.finalInvoiceUrl === "string" &&
    props.finalInvoiceUrl.length > 0
      ? props.finalInvoiceUrl
      : undefined;
  const feedbackUrl: string | undefined =
    typeof props.feedbackUrl === "string" && props.feedbackUrl.length > 0
      ? props.feedbackUrl
      : undefined;

  const previewText = `Your ${productName} ${props.planName} subscription has been cancelled. Paid features stay active until ${props.accessEndsAt}.`;

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
              We've cancelled your <strong>{props.planName}</strong>{" "}
              subscription on {productName}. Your paid features will remain
              active until <strong>{props.accessEndsAt}</strong>. After that
              date, your account will revert to the free tier — your data and
              schemas stay safe and accessible.
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: SLATE_BG,
                border: `1px solid ${SLATE_BORDER}`,
                borderLeft: `4px solid ${SLATE_DARK}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: SLATE_FOREGROUND,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 6px 0",
                  textTransform: "uppercase",
                }}
              >
                Cancellation summary
              </Text>
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
                          padding: "3px 12px 3px 0",
                          verticalAlign: "top",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {label}
                      </td>
                      <td
                        style={{
                          color: SLATE_FOREGROUND,
                          fontSize: "13px",
                          fontWeight: 500,
                          lineHeight: "1.6",
                          padding: "3px 0",
                          verticalAlign: "top",
                        }}
                      >
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {refundAmount ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                A refund of <strong>{refundAmount}</strong> has been issued to
                your original payment method. It typically takes 5–10 business
                days to appear on your statement.
                {refundReceiptUrl ? (
                  <>
                    {" "}
                    <a
                      href={refundReceiptUrl}
                      style={{
                        color: BRAND_BLUE_DARK,
                        textDecoration: "none",
                      }}
                    >
                      View refund receipt
                    </a>
                    .
                  </>
                ) : null}
              </Text>
            </Section>
          ) : null}

          {reactivateUrl ? (
            <Section style={{ padding: "20px 32px 8px 32px" }}>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.6",
                  margin: "0 0 12px 0",
                }}
              >
                Changed your mind? You can reactivate any time before{" "}
                <strong>{props.accessEndsAt}</strong> without losing your
                settings.
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

          {manageBillingUrl || finalInvoiceUrl ? (
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
                  Billing
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.6",
                    margin: 0,
                  }}
                >
                  {manageBillingUrl ? (
                    <>
                      <a
                        href={manageBillingUrl}
                        style={{
                          color: BRAND_BLUE_DARK,
                          textDecoration: "none",
                        }}
                      >
                        Manage billing &amp; invoices
                      </a>
                      {finalInvoiceUrl ? " · " : ""}
                    </>
                  ) : null}
                  {finalInvoiceUrl ? (
                    <a
                      href={finalInvoiceUrl}
                      style={{
                        color: BRAND_BLUE_DARK,
                        textDecoration: "none",
                      }}
                    >
                      View final invoice
                    </a>
                  ) : null}
                </Text>
              </div>
            </Section>
          ) : null}

          {feedbackUrl ? (
            <Section style={{ padding: "20px 32px 4px 32px" }}>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                We're sorry to see you go. If you have a moment,{" "}
                <a
                  href={feedbackUrl}
                  style={{
                    color: BRAND_BLUE_DARK,
                    textDecoration: "none",
                  }}
                >
                  tell us what we could have done better
                </a>{" "}
                — it genuinely shapes what we build next.
              </Text>
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
              Didn't request this cancellation? Reach us at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>{" "}
              and we'll look into it right away.
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
            email because you cancelled a paid subscription on your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

SubscriptionCancelledEmail.PreviewProps = {
  customerName: "Jordan Rivera",
  planName: "SchemaVaults Pro",
  cancelledAt: "Jun 15, 2026 10:42 UTC",
  accessEndsAt: "Jul 12, 2026",
  reactivateUrl: "https://schemavaults.com/billing/reactivate?token=example",
  manageBillingUrl: "https://schemavaults.com/billing",
  refundAmount: "$12.00 USD",
  refundReceiptUrl: "https://schemavaults.com/billing/refunds/rfd_example",
  finalInvoiceUrl: "https://schemavaults.com/billing/invoices/in_example",
  feedbackUrl: "https://schemavaults.com/feedback?reason=cancellation",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies SubscriptionCancelledEmailProps;
