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
  quantity?: number;
  amount: string;
}

export interface PaymentReceiptEmailProps {
  receiptNumber: string;
  paymentDate: string;
  amountTotal: string;
  paymentMethodLabel: string;
  customerName?: string;
  customerEmail?: string;
  lineItems?: PaymentReceiptLineItem[];
  subtotal?: string;
  tax?: string;
  discount?: string;
  currency?: string;
  invoiceUrl?: string;
  manageBillingUrl?: string;
  billingPeriodLabel?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties, so the token hex values are inlined here.
// GREEN values represent a "paid" status accent complementary to the brand blue.
const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const GREEN = "#16a34a";
const GREEN_DARK = "#15803d";
const GREEN_BG = "#f0fdf4";
const GREEN_BORDER = "#bbf7d0";

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
    typeof props.paymentDate !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'paymentDate' in props for PaymentReceiptEmail template!",
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
    typeof props.paymentMethodLabel !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'paymentMethodLabel' in props for PaymentReceiptEmail template!",
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
  const customerLine: string | undefined =
    typeof props.customerEmail === "string" && props.customerEmail.length > 0
      ? typeof props.customerName === "string" && props.customerName.length > 0
        ? `${props.customerName} (${props.customerEmail})`
        : props.customerEmail
      : typeof props.customerName === "string" && props.customerName.length > 0
        ? props.customerName
        : undefined;
  const currency: string =
    typeof props.currency === "string" && props.currency.length > 0
      ? props.currency
      : "USD";
  const billingPeriodLabel: string | undefined =
    typeof props.billingPeriodLabel === "string" &&
    props.billingPeriodLabel.length > 0
      ? props.billingPeriodLabel
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
          (item as PaymentReceiptLineItem).description.length > 0 &&
          typeof (item as PaymentReceiptLineItem).amount === "string" &&
          (item as PaymentReceiptLineItem).amount.length > 0,
      )
    : [];
  const subtotal: string | undefined =
    typeof props.subtotal === "string" && props.subtotal.length > 0
      ? props.subtotal
      : undefined;
  const tax: string | undefined =
    typeof props.tax === "string" && props.tax.length > 0
      ? props.tax
      : undefined;
  const discount: string | undefined =
    typeof props.discount === "string" && props.discount.length > 0
      ? props.discount
      : undefined;

  const previewText = `Receipt ${props.receiptNumber} from ${productName} — ${props.amountTotal} paid on ${props.paymentDate}.`;

  const metaRows: Array<[string, string]> = [
    ["Receipt", props.receiptNumber],
    ["Date paid", props.paymentDate],
  ];
  if (billingPeriodLabel) {
    metaRows.push(["Billing period", billingPeriodLabel]);
  }
  if (customerLine) {
    metaRows.push(["Billed to", customerLine]);
  }
  metaRows.push(["Payment method", props.paymentMethodLabel]);

  const totalsRows: Array<[string, string, boolean]> = [];
  if (subtotal) {
    totalsRows.push(["Subtotal", subtotal, false]);
  }
  if (discount) {
    totalsRows.push(["Discount", `-${discount}`, false]);
  }
  if (tax) {
    totalsRows.push(["Tax", tax, false]);
  }
  totalsRows.push([`Total (${currency})`, props.amountTotal, true]);

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
              {productName} · Receipt
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
              {props.amountTotal} paid
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
              Paid · {props.paymentDate}
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
              Thanks for your payment — we received{" "}
              <strong>{props.amountTotal}</strong> on{" "}
              <strong>{props.paymentDate}</strong>. This email is your receipt;
              keep it for your records.
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: GREEN_BG,
                border: `1px solid ${GREEN_BORDER}`,
                borderLeft: `4px solid ${GREEN_DARK}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: GREEN_DARK,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                Payment status
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                Successful · charged to {props.paymentMethodLabel}
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

          {lineItems.length > 0 ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <Text
                  style={{
                    color: MUTED_FOREGROUND,
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    margin: 0,
                    padding: "12px 16px 8px 16px",
                    textTransform: "uppercase",
                  }}
                >
                  Items
                </Text>
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    borderCollapse: "collapse",
                    width: "100%",
                  }}
                >
                  <tbody>
                    {lineItems.map((item, idx) => {
                      const qty: number | undefined =
                        typeof item.quantity === "number" &&
                        Number.isFinite(item.quantity) &&
                        item.quantity > 1
                          ? Math.floor(item.quantity)
                          : undefined;
                      const isLast = idx === lineItems.length - 1;
                      return (
                        <tr key={`${item.description}-${idx}`}>
                          <td
                            style={{
                              borderTop:
                                idx === 0 ? "none" : `1px solid ${BORDER}`,
                              color: FOREGROUND,
                              fontSize: "13px",
                              lineHeight: "1.55",
                              padding: `10px 12px 10px 16px${
                                isLast ? "" : ""
                              }`,
                              verticalAlign: "top",
                            }}
                          >
                            {item.description}
                            {qty ? (
                              <span
                                style={{
                                  color: MUTED_FOREGROUND,
                                  fontSize: "12px",
                                  marginLeft: "6px",
                                }}
                              >
                                × {qty}
                              </span>
                            ) : null}
                          </td>
                          <td
                            style={{
                              borderTop:
                                idx === 0 ? "none" : `1px solid ${BORDER}`,
                              color: FOREGROUND,
                              fontSize: "13px",
                              fontWeight: 500,
                              lineHeight: "1.55",
                              padding: "10px 16px 10px 12px",
                              textAlign: "right",
                              verticalAlign: "top",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.amount}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "16px 32px 8px 32px" }}>
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              style={{ borderCollapse: "collapse", width: "100%" }}
            >
              <tbody>
                {totalsRows.map(([label, value, emphasized], idx) => (
                  <tr key={`${label}-${idx}`}>
                    <td
                      style={{
                        borderTop: emphasized
                          ? `1px solid ${BORDER}`
                          : "none",
                        color: emphasized ? FOREGROUND : MUTED_FOREGROUND,
                        fontSize: emphasized ? "15px" : "13px",
                        fontWeight: emphasized ? 700 : 400,
                        lineHeight: "1.6",
                        padding: emphasized
                          ? "10px 12px 4px 0"
                          : "4px 12px 4px 0",
                        textTransform: emphasized ? "none" : "none",
                        verticalAlign: "top",
                      }}
                    >
                      {label}
                    </td>
                    <td
                      style={{
                        borderTop: emphasized
                          ? `1px solid ${BORDER}`
                          : "none",
                        color: FOREGROUND,
                        fontSize: emphasized ? "15px" : "13px",
                        fontWeight: emphasized ? 700 : 500,
                        lineHeight: "1.6",
                        padding: emphasized ? "10px 0 4px 0" : "4px 0",
                        textAlign: "right",
                        verticalAlign: "top",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {invoiceUrl ? (
            <>
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
                    href={invoiceUrl}
                    style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                  >
                    {invoiceUrl}
                  </a>
                </Text>
              </Section>
            </>
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
                  Need to update your payment method or download past invoices?
                  Visit your{" "}
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
            email because a payment was processed on your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

PaymentReceiptEmail.PreviewProps = {
  receiptNumber: "RCPT-2026-04017",
  paymentDate: "Apr 28, 2026",
  amountTotal: "$87.45",
  paymentMethodLabel: "Visa ending in 4242",
  customerName: "Jane Doe",
  customerEmail: "jane@acme.co",
  lineItems: [
    {
      description: "SchemaVaults Pro — monthly",
      quantity: 1,
      amount: "$29.00",
    },
    {
      description: "Additional team seats",
      quantity: 3,
      amount: "$45.00",
    },
    {
      description: "API request overage (12,500 requests)",
      amount: "$6.25",
    },
  ],
  subtotal: "$80.25",
  tax: "$7.20",
  currency: "USD",
  invoiceUrl: "https://schemavaults.com/billing/invoices/in_3Q4XR2",
  manageBillingUrl: "https://schemavaults.com/account/billing",
  billingPeriodLabel: "Apr 1 – Apr 30, 2026",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies PaymentReceiptEmailProps;
