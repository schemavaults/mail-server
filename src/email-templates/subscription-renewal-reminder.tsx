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

export interface SubscriptionRenewalReminderEmailProps {
  customerName: string;
  planName: string;
  renewalDate: string;
  renewalAmount: string;
  manageSubscriptionUrl: string;
  billingInterval?: string;
  paymentMethodBrand?: string;
  paymentMethodLast4?: string;
  nextInvoiceUrl?: string;
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

export default function SubscriptionRenewalReminderEmail(
  props: SubscriptionRenewalReminderEmailProps,
): ReactElement {
  if (
    typeof props.customerName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'customerName' in props for SubscriptionRenewalReminderEmail template!",
    );
  }
  if (
    typeof props.planName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'planName' in props for SubscriptionRenewalReminderEmail template!",
    );
  }
  if (
    typeof props.renewalDate !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'renewalDate' in props for SubscriptionRenewalReminderEmail template!",
    );
  }
  if (
    typeof props.renewalAmount !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'renewalAmount' in props for SubscriptionRenewalReminderEmail template!",
    );
  }
  if (
    typeof props.manageSubscriptionUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'manageSubscriptionUrl' in props for SubscriptionRenewalReminderEmail template!",
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
  const billingInterval: string | undefined =
    typeof props.billingInterval === "string" &&
    props.billingInterval.length > 0
      ? props.billingInterval
      : undefined;
  const paymentMethodLast4: string | undefined =
    typeof props.paymentMethodLast4 === "string" &&
    props.paymentMethodLast4.length > 0
      ? props.paymentMethodLast4
      : undefined;
  const paymentMethodBrand: string | undefined =
    typeof props.paymentMethodBrand === "string" &&
    props.paymentMethodBrand.length > 0
      ? props.paymentMethodBrand
      : undefined;
  const nextInvoiceUrl: string | undefined =
    typeof props.nextInvoiceUrl === "string" && props.nextInvoiceUrl.length > 0
      ? props.nextInvoiceUrl
      : undefined;

  const paymentMethodLabel: string | undefined = paymentMethodLast4
    ? paymentMethodBrand
      ? `${paymentMethodBrand} ending in ${paymentMethodLast4}`
      : `Card ending in ${paymentMethodLast4}`
    : undefined;

  const previewText = `Your ${productName} ${props.planName} plan renews on ${props.renewalDate} for ${props.renewalAmount}.`;

  const metaRows: Array<[string, string]> = [["Plan", props.planName]];
  if (billingInterval) {
    metaRows.push(["Billing", billingInterval]);
  }
  metaRows.push(["Renews on", props.renewalDate]);
  metaRows.push(["Amount", props.renewalAmount]);
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
              {productName} · Renewal reminder
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
              Your subscription renews on {props.renewalDate}.
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
              This is a heads-up that your{" "}
              <strong>{props.planName}</strong> plan on {productName} will
              renew automatically on <strong>{props.renewalDate}</strong> for{" "}
              <strong>{props.renewalAmount}</strong>. No action is required if
              you'd like to keep your subscription active.
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: PANEL_BG,
                border: `1px solid ${BORDER}`,
                borderLeft: `4px solid ${BRAND_BLUE_DARK}`,
                borderRadius: "8px",
                padding: "16px 18px",
              }}
            >
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
                Subscription summary
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
            </div>
          </Section>

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={props.manageSubscriptionUrl}
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
              Manage subscription
            </Button>
          </Section>

          {nextInvoiceUrl ? (
            <Section style={{ padding: "0 32px 12px 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                Need a copy of the upcoming invoice?{" "}
                <a
                  href={nextInvoiceUrl}
                  style={{
                    color: BRAND_BLUE_DARK,
                    textDecoration: "none",
                  }}
                >
                  View invoice details
                </a>
                .
              </Text>
            </Section>
          ) : null}

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
                href={props.manageSubscriptionUrl}
                style={{
                  color: BRAND_BLUE_DARK,
                  textDecoration: "none",
                }}
              >
                {props.manageSubscriptionUrl}
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
              Want to change your plan or cancel? Visit{" "}
              <a
                href={props.manageSubscriptionUrl}
                style={{
                  color: BRAND_BLUE_DARK,
                  textDecoration: "none",
                }}
              >
                billing settings
              </a>{" "}
              before {props.renewalDate} and the change will apply to this
              renewal. Questions? Reach us at{" "}
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
            email because you have an active subscription.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

SubscriptionRenewalReminderEmail.PreviewProps = {
  customerName: "Jane Doe",
  planName: "Team",
  billingInterval: "Annual",
  renewalDate: "May 27, 2026",
  renewalAmount: "$240.00 USD",
  paymentMethodBrand: "Visa",
  paymentMethodLast4: "4242",
  manageSubscriptionUrl: "https://schemavaults.com/account/billing",
  nextInvoiceUrl: "https://schemavaults.com/account/invoices/upcoming",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies SubscriptionRenewalReminderEmailProps;
