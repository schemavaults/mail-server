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

export interface PaymentFailedEmailProps {
  recipientName?: string;
  amountDue: string;
  attemptedAt: string;
  updatePaymentMethodUrl: string;
  planName?: string;
  paymentMethodBrand?: string;
  paymentMethodLast4?: string;
  failureReason?: string;
  failureCode?: string;
  nextRetryAt?: string;
  gracePeriodEndsAt?: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Neutral palette and semantic status colors for this template. Email clients
// don't resolve CSS custom properties or oklch(), so the values are inlined as hex.
// BRAND_RED is the destructive/alert color, used throughout to convey payment failure urgency.
const BRAND_RED = "#dc2626";
const BRAND_RED_DARK = "#991b1b";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const ALERT_BG = "#fef2f2";
const ALERT_BORDER = "#fecaca";
const ALERT_FOREGROUND = "#7f1d1d";

export default function PaymentFailedEmail(
  props: PaymentFailedEmailProps,
): ReactElement {
  if (
    typeof props.amountDue !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'amountDue' in props for PaymentFailedEmail template!",
    );
  }
  if (
    typeof props.attemptedAt !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'attemptedAt' in props for PaymentFailedEmail template!",
    );
  }
  if (
    typeof props.updatePaymentMethodUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'updatePaymentMethodUrl' in props for PaymentFailedEmail template!",
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
  const failureReason: string =
    typeof props.failureReason === "string" && props.failureReason.length > 0
      ? props.failureReason
      : "Your card issuer declined the charge.";
  const paymentMethodLine: string | undefined =
    typeof props.paymentMethodBrand === "string" &&
    props.paymentMethodBrand.length > 0 &&
    typeof props.paymentMethodLast4 === "string" &&
    props.paymentMethodLast4.length > 0
      ? `${props.paymentMethodBrand} ending in ${props.paymentMethodLast4}`
      : undefined;

  const previewText = `Action required: we couldn't charge your payment method for ${props.amountDue}.`;

  const metaRows: Array<[string, string]> = [
    ["Amount due", props.amountDue],
    ["Attempted", props.attemptedAt],
  ];
  if (typeof props.planName === "string" && props.planName.length > 0) {
    metaRows.push(["Plan", props.planName]);
  }
  if (paymentMethodLine) {
    metaRows.push(["Payment method", paymentMethodLine]);
  }
  if (
    typeof props.invoiceNumber === "string" &&
    props.invoiceNumber.length > 0
  ) {
    metaRows.push(["Invoice", props.invoiceNumber]);
  }
  if (
    typeof props.failureCode === "string" &&
    props.failureCode.length > 0
  ) {
    metaRows.push(["Decline code", props.failureCode]);
  }

  const showSchedule: boolean =
    (typeof props.nextRetryAt === "string" && props.nextRetryAt.length > 0) ||
    (typeof props.gracePeriodEndsAt === "string" &&
      props.gracePeriodEndsAt.length > 0);

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
              background: `linear-gradient(135deg, ${BRAND_RED} 0%, ${BRAND_RED_DARK} 100%)`,
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
              {productName} · Action required
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
              We couldn't process your payment.
            </Heading>
            <Text
              style={{
                color: "#fee2e2",
                fontSize: "14px",
                lineHeight: "1.55",
                margin: "10px 0 0 0",
              }}
            >
              Update your payment method to keep your subscription active.
            </Text>
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
              We tried to charge your payment method for your{" "}
              {productName} subscription, but the charge didn't go through.
              No need to worry — your account is still active. Please update
              your billing details so we can complete the payment and avoid
              any interruption to your service.
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: ALERT_BG,
                border: `1px solid ${ALERT_BORDER}`,
                borderLeft: `4px solid ${BRAND_RED}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: ALERT_FOREGROUND,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                Reason
              </Text>
              <Text
                style={{
                  color: ALERT_FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                {failureReason}
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

          {showSchedule ? (
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
                  What happens next
                </Text>
                {typeof props.nextRetryAt === "string" &&
                props.nextRetryAt.length > 0 ? (
                  <Text
                    style={{
                      color: FOREGROUND,
                      fontSize: "14px",
                      lineHeight: "1.55",
                      margin: "0 0 4px 0",
                    }}
                  >
                    We'll automatically retry the payment on{" "}
                    <strong>{props.nextRetryAt}</strong>.
                  </Text>
                ) : null}
                {typeof props.gracePeriodEndsAt === "string" &&
                props.gracePeriodEndsAt.length > 0 ? (
                  <Text
                    style={{
                      color: FOREGROUND,
                      fontSize: "14px",
                      lineHeight: "1.55",
                      margin: 0,
                    }}
                  >
                    If we still can't collect payment by{" "}
                    <strong>{props.gracePeriodEndsAt}</strong>, your
                    subscription will be paused.
                  </Text>
                ) : null}
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={props.updatePaymentMethodUrl}
              style={{
                backgroundColor: BRAND_RED,
                borderRadius: "8px",
                color: "#ffffff",
                display: "inline-block",
                fontSize: "15px",
                fontWeight: 600,
                padding: "12px 22px",
                textDecoration: "none",
              }}
            >
              Update payment method
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
                href={props.updatePaymentMethodUrl}
                style={{ color: BRAND_RED_DARK, textDecoration: "none" }}
              >
                {props.updatePaymentMethodUrl}
              </a>
            </Text>
          </Section>

          {typeof props.invoiceUrl === "string" &&
          props.invoiceUrl.length > 0 ? (
            <Section style={{ padding: "8px 32px 8px 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                Need a copy of the invoice?{" "}
                <a
                  href={props.invoiceUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  View invoice
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
              Common reasons for a failed charge include an expired card,
              insufficient funds, or your bank flagging the transaction.
              If everything looks correct on your end, please contact us at{" "}
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
            email because of a billing issue with your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

PaymentFailedEmail.PreviewProps = {
  recipientName: "Jane Doe",
  amountDue: "$29.00 USD",
  attemptedAt: "May 6, 2026 14:23 UTC",
  updatePaymentMethodUrl:
    "https://mail.example.com/billing/payment-method?token=example-token",
  planName: "Pro Monthly",
  paymentMethodBrand: "Visa",
  paymentMethodLast4: "4242",
  failureReason:
    "Your card was declined. The issuing bank reported insufficient funds.",
  failureCode: "insufficient_funds",
  nextRetryAt: "May 9, 2026",
  gracePeriodEndsAt: "May 13, 2026",
  invoiceNumber: "INV-2026-04821",
} satisfies PaymentFailedEmailProps;
