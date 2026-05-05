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
  unitPrice?: string;
  amount: string;
}

export interface PaymentReceiptEmailProps {
  recipientName?: string;
  receiptNumber: string;
  paidAt: string;
  amountPaid: string;
  planName?: string;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  paymentMethodBrand?: string;
  paymentMethodLast4?: string;
  lineItems?: PaymentReceiptLineItem[];
  subtotal?: string;
  tax?: string;
  invoiceUrl?: string;
  manageBillingUrl?: string;
  billingAddress?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties or oklch(), so the token values are inlined as hex.
// EMERALD palette is used to convey successful payment, complementing the SchemaVaults blue brand.
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
const EMERALD_FOREGROUND = "#064e3b";

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
    typeof props.paidAt !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'paidAt' in props for PaymentReceiptEmail template!",
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
  const billingPeriodStart: string | undefined =
    typeof props.billingPeriodStart === "string" &&
    props.billingPeriodStart.length > 0
      ? props.billingPeriodStart
      : undefined;
  const billingPeriodEnd: string | undefined =
    typeof props.billingPeriodEnd === "string" &&
    props.billingPeriodEnd.length > 0
      ? props.billingPeriodEnd
      : undefined;
  const paymentMethodBrand: string | undefined =
    typeof props.paymentMethodBrand === "string" &&
    props.paymentMethodBrand.length > 0
      ? props.paymentMethodBrand
      : undefined;
  const paymentMethodLast4: string | undefined =
    typeof props.paymentMethodLast4 === "string" &&
    props.paymentMethodLast4.length > 0
      ? props.paymentMethodLast4
      : undefined;
  const subtotal: string | undefined =
    typeof props.subtotal === "string" && props.subtotal.length > 0
      ? props.subtotal
      : undefined;
  const tax: string | undefined =
    typeof props.tax === "string" && props.tax.length > 0 ? props.tax : undefined;
  const invoiceUrl: string | undefined =
    typeof props.invoiceUrl === "string" && props.invoiceUrl.length > 0
      ? props.invoiceUrl
      : undefined;
  const manageBillingUrl: string | undefined =
    typeof props.manageBillingUrl === "string" &&
    props.manageBillingUrl.length > 0
      ? props.manageBillingUrl
      : undefined;
  const billingAddress: string | undefined =
    typeof props.billingAddress === "string" && props.billingAddress.length > 0
      ? props.billingAddress
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

  const billingPeriodLabel: string | undefined =
    billingPeriodStart && billingPeriodEnd
      ? `${billingPeriodStart} – ${billingPeriodEnd}`
      : billingPeriodStart ?? billingPeriodEnd;

  const paymentMethodLabel: string | undefined =
    paymentMethodBrand && paymentMethodLast4
      ? `${paymentMethodBrand} ending in ${paymentMethodLast4}`
      : paymentMethodBrand
        ? paymentMethodBrand
        : paymentMethodLast4
          ? `Card ending in ${paymentMethodLast4}`
          : undefined;

  const previewText: string = planName
    ? `Payment received — ${props.amountPaid} for ${planName}. Receipt ${props.receiptNumber}.`
    : `Payment received — ${props.amountPaid}. Receipt ${props.receiptNumber}.`;

  const metaRows: Array<[string, string]> = [
    ["Receipt #", props.receiptNumber],
    ["Date paid", props.paidAt],
  ];
  if (planName) {
    metaRows.push(["Plan", planName]);
  }
  if (billingPeriodLabel) {
    metaRows.push(["Billing period", billingPeriodLabel]);
  }
  if (paymentMethodLabel) {
    metaRows.push(["Payment method", paymentMethodLabel]);
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
              Payment received — thank you!
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
              Paid · {props.amountPaid}
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
              We&apos;ve received your payment of{" "}
              <strong>{props.amountPaid}</strong>
              {planName ? (
                <>
                  {" "}for <strong>{planName}</strong>
                </>
              ) : null}
              . This email is your receipt — keep it for your records.
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

          {lineItems.length > 0 ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  border: `1px solid ${BORDER}`,
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{ borderCollapse: "collapse", width: "100%" }}
                >
                  <thead>
                    <tr style={{ backgroundColor: PANEL_BG }}>
                      <th
                        style={{
                          color: MUTED_FOREGROUND,
                          fontSize: "11px",
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                          padding: "10px 14px",
                          textAlign: "left",
                          textTransform: "uppercase",
                        }}
                      >
                        Description
                      </th>
                      <th
                        style={{
                          color: MUTED_FOREGROUND,
                          fontSize: "11px",
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                          padding: "10px 14px",
                          textAlign: "right",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, idx) => {
                      const detailParts: string[] = [];
                      if (
                        typeof item.quantity === "number" &&
                        Number.isFinite(item.quantity) &&
                        item.quantity !== 1
                      ) {
                        detailParts.push(`Qty ${item.quantity}`);
                      }
                      if (
                        typeof item.unitPrice === "string" &&
                        item.unitPrice.length > 0
                      ) {
                        detailParts.push(`${item.unitPrice} each`);
                      }
                      const detail: string | undefined =
                        detailParts.length > 0
                          ? detailParts.join(" · ")
                          : undefined;
                      return (
                        <tr key={`${item.description}-${idx}`}>
                          <td
                            style={{
                              borderTop: `1px solid ${BORDER}`,
                              color: FOREGROUND,
                              fontSize: "14px",
                              lineHeight: "1.5",
                              padding: "12px 14px",
                              verticalAlign: "top",
                            }}
                          >
                            <div style={{ fontWeight: 500 }}>
                              {item.description}
                            </div>
                            {detail ? (
                              <div
                                style={{
                                  color: MUTED_FOREGROUND,
                                  fontSize: "12px",
                                  marginTop: "2px",
                                }}
                              >
                                {detail}
                              </div>
                            ) : null}
                          </td>
                          <td
                            style={{
                              borderTop: `1px solid ${BORDER}`,
                              color: FOREGROUND,
                              fontSize: "14px",
                              fontWeight: 500,
                              padding: "12px 14px",
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
                  <tfoot>
                    {subtotal ? (
                      <tr>
                        <td
                          style={{
                            borderTop: `1px solid ${BORDER}`,
                            color: MUTED_FOREGROUND,
                            fontSize: "13px",
                            padding: "10px 14px",
                            textAlign: "right",
                          }}
                        >
                          Subtotal
                        </td>
                        <td
                          style={{
                            borderTop: `1px solid ${BORDER}`,
                            color: FOREGROUND,
                            fontSize: "13px",
                            fontWeight: 500,
                            padding: "10px 14px",
                            textAlign: "right",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {subtotal}
                        </td>
                      </tr>
                    ) : null}
                    {tax ? (
                      <tr>
                        <td
                          style={{
                            color: MUTED_FOREGROUND,
                            fontSize: "13px",
                            padding: "4px 14px 10px 14px",
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
                            padding: "4px 14px 10px 14px",
                            textAlign: "right",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {tax}
                        </td>
                      </tr>
                    ) : null}
                    <tr style={{ backgroundColor: EMERALD_BG }}>
                      <td
                        style={{
                          borderTop: `1px solid ${EMERALD_BORDER}`,
                          color: EMERALD_FOREGROUND,
                          fontSize: "14px",
                          fontWeight: 700,
                          padding: "12px 14px",
                          textAlign: "right",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Total paid
                      </td>
                      <td
                        style={{
                          borderTop: `1px solid ${EMERALD_BORDER}`,
                          color: EMERALD_FOREGROUND,
                          fontSize: "16px",
                          fontWeight: 700,
                          padding: "12px 14px",
                          textAlign: "right",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {props.amountPaid}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Section>
          ) : null}

          {billingAddress ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
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
                    color: MUTED_FOREGROUND,
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    margin: "0 0 4px 0",
                    textTransform: "uppercase",
                  }}
                >
                  Billed to
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.55",
                    margin: 0,
                    whiteSpace: "pre-line",
                  }}
                >
                  {billingAddress}
                </Text>
              </div>
            </Section>
          ) : null}

          {invoiceUrl ? (
            <Section style={{ padding: "20px 32px 8px 32px" }}>
              <Button
                href={invoiceUrl}
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
                Download invoice
              </Button>
            </Section>
          ) : null}

          {invoiceUrl ? (
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
                  style={{ color: EMERALD_DARK, textDecoration: "none" }}
                >
                  {invoiceUrl}
                </a>
              </Text>
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
                  Need to update payment details, change plans, or view past
                  receipts? Visit your{" "}
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
  recipientName: "Jane Doe",
  receiptNumber: "RC-2026-0042",
  paidAt: "May 5, 2026",
  amountPaid: "$45.00 USD",
  planName: "Pro · Monthly",
  billingPeriodStart: "May 5, 2026",
  billingPeriodEnd: "Jun 4, 2026",
  paymentMethodBrand: "Visa",
  paymentMethodLast4: "4242",
  lineItems: [
    {
      description: "SchemaVaults Pro — Monthly subscription",
      quantity: 1,
      unitPrice: "$29.00",
      amount: "$29.00",
    },
    {
      description: "Additional team seat",
      quantity: 2,
      unitPrice: "$8.00",
      amount: "$16.00",
    },
  ],
  subtotal: "$45.00",
  tax: "$0.00",
  invoiceUrl: "https://schemavaults.com/billing/invoices/RC-2026-0042.pdf",
  manageBillingUrl: "https://schemavaults.com/account/billing",
  billingAddress: "Acme Platform, Inc.\n221B Baker Street\nLondon NW1 6XE",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies PaymentReceiptEmailProps;
