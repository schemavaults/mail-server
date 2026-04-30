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
  receiptNumber: string;
  total: string;
  paidAt: string;
  customerName?: string;
  customerEmail?: string;
  description?: string;
  lineItems?: PaymentReceiptLineItem[];
  subtotal?: string;
  tax?: string;
  paymentMethod?: string;
  viewReceiptUrl?: string;
  manageBillingUrl?: string;
  nextBillingDate?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties, so the token hex values are inlined here.
// EMERALD values approximate a "paid / success" accent on top of the brand-blue palette.
const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const EMERALD = "#10b981";
const EMERALD_DARK = "#047857";
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
    typeof props.total !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'total' in props for PaymentReceiptEmail template!",
    );
  }
  if (
    typeof props.paidAt !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'paidAt' in props for PaymentReceiptEmail template!",
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
  const description: string | undefined =
    typeof props.description === "string" && props.description.length > 0
      ? props.description
      : undefined;
  const subtotal: string | undefined =
    typeof props.subtotal === "string" && props.subtotal.length > 0
      ? props.subtotal
      : undefined;
  const tax: string | undefined =
    typeof props.tax === "string" && props.tax.length > 0
      ? props.tax
      : undefined;
  const paymentMethod: string | undefined =
    typeof props.paymentMethod === "string" && props.paymentMethod.length > 0
      ? props.paymentMethod
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
  const nextBillingDate: string | undefined =
    typeof props.nextBillingDate === "string" &&
    props.nextBillingDate.length > 0
      ? props.nextBillingDate
      : undefined;
  const customerEmail: string | undefined =
    typeof props.customerEmail === "string" && props.customerEmail.length > 0
      ? props.customerEmail
      : undefined;

  const lineItems: PaymentReceiptLineItem[] = Array.isArray(props.lineItems)
    ? props.lineItems.filter(
        (item): item is PaymentReceiptLineItem =>
          !!item &&
          typeof item === "object" &&
          typeof (item as PaymentReceiptLineItem).description === "string" &&
          (item as PaymentReceiptLineItem).description.length > 0 &&
          typeof (item as PaymentReceiptLineItem).amount === "string" &&
          (item as PaymentReceiptLineItem).amount.length > 0,
      )
    : [];

  const previewText: string = `Payment received — ${props.total} for ${productName} (receipt ${props.receiptNumber}).`;

  const metaRows: Array<[string, string]> = [
    ["Receipt", props.receiptNumber],
    ["Paid on", props.paidAt],
  ];
  if (customerEmail) {
    metaRows.push(["Billed to", customerEmail]);
  }
  if (paymentMethod) {
    metaRows.push(["Payment method", paymentMethod]);
  }

  const totalsRows: Array<[string, string, boolean]> = [];
  if (subtotal) {
    totalsRows.push(["Subtotal", subtotal, false]);
  }
  if (tax) {
    totalsRows.push(["Tax", tax, false]);
  }
  totalsRows.push(["Total paid", props.total, true]);

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
                margin: "8px 0 12px 0",
              }}
            >
              Thanks — your payment was received.
            </Heading>
            <span
              style={{
                backgroundColor: EMERALD_BG,
                border: `1px solid ${EMERALD_BORDER}`,
                borderRadius: "999px",
                color: EMERALD_FOREGROUND,
                display: "inline-block",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                padding: "4px 12px",
                textTransform: "uppercase",
              }}
            >
              ✓ Paid
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
              We've received your payment for {productName}. Keep this email as
              your receipt — a copy is also available in your billing history.
            </Text>
          </Section>

          {description ? (
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
                  Summary
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  {description}
                </Text>
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 4px 32px" }}>
            <div
              style={{
                backgroundColor: EMERALD_BG,
                border: `1px solid ${EMERALD_BORDER}`,
                borderRadius: "10px",
                padding: "18px 20px",
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  color: EMERALD_FOREGROUND,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                Amount paid
              </Text>
              <Text
                style={{
                  color: EMERALD_DARK,
                  fontSize: "32px",
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  lineHeight: "1.1",
                  margin: "4px 0 0 0",
                }}
              >
                {props.total}
              </Text>
            </div>
          </Section>

          <Section style={{ padding: "16px 32px 4px 32px" }}>
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
                        borderTop:
                          idx === 0 ? "none" : `1px solid ${BORDER}`,
                      }}
                    >
                      <td
                        style={{
                          color: FOREGROUND,
                          fontSize: "14px",
                          lineHeight: "1.5",
                          padding: "12px 14px",
                          verticalAlign: "top",
                        }}
                      >
                        {item.description}
                      </td>
                      <td
                        style={{
                          color: FOREGROUND,
                          fontSize: "14px",
                          fontWeight: 600,
                          lineHeight: "1.5",
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

          <Section style={{ padding: "16px 32px 0 32px" }}>
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              style={{ borderCollapse: "collapse", width: "100%" }}
            >
              <tbody>
                {totalsRows.map(([label, value, isTotal], idx) => (
                  <tr
                    key={label}
                    style={{
                      borderTop:
                        isTotal && idx > 0 ? `1px solid ${BORDER}` : "none",
                    }}
                  >
                    <td
                      style={{
                        color: isTotal ? FOREGROUND : MUTED_FOREGROUND,
                        fontSize: isTotal ? "15px" : "13px",
                        fontWeight: isTotal ? 700 : 400,
                        lineHeight: "1.6",
                        padding: isTotal ? "10px 0 4px 0" : "4px 0",
                        textAlign: "right",
                      }}
                    >
                      {label}
                    </td>
                    <td
                      style={{
                        color: isTotal ? FOREGROUND : MUTED_FOREGROUND,
                        fontSize: isTotal ? "16px" : "13px",
                        fontWeight: isTotal ? 700 : 500,
                        lineHeight: "1.6",
                        padding: isTotal ? "10px 0 4px 0" : "4px 0",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                        width: "120px",
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
            <Section style={{ padding: "20px 32px 4px 32px" }}>
              <Button
                href={viewReceiptUrl}
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
                View receipt
              </Button>
            </Section>
          ) : null}

          {viewReceiptUrl ? (
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
                  href={viewReceiptUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  {viewReceiptUrl}
                </a>
              </Text>
            </Section>
          ) : null}

          {nextBillingDate || manageBillingUrl ? (
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
                  {nextBillingDate ? (
                    <>
                      Your next charge is scheduled for{" "}
                      <strong>{nextBillingDate}</strong>.
                      {manageBillingUrl ? " " : null}
                    </>
                  ) : null}
                  {manageBillingUrl ? (
                    <>
                      Need to update payment details or cancel? Visit your{" "}
                      <a
                        href={manageBillingUrl}
                        style={{
                          color: BRAND_BLUE_DARK,
                          textDecoration: "none",
                        }}
                      >
                        billing settings
                      </a>
                      .
                    </>
                  ) : null}
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
              Questions about this charge or need a refund? Reply to this email
              or reach us at{" "}
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
            email because a payment was made on your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

PaymentReceiptEmail.PreviewProps = {
  receiptNumber: "RCPT-2026-04-30-00427",
  total: "$31.32",
  paidAt: "Apr 30, 2026 14:08 UTC",
  customerName: "Jane Doe",
  customerEmail: "jane@acme.co",
  description:
    "Monthly subscription to the SchemaVaults Pro plan — billed for the period of Apr 30 – May 30, 2026.",
  lineItems: [
    {
      description: "SchemaVaults Pro · Monthly subscription",
      amount: "$29.00",
    },
    {
      description: "Additional team seat (1 × $5.00)",
      amount: "$5.00",
    },
    {
      description: "Promotional credit",
      amount: "−$5.00",
    },
  ],
  subtotal: "$29.00",
  tax: "$2.32",
  paymentMethod: "Visa ending in 4242",
  viewReceiptUrl:
    "https://schemavaults.com/account/billing/receipts/RCPT-2026-04-30-00427",
  manageBillingUrl: "https://schemavaults.com/account/billing",
  nextBillingDate: "May 30, 2026",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies PaymentReceiptEmailProps;
