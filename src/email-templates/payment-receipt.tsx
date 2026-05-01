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

export interface PaymentReceiptLineItem {
  description: string;
  amount: string;
}

export interface PaymentReceiptEmailProps {
  recipientName?: string;
  receiptNumber: string;
  amountTotal: string;
  paymentDate: string;
  planName?: string;
  billingPeriod?: string;
  paymentMethod?: string;
  lineItems?: PaymentReceiptLineItem[];
  subtotal?: string;
  taxAmount?: string;
  nextBillingDate?: string;
  viewReceiptUrl?: string;
  manageBillingUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties, so the token hex values are inlined here.
// The emerald palette signals successful payment without colliding with the amber
// trial-ending or blue invitation/welcome flows.
const BRAND_BLUE_DARK = "#2563eb";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const EMERALD = "#10b981";
const EMERALD_DARK = "#059669";
const EMERALD_BG = "#ecfdf5";
const EMERALD_BORDER = "#a7f3d0";
const EMERALD_FOREGROUND = "#065f46";

export default function PaymentReceiptEmail(
  props: PaymentReceiptEmailProps,
): ReactElement {
  if (
    typeof props.receiptNumber !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'receiptNumber' in props for PaymentReceiptEmail template!",
    );
  }
  if (
    typeof props.amountTotal !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'amountTotal' in props for PaymentReceiptEmail template!",
    );
  }
  if (
    typeof props.paymentDate !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'paymentDate' in props for PaymentReceiptEmail template!",
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
  const planName: string | undefined =
    typeof props.planName === "string" && props.planName.length > 0
      ? props.planName
      : undefined;
  const billingPeriod: string | undefined =
    typeof props.billingPeriod === "string" && props.billingPeriod.length > 0
      ? props.billingPeriod
      : undefined;
  const paymentMethod: string | undefined =
    typeof props.paymentMethod === "string" && props.paymentMethod.length > 0
      ? props.paymentMethod
      : undefined;
  const subtotal: string | undefined =
    typeof props.subtotal === "string" && props.subtotal.length > 0
      ? props.subtotal
      : undefined;
  const taxAmount: string | undefined =
    typeof props.taxAmount === "string" && props.taxAmount.length > 0
      ? props.taxAmount
      : undefined;
  const nextBillingDate: string | undefined =
    typeof props.nextBillingDate === "string" &&
    props.nextBillingDate.length > 0
      ? props.nextBillingDate
      : undefined;
  const viewReceiptUrl: string | undefined =
    typeof props.viewReceiptUrl === "string" && props.viewReceiptUrl.length > 0
      ? props.viewReceiptUrl
      : undefined;
  const manageBillingUrl: string | undefined =
    typeof props.manageBillingUrl === "string" &&
    props.manageBillingUrl.length > 0
      ? props.manageBillingUrl
      : undefined;
  const lineItems: PaymentReceiptLineItem[] = Array.isArray(props.lineItems)
    ? props.lineItems.filter(
        (item): item is PaymentReceiptLineItem =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as PaymentReceiptLineItem).description === "string" &&
          (item as PaymentReceiptLineItem).description.length > 0 &&
          typeof (item as PaymentReceiptLineItem).amount === "string" &&
          (item as PaymentReceiptLineItem).amount.length > 0,
      )
    : [];

  const previewText = `Receipt ${props.receiptNumber} from ${productName} — ${props.amountTotal} paid on ${props.paymentDate}.`;

  const metaRows: Array<[string, string]> = [
    ["Receipt #", props.receiptNumber],
    ["Date paid", props.paymentDate],
  ];
  if (paymentMethod) {
    metaRows.push(["Payment method", paymentMethod]);
  }
  if (billingPeriod) {
    metaRows.push(["Billing period", billingPeriod]);
  }
  if (planName) {
    metaRows.push(["Plan", planName]);
  }
  if (nextBillingDate) {
    metaRows.push(["Next billing date", nextBillingDate]);
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
              background: `linear-gradient(135deg, ${EMERALD} 0%, ${EMERALD_DARK} 100%)`,
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
              {productName} · Payment receipt
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
              Thanks — your payment was successful.
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
              Receipt #{props.receiptNumber}
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
              We received your payment of <strong>{props.amountTotal}</strong>{" "}
              on <strong>{props.paymentDate}</strong>. Keep this email for your
              records — a copy is also available in your billing settings.
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: EMERALD_BG,
                border: `1px solid ${EMERALD_BORDER}`,
                borderLeft: `4px solid ${EMERALD_DARK}`,
                borderRadius: "8px",
                padding: "16px 18px",
              }}
            >
              <Text
                style={{
                  color: EMERALD_FOREGROUND,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                Amount paid
              </Text>
              <Text
                style={{
                  color: EMERALD_FOREGROUND,
                  fontSize: "24px",
                  fontWeight: 700,
                  lineHeight: "1.2",
                  margin: 0,
                }}
              >
                {props.amountTotal}
              </Text>
            </div>
          </Section>

          {lineItems.length > 0 ? (
            <Section style={{ padding: "20px 32px 0 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 8px 0",
                  textTransform: "uppercase",
                }}
              >
                Items
              </Text>
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{ borderCollapse: "collapse", width: "100%" }}
              >
                <tbody>
                  {lineItems.map((item, idx) => (
                    <tr key={`${item.description}-${idx}`}>
                      <td
                        style={{
                          borderTop: idx === 0 ? "none" : `1px solid ${BORDER}`,
                          color: FOREGROUND,
                          fontSize: "14px",
                          lineHeight: "1.55",
                          padding: "10px 12px 10px 0",
                          verticalAlign: "top",
                        }}
                      >
                        {item.description}
                      </td>
                      <td
                        style={{
                          borderTop: idx === 0 ? "none" : `1px solid ${BORDER}`,
                          color: FOREGROUND,
                          fontSize: "14px",
                          fontWeight: 500,
                          lineHeight: "1.55",
                          padding: "10px 0",
                          textAlign: "right",
                          verticalAlign: "top",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.amount}
                      </td>
                    </tr>
                  ))}
                  {subtotal ? (
                    <tr>
                      <td
                        style={{
                          borderTop: `1px solid ${BORDER}`,
                          color: MUTED_FOREGROUND,
                          fontSize: "13px",
                          lineHeight: "1.55",
                          padding: "10px 12px 4px 0",
                          verticalAlign: "top",
                        }}
                      >
                        Subtotal
                      </td>
                      <td
                        style={{
                          borderTop: `1px solid ${BORDER}`,
                          color: FOREGROUND,
                          fontSize: "13px",
                          lineHeight: "1.55",
                          padding: "10px 0 4px 0",
                          textAlign: "right",
                          verticalAlign: "top",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {subtotal}
                      </td>
                    </tr>
                  ) : null}
                  {taxAmount ? (
                    <tr>
                      <td
                        style={{
                          color: MUTED_FOREGROUND,
                          fontSize: "13px",
                          lineHeight: "1.55",
                          padding: "4px 12px 4px 0",
                          verticalAlign: "top",
                        }}
                      >
                        Tax
                      </td>
                      <td
                        style={{
                          color: FOREGROUND,
                          fontSize: "13px",
                          lineHeight: "1.55",
                          padding: "4px 0",
                          textAlign: "right",
                          verticalAlign: "top",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {taxAmount}
                      </td>
                    </tr>
                  ) : null}
                  <tr>
                    <td
                      style={{
                        borderTop: `2px solid ${FOREGROUND}`,
                        color: FOREGROUND,
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "1.55",
                        padding: "10px 12px 10px 0",
                        verticalAlign: "top",
                      }}
                    >
                      Total paid
                    </td>
                    <td
                      style={{
                        borderTop: `2px solid ${FOREGROUND}`,
                        color: FOREGROUND,
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "1.55",
                        padding: "10px 0",
                        textAlign: "right",
                        verticalAlign: "top",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {props.amountTotal}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                margin: "0 0 8px 0",
                textTransform: "uppercase",
              }}
            >
              Details
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

          {viewReceiptUrl ? (
            <Section style={{ padding: "20px 32px 8px 32px" }}>
              <Button
                href={viewReceiptUrl}
                style={{
                  backgroundColor: EMERALD_DARK,
                  borderRadius: "8px",
                  color: "#ffffff",
                  display: "inline-block",
                  fontSize: "15px",
                  fontWeight: 600,
                  padding: "12px 22px",
                  textDecoration: "none",
                }}
              >
                View receipt
              </Button>
            </Section>
          ) : null}

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
                  Need to update payment details, change plans, or download
                  past invoices? Visit your{" "}
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
              Questions about this charge or your subscription? Reply to this
              email or reach us at{" "}
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
            email because a payment was processed for your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

PaymentReceiptEmail.PreviewProps = {
  recipientName: "Jane Doe",
  receiptNumber: "INV-2026-001234",
  amountTotal: "$31.30 USD",
  paymentDate: "May 1, 2026 09:14 UTC",
  planName: "Pro (annual)",
  billingPeriod: "May 1, 2026 – Jun 1, 2026",
  paymentMethod: "Visa ending in 4242",
  lineItems: [
    { description: "SchemaVaults Pro plan — monthly", amount: "$29.00" },
    { description: "Additional team seats (2 × $5/seat)", amount: "$10.00" },
    { description: "Promotional credit applied", amount: "-$10.00" },
  ],
  subtotal: "$29.00 USD",
  taxAmount: "$2.30 USD",
  nextBillingDate: "Jun 1, 2026",
  viewReceiptUrl:
    "https://schemavaults.com/account/billing/receipts/INV-2026-001234",
  manageBillingUrl: "https://schemavaults.com/account/billing",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies PaymentReceiptEmailProps;
