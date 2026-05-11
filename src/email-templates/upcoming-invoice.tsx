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

export interface UpcomingInvoiceEmailProps {
  name: string;
  amount: string;
  chargeDate: string;
  manageBillingUrl: string;
  planName?: string;
  billingPeriod?: string;
  paymentMethod?: string;
  invoiceNumber?: string;
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
const ACCENT_BG = "#eff6ff";

export default function UpcomingInvoiceEmail(
  props: UpcomingInvoiceEmailProps,
): ReactElement {
  if (
    typeof props.name !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'name' in props for UpcomingInvoiceEmail template!",
    );
  }
  if (
    typeof props.amount !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'amount' in props for UpcomingInvoiceEmail template!",
    );
  }
  if (
    typeof props.chargeDate !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'chargeDate' in props for UpcomingInvoiceEmail template!",
    );
  }
  if (
    typeof props.manageBillingUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'manageBillingUrl' in props for UpcomingInvoiceEmail template!",
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
  const invoiceNumber: string | undefined =
    typeof props.invoiceNumber === "string" && props.invoiceNumber.length > 0
      ? props.invoiceNumber
      : undefined;

  const previewText = `Heads up — your ${productName} subscription renews ${props.chargeDate} for ${props.amount}.`;

  const metaRows: Array<[string, string]> = [];
  if (planName) {
    metaRows.push(["Plan", planName]);
  }
  if (billingPeriod) {
    metaRows.push(["Billing period", billingPeriod]);
  }
  if (paymentMethod) {
    metaRows.push(["Payment method", paymentMethod]);
  }
  if (invoiceNumber) {
    metaRows.push(["Invoice", invoiceNumber]);
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
              {productName} · Billing
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
              Your subscription renews on {props.chargeDate}.
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
              Hi {props.name},
            </Text>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "15px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              This is a friendly heads-up that we'll automatically charge your
              payment method on file for the next {productName} billing cycle.
              No action is needed if everything looks right.
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <div
              style={{
                backgroundColor: ACCENT_BG,
                border: `1px solid ${BORDER}`,
                borderLeft: `4px solid ${BRAND_BLUE_DARK}`,
                borderRadius: "8px",
                padding: "18px 20px",
              }}
            >
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  margin: "0 0 6px 0",
                  textTransform: "uppercase",
                }}
              >
                Amount due
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "28px",
                  fontWeight: 700,
                  lineHeight: "1.1",
                  margin: 0,
                }}
              >
                {props.amount}
              </Text>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.5",
                  margin: "6px 0 0 0",
                }}
              >
                Charges on {props.chargeDate}
              </Text>
            </div>
          </Section>

          {metaRows.length > 0 ? (
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
          ) : null}

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={props.manageBillingUrl}
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
              Manage billing
            </Button>
          </Section>

          <Section style={{ padding: "8px 32px 8px 32px" }}>
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
                Need to make a change?
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                You can update your payment method, change your plan, or cancel
                your subscription anytime before {props.chargeDate} from your
                billing settings.
              </Text>
            </div>
          </Section>

          <Section style={{ padding: "8px 32px 24px 32px" }}>
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
                href={props.manageBillingUrl}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {props.manageBillingUrl}
              </a>
            </Text>
          </Section>

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
              Questions about this charge? Reach us at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>
              . We're happy to help.
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
            © {new Date().getFullYear()} {productName}. You're receiving this
            invoice notice because you have an active subscription.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

UpcomingInvoiceEmail.PreviewProps = {
  name: "Jane Doe",
  amount: "$29.00 USD",
  chargeDate: "Jun 1, 2026",
  planName: "Team — Annual",
  billingPeriod: "Jun 1, 2026 – Jun 1, 2027",
  paymentMethod: "Visa ending in 4242",
  invoiceNumber: "INV-2026-0427",
  manageBillingUrl: "https://schemavaults.com/account/billing",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies UpcomingInvoiceEmailProps;
