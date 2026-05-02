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
  customerName: string;
  receiptNumber: string;
  amountTotal: string;
  paymentDate: string;
  paymentMethod: string;
  customerEmail?: string;
  lineItems?: PaymentReceiptLineItem[];
  subtotal?: string;
  discount?: string;
  tax?: string;
  currency?: string;
  planName?: string;
  nextBillingDate?: string;
  invoiceUrl?: string;
  manageBillingUrl?: string;
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
// Success palette — Tailwind emerald scale, used for the "Paid" status badge.
const SUCCESS = "#10b981";
const SUCCESS_DARK = "#047857";
const SUCCESS_BG = "#ecfdf5";
const SUCCESS_BORDER = "#a7f3d0";
const SUCCESS_FOREGROUND = "#064e3b";

export default function PaymentReceiptEmail(
  props: PaymentReceiptEmailProps,
): ReactElement {
  if (
    typeof props.customerName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'customerName' in props for PaymentReceiptEmail template!",
    );
  }
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
  if (
    typeof props.paymentMethod !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'paymentMethod' in props for PaymentReceiptEmail template!",
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
  const planName: string | undefined =
    typeof props.planName === "string" && props.planName.length > 0
      ? props.planName
      : undefined;
  const customerEmail: string | undefined =
    typeof props.customerEmail === "string" && props.customerEmail.length > 0
      ? props.customerEmail
      : undefined;
  const currency: string | undefined =
    typeof props.currency === "string" && props.currency.length > 0
      ? props.currency
      : undefined;
  const subtotal: string | undefined =
    typeof props.subtotal === "string" && props.subtotal.length > 0
      ? props.subtotal
      : undefined;
  const discount: string | undefined =
    typeof props.discount === "string" && props.discount.length > 0
      ? props.discount
      : undefined;
  const tax: string | undefined =
    typeof props.tax === "string" && props.tax.length > 0 ? props.tax : undefined;
  const nextBillingDate: string | undefined =
    typeof props.nextBillingDate === "string" &&
    props.nextBillingDate.length > 0
      ? props.nextBillingDate
      : undefined;
  const invoiceUrl: string | undefined =
    typeof props.invoiceUrl === "string" && props.invoiceUrl.length > 0
      ? props.invoiceUrl
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
          typeof (item as PaymentReceiptLineItem).amount === "string",
      )
    : [];

  const previewText = `Payment received: ${props.amountTotal} for ${productName}.`;

  const metaRows: Array<[string, string]> = [];
  metaRows.push(["Receipt #", props.receiptNumber]);
  metaRows.push(["Payment date", props.paymentDate]);
  metaRows.push(["Payment method", props.paymentMethod]);
  if (customerEmail) {
    metaRows.push(["Billed to", customerEmail]);
  }
  if (planName) {
    metaRows.push(["Plan", planName]);
  }
  if (currency) {
    metaRows.push(["Currency", currency]);
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
              background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_BLUE_DARK} 100%)`,
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
                margin: "8px 0 0 0",
              }}
            >
              Thanks — your payment was received.
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
              We've recorded your payment for {productName}. Keep this email for
              your records — it serves as your official receipt.
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: SUCCESS_BG,
                border: `1px solid ${SUCCESS_BORDER}`,
                borderLeft: `4px solid ${SUCCESS_DARK}`,
                borderRadius: "8px",
                padding: "16px 18px",
              }}
            >
              <Text
                style={{
                  color: SUCCESS_FOREGROUND,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                Paid
              </Text>
              <Text
                style={{
                  color: SUCCESS_FOREGROUND,
                  fontSize: "28px",
                  fontWeight: 700,
                  lineHeight: "1.2",
                  margin: 0,
                }}
              >
                {props.amountTotal}
              </Text>
              {currency ? (
                <Text
                  style={{
                    color: SUCCESS_FOREGROUND,
                    fontSize: "12px",
                    lineHeight: "1.4",
                    margin: "4px 0 0 0",
                  }}
                >
                  {currency}
                </Text>
              ) : null}
            </div>
          </Section>

          <Section style={{ padding: "20px 32px 8px 32px" }}>
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

          {lineItems.length > 0 ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  margin: "0 0 8px 0",
                  textTransform: "uppercase",
                }}
              >
                Line items
              </Text>
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{
                  border: `1px solid ${BORDER}`,
                  borderCollapse: "collapse",
                  borderRadius: "8px",
                  overflow: "hidden",
                  width: "100%",
                }}
              >
                <tbody>
                  {lineItems.map((item, idx) => (
                    <tr
                      key={`${item.description}-${idx}`}
                      style={{
                        backgroundColor: idx % 2 === 0 ? CARD_BG : PANEL_BG,
                      }}
                    >
                      <td
                        style={{
                          borderBottom:
                            idx === lineItems.length - 1
                              ? "none"
                              : `1px solid ${BORDER}`,
                          color: FOREGROUND,
                          fontSize: "14px",
                          lineHeight: "1.55",
                          padding: "12px 14px",
                          verticalAlign: "top",
                        }}
                      >
                        {item.description}
                      </td>
                      <td
                        style={{
                          borderBottom:
                            idx === lineItems.length - 1
                              ? "none"
                              : `1px solid ${BORDER}`,
                          color: FOREGROUND,
                          fontSize: "14px",
                          fontWeight: 600,
                          lineHeight: "1.55",
                          padding: "12px 14px",
                          textAlign: "right",
                          verticalAlign: "top",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          ) : null}

          {subtotal || discount || tax ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{ borderCollapse: "collapse", width: "100%" }}
              >
                <tbody>
                  {subtotal ? (
                    <tr>
                      <td
                        style={{
                          color: MUTED_FOREGROUND,
                          fontSize: "13px",
                          lineHeight: "1.6",
                          padding: "4px 0",
                        }}
                      >
                        Subtotal
                      </td>
                      <td
                        style={{
                          color: FOREGROUND,
                          fontSize: "13px",
                          lineHeight: "1.6",
                          padding: "4px 0",
                          textAlign: "right",
                        }}
                      >
                        {subtotal}
                      </td>
                    </tr>
                  ) : null}
                  {discount ? (
                    <tr>
                      <td
                        style={{
                          color: MUTED_FOREGROUND,
                          fontSize: "13px",
                          lineHeight: "1.6",
                          padding: "4px 0",
                        }}
                      >
                        Discount
                      </td>
                      <td
                        style={{
                          color: SUCCESS_DARK,
                          fontSize: "13px",
                          lineHeight: "1.6",
                          padding: "4px 0",
                          textAlign: "right",
                        }}
                      >
                        {discount}
                      </td>
                    </tr>
                  ) : null}
                  {tax ? (
                    <tr>
                      <td
                        style={{
                          color: MUTED_FOREGROUND,
                          fontSize: "13px",
                          lineHeight: "1.6",
                          padding: "4px 0",
                        }}
                      >
                        Tax
                      </td>
                      <td
                        style={{
                          color: FOREGROUND,
                          fontSize: "13px",
                          lineHeight: "1.6",
                          padding: "4px 0",
                          textAlign: "right",
                        }}
                      >
                        {tax}
                      </td>
                    </tr>
                  ) : null}
                  <tr>
                    <td
                      style={{
                        borderTop: `1px solid ${BORDER}`,
                        color: FOREGROUND,
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "1.6",
                        padding: "10px 0 4px 0",
                      }}
                    >
                      Total paid
                    </td>
                    <td
                      style={{
                        borderTop: `1px solid ${BORDER}`,
                        color: FOREGROUND,
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "1.6",
                        padding: "10px 0 4px 0",
                        textAlign: "right",
                      }}
                    >
                      {props.amountTotal}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>
          ) : null}

          {nextBillingDate ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
                  borderLeft: `4px solid ${BRAND_BLUE_DARK}`,
                  borderRadius: "8px",
                  padding: "12px 14px",
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
                  Your subscription renews on{" "}
                  <strong>{nextBillingDate}</strong>. We'll send another
                  receipt at that time.
                </Text>
              </div>
            </Section>
          ) : null}

          {invoiceUrl ? (
            <Section style={{ padding: "20px 32px 8px 32px" }}>
              <Button
                href={invoiceUrl}
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
                View invoice
              </Button>
            </Section>
          ) : null}

          {manageBillingUrl ? (
            <Section
              style={{
                padding: invoiceUrl
                  ? "0 32px 8px 32px"
                  : "20px 32px 8px 32px",
              }}
            >
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                Need to update your payment method or change plans?{" "}
                <a
                  href={manageBillingUrl}
                  style={{
                    color: BRAND_BLUE_DARK,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Manage billing
                </a>
                .
              </Text>
            </Section>
          ) : null}

          <Hr style={{ borderColor: BORDER, margin: "24px 32px 0 32px" }} />

          <Section style={{ padding: "20px 32px 28px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Don't recognize this charge? Contact us right away at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>{" "}
              and reference receipt <strong>{props.receiptNumber}</strong>.
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
            © {new Date().getFullYear()} {productName}. This receipt was sent
            because you have an active billing relationship with us.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

PaymentReceiptEmail.PreviewProps = {
  customerName: "Jane Doe",
  customerEmail: "jane@acme.co",
  receiptNumber: "RCPT-2026-05-02-000847",
  amountTotal: "$49.00",
  paymentDate: "May 2, 2026",
  paymentMethod: "Visa ending in 4242",
  planName: "Pro Monthly",
  currency: "USD",
  lineItems: [
    { description: "SchemaVaults Pro · Monthly subscription", amount: "$49.00" },
    { description: "Additional API requests (2,400)", amount: "$12.00" },
    { description: "Promo credit applied", amount: "-$12.00" },
  ],
  subtotal: "$61.00",
  discount: "-$12.00",
  tax: "$0.00",
  nextBillingDate: "June 2, 2026",
  invoiceUrl: "https://schemavaults.com/billing/invoices/in_1example",
  manageBillingUrl: "https://schemavaults.com/settings/billing",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies PaymentReceiptEmailProps;
