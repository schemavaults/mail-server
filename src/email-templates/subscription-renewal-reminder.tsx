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
  recipientName?: string;
  planName: string;
  amount: string;
  renewsAt: string;
  daysUntilRenewal?: number;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  paymentMethodBrand?: string;
  paymentMethodLast4?: string;
  manageSubscriptionUrl: string;
  updatePaymentUrl?: string;
  cancelUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties, so the token values are inlined as hex.
// The SchemaVaults brand-blue gradient signals an informational notice (not a warning or error),
// consistent with team-invitation and other neutral transactional templates in this catalog.
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
    typeof props.planName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'planName' in props for SubscriptionRenewalReminderEmail template!",
    );
  }
  if (
    typeof props.amount !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'amount' in props for SubscriptionRenewalReminderEmail template!",
    );
  }
  if (
    typeof props.renewsAt !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'renewsAt' in props for SubscriptionRenewalReminderEmail template!",
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
  const greetingName: string =
    typeof props.recipientName === "string" && props.recipientName.length > 0
      ? props.recipientName
      : "there";
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
  const updatePaymentUrl: string | undefined =
    typeof props.updatePaymentUrl === "string" &&
    props.updatePaymentUrl.length > 0
      ? props.updatePaymentUrl
      : undefined;
  const cancelUrl: string | undefined =
    typeof props.cancelUrl === "string" && props.cancelUrl.length > 0
      ? props.cancelUrl
      : undefined;

  const safeDaysUntilRenewal: number | undefined =
    typeof props.daysUntilRenewal === "number" &&
    Number.isFinite(props.daysUntilRenewal)
      ? Math.max(0, Math.floor(props.daysUntilRenewal))
      : undefined;

  const countdownLabel: string | undefined =
    typeof safeDaysUntilRenewal === "number"
      ? safeDaysUntilRenewal === 0
        ? "Renews today"
        : safeDaysUntilRenewal === 1
          ? "Renews in 1 day"
          : `Renews in ${safeDaysUntilRenewal} days`
      : undefined;

  const headingText: string =
    typeof safeDaysUntilRenewal === "number"
      ? safeDaysUntilRenewal === 0
        ? `Your ${planName(props)} subscription renews today.`
        : safeDaysUntilRenewal === 1
          ? `Your ${planName(props)} subscription renews tomorrow.`
          : `Your ${planName(props)} subscription renews in ${safeDaysUntilRenewal} days.`
      : `Your ${planName(props)} subscription is renewing soon.`;

  const previewText: string =
    typeof safeDaysUntilRenewal === "number"
      ? `Hi ${greetingName} — your ${productName} ${planName(props)} subscription will renew on ${props.renewsAt} (${props.amount}).`
      : `Hi ${greetingName} — your ${productName} ${planName(props)} subscription will renew on ${props.renewsAt} for ${props.amount}.`;

  const paymentMethodDisplay: string | undefined =
    paymentMethodBrand && paymentMethodLast4
      ? `${paymentMethodBrand} ending in ${paymentMethodLast4}`
      : paymentMethodBrand
        ? paymentMethodBrand
        : paymentMethodLast4
          ? `card ending in ${paymentMethodLast4}`
          : undefined;

  const metaRows: Array<[string, string]> = [
    ["Plan", planName(props)],
    ["Amount", props.amount],
    ["Renewal date", props.renewsAt],
  ];
  if (billingPeriodStart && billingPeriodEnd) {
    metaRows.push([
      "Next billing period",
      `${billingPeriodStart} – ${billingPeriodEnd}`,
    ]);
  } else if (billingPeriodEnd) {
    metaRows.push(["Through", billingPeriodEnd]);
  }
  if (paymentMethodDisplay) {
    metaRows.push(["Payment method", paymentMethodDisplay]);
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
                margin: "8px 0 12px 0",
              }}
            >
              {headingText}
            </Heading>
            {countdownLabel ? (
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
                {countdownLabel}
              </span>
            ) : null}
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
              This is a heads-up that your <strong>{planName(props)}</strong>{" "}
              subscription on {productName} will auto-renew on{" "}
              <strong>{props.renewsAt}</strong>. We'll charge{" "}
              <strong>{props.amount}</strong>
              {paymentMethodDisplay
                ? ` to your ${paymentMethodDisplay}`
                : ""}{" "}
              on that date. No action is needed if you'd like to continue.
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 8px 32px" }}>
            <div
              style={{
                backgroundColor: PANEL_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: "8px",
                padding: "16px 18px",
              }}
            >
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
                href={props.manageSubscriptionUrl}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {props.manageSubscriptionUrl}
              </a>
            </Text>
          </Section>

          {updatePaymentUrl || cancelUrl ? (
            <Section style={{ padding: "12px 32px 24px 32px" }}>
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
                    lineHeight: "1.6",
                    margin: 0,
                  }}
                >
                  {updatePaymentUrl ? (
                    <>
                      <a
                        href={updatePaymentUrl}
                        style={{
                          color: BRAND_BLUE_DARK,
                          textDecoration: "none",
                        }}
                      >
                        Update payment method
                      </a>
                      {cancelUrl ? " · " : ""}
                    </>
                  ) : null}
                  {cancelUrl ? (
                    <a
                      href={cancelUrl}
                      style={{
                        color: BRAND_BLUE_DARK,
                        textDecoration: "none",
                      }}
                    >
                      Cancel before renewal
                    </a>
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
              You're receiving this advance notice so there are no surprise
              charges. Questions about your subscription? Reply to this email or
              reach us at{" "}
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

function planName(props: SubscriptionRenewalReminderEmailProps): string {
  return typeof props.planName === "string" && props.planName.length > 0
    ? props.planName
    : "Pro";
}

SubscriptionRenewalReminderEmail.PreviewProps = {
  recipientName: "Jane Doe",
  planName: "Pro Annual",
  amount: "$348.00 USD",
  renewsAt: "Jul 1, 2026",
  daysUntilRenewal: 7,
  billingPeriodStart: "Jul 1, 2026",
  billingPeriodEnd: "Jun 30, 2027",
  paymentMethodBrand: "Visa",
  paymentMethodLast4: "4242",
  manageSubscriptionUrl: "https://schemavaults.com/account/billing",
  updatePaymentUrl: "https://schemavaults.com/account/billing/payment-method",
  cancelUrl: "https://schemavaults.com/account/billing/cancel",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies SubscriptionRenewalReminderEmailProps;
