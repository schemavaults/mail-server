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
  customerName: string;
  invoiceNumber: string;
  paymentDate: string;
  amountPaid: string;
  lineItems: PaymentReceiptLineItem[];
  subtotal?: string;
  tax?: string;
  discount?: string;
  paymentMethod?: string;
  billingPeriod?: string;
  invoiceUrl?: string;
  manageBillingUrl?: string;
  productName?: string;
  supportEmail?: string;
  companyAddress?: string;
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
const SUCCESS_GREEN = "#16a34a";
const SUCCESS_GREEN_DARK = "#15803d";
const SUCCESS_BG = "#f0fdf4";
const SUCCESS_BORDER = "#bbf7d0";

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
    typeof props.invoiceNumber !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'invoiceNumber' in props for PaymentReceiptEmail template!",
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
    typeof props.amountPaid !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'amountPaid' in props for PaymentReceiptEmail template!",
    );
  }
  if (
    !Array.isArray(props.lineItems) &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'lineItems' in props for PaymentReceiptEmail template!",
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
  const lineItems: PaymentReceiptLineItem[] = Array.isArray(props.lineItems)
    ? props.lineItems
    : [];
  const invoiceUrl: string | undefined =
    typeof props.invoiceUrl === "string" && props.invoiceUrl.length > 0
      ? props.invoiceUrl
      : undefined;
  const manageBillingUrl: string | undefined =
    typeof props.manageBillingUrl === "string" &&
    props.manageBillingUrl.length > 0
      ? props.manageBillingUrl
      : undefined;
  const paymentMethod: string | undefined =
    typeof props.paymentMethod === "string" && props.paymentMethod.length > 0
      ? props.paymentMethod
      : undefined;
  const billingPeriod: string | undefined =
    typeof props.billingPeriod === "string" && props.billingPeriod.length > 0
      ? props.billingPeriod
      : undefined;
  const subtotal: string | undefined =
    typeof props.subtotal === "string" && props.subtotal.length > 0
      ? props.subtotal
      : undefined;
  const tax: string | undefined =
    typeof props.tax === "string" && props.tax.length > 0 ? props.tax : undefined;
  const discount: string | undefined =
    typeof props.discount === "string" && props.discount.length > 0
      ? props.discount
      : undefined;
  const companyAddress: string | undefined =
    typeof props.companyAddress === "string" && props.companyAddress.length > 0
      ? props.companyAddress
      : undefined;

  const previewText = `Receipt ${props.invoiceNumber} from ${productName} — ${props.amountPaid} paid on ${props.paymentDate}.`;

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
            maxWidth: "600px",
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
              Payment received
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
              Invoice {props.invoiceNumber}
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
              Hi {props.customerName},
            </Text>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "15px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Thanks for your payment. This email confirms we received{" "}
              <strong>{props.amountPaid}</strong> on{" "}
              <strong>{props.paymentDate}</strong>
              {billingPeriod ? (
                <>
                  {" "}
                  for the billing period <strong>{billingPeriod}</strong>
                </>
              ) : null}
              . A summary of your charges is below for your records.
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <div
              style={{
                backgroundColor: SUCCESS_BG,
                border: `1px solid ${SUCCESS_BORDER}`,
                borderLeft: `4px solid ${SUCCESS_GREEN}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: SUCCESS_GREEN_DARK,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                Paid in full
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "20px",
                  fontWeight: 700,
                  lineHeight: "1.3",
                  margin: 0,
                }}
              >
                {props.amountPaid}
              </Text>
            </div>
          </Section>

          <Section style={{ padding: "20px 32px 0 32px" }}>
            <Heading
              as="h2"
              style={{
                color: FOREGROUND,
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                margin: "0 0 10px 0",
                textTransform: "uppercase",
              }}
            >
              Order summary
            </Heading>
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              style={{
                borderCollapse: "collapse",
                width: "100%",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      borderBottom: `1px solid ${BORDER}`,
                      color: MUTED_FOREGROUND,
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      padding: "8px 8px 8px 0",
                      textAlign: "left",
                      textTransform: "uppercase",
                    }}
                  >
                    Description
                  </th>
                  <th
                    style={{
                      borderBottom: `1px solid ${BORDER}`,
                      color: MUTED_FOREGROUND,
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      padding: "8px 8px",
                      textAlign: "right",
                      textTransform: "uppercase",
                      width: "60px",
                    }}
                  >
                    Qty
                  </th>
                  <th
                    style={{
                      borderBottom: `1px solid ${BORDER}`,
                      color: MUTED_FOREGROUND,
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      padding: "8px 0 8px 8px",
                      textAlign: "right",
                      textTransform: "uppercase",
                      width: "100px",
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => (
                  <tr key={`${item.description}-${idx}`}>
                    <td
                      style={{
                        borderBottom: `1px solid ${BORDER}`,
                        color: FOREGROUND,
                        fontSize: "14px",
                        lineHeight: "1.5",
                        padding: "12px 8px 12px 0",
                        verticalAlign: "top",
                      }}
                    >
                      {item.description}
                    </td>
                    <td
                      style={{
                        borderBottom: `1px solid ${BORDER}`,
                        color: MUTED_FOREGROUND,
                        fontSize: "14px",
                        lineHeight: "1.5",
                        padding: "12px 8px",
                        textAlign: "right",
                        verticalAlign: "top",
                      }}
                    >
                      {typeof item.quantity === "number" ? item.quantity : 1}
                    </td>
                    <td
                      style={{
                        borderBottom: `1px solid ${BORDER}`,
                        color: FOREGROUND,
                        fontSize: "14px",
                        fontWeight: 500,
                        lineHeight: "1.5",
                        padding: "12px 0 12px 8px",
                        textAlign: "right",
                        verticalAlign: "top",
                      }}
                    >
                      {item.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {subtotal ? (
                  <tr>
                    <td
                      colSpan={2}
                      style={{
                        color: MUTED_FOREGROUND,
                        fontSize: "13px",
                        lineHeight: "1.6",
                        padding: "10px 8px 4px 0",
                        textAlign: "right",
                      }}
                    >
                      Subtotal
                    </td>
                    <td
                      style={{
                        color: FOREGROUND,
                        fontSize: "13px",
                        fontWeight: 500,
                        lineHeight: "1.6",
                        padding: "10px 0 4px 8px",
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
                      colSpan={2}
                      style={{
                        color: MUTED_FOREGROUND,
                        fontSize: "13px",
                        lineHeight: "1.6",
                        padding: "4px 8px 4px 0",
                        textAlign: "right",
                      }}
                    >
                      Discount
                    </td>
                    <td
                      style={{
                        color: SUCCESS_GREEN_DARK,
                        fontSize: "13px",
                        fontWeight: 500,
                        lineHeight: "1.6",
                        padding: "4px 0 4px 8px",
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
                      colSpan={2}
                      style={{
                        color: MUTED_FOREGROUND,
                        fontSize: "13px",
                        lineHeight: "1.6",
                        padding: "4px 8px 4px 0",
                        textAlign: "right",
                      }}
                    >
                      Tax
                    </td>
                    <td
                      style={{
                        color: FOREGROUND,
                        fontSize: "13px",
                        fontWeight: 500,
                        lineHeight: "1.6",
                        padding: "4px 0 4px 8px",
                        textAlign: "right",
                      }}
                    >
                      {tax}
                    </td>
                  </tr>
                ) : null}
                <tr>
                  <td
                    colSpan={2}
                    style={{
                      borderTop: `1px solid ${BORDER}`,
                      color: FOREGROUND,
                      fontSize: "14px",
                      fontWeight: 700,
                      lineHeight: "1.6",
                      padding: "10px 8px 0 0",
                      textAlign: "right",
                    }}
                  >
                    Total paid
                  </td>
                  <td
                    style={{
                      borderTop: `1px solid ${BORDER}`,
                      color: FOREGROUND,
                      fontSize: "16px",
                      fontWeight: 700,
                      lineHeight: "1.6",
                      padding: "10px 0 0 8px",
                      textAlign: "right",
                    }}
                  >
                    {props.amountPaid}
                  </td>
                </tr>
              </tfoot>
            </table>
          </Section>

          {paymentMethod || billingPeriod ? (
            <Section style={{ padding: "20px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{ borderCollapse: "collapse", width: "100%" }}
                >
                  <tbody>
                    {paymentMethod ? (
                      <tr>
                        <td
                          style={{
                            color: MUTED_FOREGROUND,
                            fontSize: "13px",
                            lineHeight: "1.6",
                            padding: "2px 12px 2px 0",
                            verticalAlign: "top",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Payment method
                        </td>
                        <td
                          style={{
                            color: FOREGROUND,
                            fontSize: "13px",
                            fontWeight: 500,
                            lineHeight: "1.6",
                            padding: "2px 0",
                            verticalAlign: "top",
                          }}
                        >
                          {paymentMethod}
                        </td>
                      </tr>
                    ) : null}
                    {billingPeriod ? (
                      <tr>
                        <td
                          style={{
                            color: MUTED_FOREGROUND,
                            fontSize: "13px",
                            lineHeight: "1.6",
                            padding: "2px 12px 2px 0",
                            verticalAlign: "top",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Billing period
                        </td>
                        <td
                          style={{
                            color: FOREGROUND,
                            fontSize: "13px",
                            fontWeight: 500,
                            lineHeight: "1.6",
                            padding: "2px 0",
                            verticalAlign: "top",
                          }}
                        >
                          {billingPeriod}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
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
            <Section style={{ padding: "8px 32px 24px 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                Need to update payment details or download past invoices? Visit
                your{" "}
                <a
                  href={manageBillingUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  billing settings
                </a>
                .
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
              Questions about this charge? Reply to this email or reach us at{" "}
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

        <Container style={{ margin: "16px auto 0 auto", maxWidth: "600px" }}>
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
            to the billing contact on file for your account.
          </Text>
          {companyAddress ? (
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "12px",
                lineHeight: "1.5",
                margin: "4px 0 0 0",
                textAlign: "center",
              }}
            >
              {companyAddress}
            </Text>
          ) : null}
        </Container>
      </Body>
    </Html>
  );
}

PaymentReceiptEmail.PreviewProps = {
  customerName: "Jane Doe",
  invoiceNumber: "INV-2026-0419",
  paymentDate: "May 1, 2026",
  amountPaid: "$32.00",
  lineItems: [
    {
      description: "SchemaVaults Pro — monthly subscription",
      quantity: 1,
      amount: "$29.00",
    },
    {
      description: "Additional team seat",
      quantity: 1,
      amount: "$5.00",
    },
  ],
  subtotal: "$34.00",
  discount: "-$5.00",
  tax: "$3.00",
  paymentMethod: "Visa ending in 4242",
  billingPeriod: "May 1, 2026 – Jun 1, 2026",
  invoiceUrl: "https://schemavaults.com/billing/invoices/INV-2026-0419",
  manageBillingUrl: "https://schemavaults.com/account/billing",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
  companyAddress: "SchemaVaults, Inc. · 548 Market St #95103 · San Francisco, CA 94104",
} satisfies PaymentReceiptEmailProps;
