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

export interface PaymentMethodExpiringEmailProps {
  recipientName?: string;
  paymentMethodLast4: string;
  expiresAt: string;
  updatePaymentMethodUrl: string;
  paymentMethodBrand?: string;
  expiryMonth?: string;
  expiryYear?: string;
  daysUntilExpiry?: string;
  planName?: string;
  nextChargeDate?: string;
  nextChargeAmount?: string;
  manageBillingUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties or oklch(), so the token values are inlined as hex.
// The AMBER palette mirrors the theme's `--warning` token (oklch(82% 0.189 84.429) ≈ amber-500),
// conveying "action needed" without the alarm of the destructive red used for hard failures.
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

export default function PaymentMethodExpiringEmail(
  props: PaymentMethodExpiringEmailProps,
): ReactElement {
  if (
    typeof props.paymentMethodLast4 !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'paymentMethodLast4' in props for PaymentMethodExpiringEmail template!",
    );
  }
  if (
    typeof props.expiresAt !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'expiresAt' in props for PaymentMethodExpiringEmail template!",
    );
  }
  if (
    typeof props.updatePaymentMethodUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'updatePaymentMethodUrl' in props for PaymentMethodExpiringEmail template!",
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
  const paymentMethodBrand: string =
    typeof props.paymentMethodBrand === "string" &&
    props.paymentMethodBrand.length > 0
      ? props.paymentMethodBrand
      : "Card";
  const expiryMonth: string | undefined =
    typeof props.expiryMonth === "string" && props.expiryMonth.length > 0
      ? props.expiryMonth
      : undefined;
  const expiryYear: string | undefined =
    typeof props.expiryYear === "string" && props.expiryYear.length > 0
      ? props.expiryYear
      : undefined;
  const daysUntilExpiry: string | undefined =
    typeof props.daysUntilExpiry === "string" &&
    props.daysUntilExpiry.length > 0
      ? props.daysUntilExpiry
      : undefined;
  const planName: string | undefined =
    typeof props.planName === "string" && props.planName.length > 0
      ? props.planName
      : undefined;
  const nextChargeDate: string | undefined =
    typeof props.nextChargeDate === "string" && props.nextChargeDate.length > 0
      ? props.nextChargeDate
      : undefined;
  const nextChargeAmount: string | undefined =
    typeof props.nextChargeAmount === "string" &&
    props.nextChargeAmount.length > 0
      ? props.nextChargeAmount
      : undefined;
  const manageBillingUrl: string | undefined =
    typeof props.manageBillingUrl === "string" &&
    props.manageBillingUrl.length > 0
      ? props.manageBillingUrl
      : undefined;

  const expiryShort: string | undefined =
    expiryMonth && expiryYear ? `${expiryMonth}/${expiryYear}` : undefined;

  const cardLabel: string = `${paymentMethodBrand} ending in ${props.paymentMethodLast4}`;

  const previewText: string = daysUntilExpiry
    ? `Your ${paymentMethodBrand} card ending in ${props.paymentMethodLast4} expires ${daysUntilExpiry}. Update it to avoid a lapse in ${productName} service.`
    : `Your ${paymentMethodBrand} card ending in ${props.paymentMethodLast4} expires on ${props.expiresAt}. Update it to avoid a lapse in ${productName} service.`;

  const metaRows: Array<[string, string]> = [
    ["Card", cardLabel],
    ["Expires", props.expiresAt],
  ];
  if (planName) {
    metaRows.push(["Plan", planName]);
  }
  if (nextChargeDate && nextChargeAmount) {
    metaRows.push(["Next charge", `${nextChargeAmount} on ${nextChargeDate}`]);
  } else if (nextChargeDate) {
    metaRows.push(["Next charge", nextChargeDate]);
  } else if (nextChargeAmount) {
    metaRows.push(["Next charge", nextChargeAmount]);
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
              {productName} · Action needed
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
              Your payment method is expiring soon.
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
              Expires {daysUntilExpiry ?? props.expiresAt}
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
              The <strong>{paymentMethodBrand}</strong> card ending in{" "}
              <strong>{props.paymentMethodLast4}</strong> on your {productName}{" "}
              account expires on <strong>{props.expiresAt}</strong>. Update it
              before then so your subscription doesn&apos;t lapse and we can
              keep your service running without interruption.
            </Text>
          </Section>

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
                Card on file
              </Text>
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{ borderCollapse: "collapse", width: "100%" }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        color: AMBER_FOREGROUND,
                        fontSize: "16px",
                        fontWeight: 600,
                        lineHeight: "1.4",
                        padding: 0,
                        verticalAlign: "middle",
                      }}
                    >
                      {paymentMethodBrand} •••• {props.paymentMethodLast4}
                    </td>
                    {expiryShort ? (
                      <td
                        style={{
                          color: AMBER_FOREGROUND,
                          fontFamily:
                            "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
                          fontSize: "14px",
                          fontWeight: 600,
                          padding: 0,
                          textAlign: "right",
                          verticalAlign: "middle",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {expiryShort}
                      </td>
                    ) : null}
                  </tr>
                </tbody>
              </table>
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
            <Button
              href={props.updatePaymentMethodUrl}
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
              Update payment method
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
                href={props.updatePaymentMethodUrl}
                style={{ color: AMBER_DARK, textDecoration: "none" }}
              >
                {props.updatePaymentMethodUrl}
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
                  Want to review invoices or change plans while you&apos;re at
                  it? Visit your{" "}
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
              If you&apos;ve already updated this card, you can safely ignore
              this email — we&apos;ll only bill the most recent payment method
              on file. Questions? Reach us at{" "}
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
            email because a payment method on your account is expiring soon.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

PaymentMethodExpiringEmail.PreviewProps = {
  recipientName: "Jane Doe",
  paymentMethodBrand: "Visa",
  paymentMethodLast4: "4242",
  expiryMonth: "07",
  expiryYear: "2026",
  expiresAt: "July 31, 2026",
  daysUntilExpiry: "in 15 days",
  planName: "Pro · Monthly",
  nextChargeDate: "Aug 5, 2026",
  nextChargeAmount: "$29.00 USD",
  updatePaymentMethodUrl: "https://schemavaults.com/account/billing/payment-methods",
  manageBillingUrl: "https://schemavaults.com/account/billing",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies PaymentMethodExpiringEmailProps;
