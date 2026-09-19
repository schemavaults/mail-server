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
import { getEmailBrand } from "./brand";

export interface SubscriptionRenewalReminderEmailProps {
  renewalDate: string;
  renewalAmount: string;
  manageSubscriptionUrl: string;
  recipientName?: string;
  planName?: string;
  billingInterval?: string;
  daysUntilRenewal?: number;
  paymentMethod?: string;
  invoiceUrl?: string;
  cancelUrl?: string;
  includedHighlights?: string[];
  productName?: string;
  supportEmail?: string;
}

// Neutral palette plus the blue tint scale that surrounds the brand accent.
// Email clients don't resolve CSS custom properties or oklch(), so the theme
// tokens are inlined as concrete hex values here; the accent itself comes
// from the configured brand inside the component.
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const ACCENT_BG = "#eff6ff";
const ACCENT_BORDER = "#bfdbfe";

export default function SubscriptionRenewalReminderEmail(
  props: SubscriptionRenewalReminderEmailProps,
): ReactElement {
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

  const brand = getEmailBrand();
  const BRAND_BLUE = brand.colors.accent;
  const BRAND_BLUE_DARK = brand.colors.accentDark;

  const productName: string =
    typeof props.productName === "string" && props.productName.length > 0
      ? props.productName
      : brand.productName;
  const supportEmail: string =
    typeof props.supportEmail === "string" && props.supportEmail.length > 0
      ? props.supportEmail
      : brand.supportEmail;
  const greetingName: string =
    typeof props.recipientName === "string" && props.recipientName.length > 0
      ? props.recipientName
      : "there";
  const planName: string =
    typeof props.planName === "string" && props.planName.length > 0
      ? props.planName
      : "subscription";
  const billingInterval: string | undefined =
    typeof props.billingInterval === "string" &&
    props.billingInterval.length > 0
      ? props.billingInterval
      : undefined;
  const paymentMethod: string | undefined =
    typeof props.paymentMethod === "string" && props.paymentMethod.length > 0
      ? props.paymentMethod
      : undefined;
  const invoiceUrl: string | undefined =
    typeof props.invoiceUrl === "string" && props.invoiceUrl.length > 0
      ? props.invoiceUrl
      : undefined;
  const cancelUrl: string | undefined =
    typeof props.cancelUrl === "string" && props.cancelUrl.length > 0
      ? props.cancelUrl
      : undefined;
  const includedHighlights: string[] = Array.isArray(props.includedHighlights)
    ? props.includedHighlights.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      )
    : [];

  const daysUntilRenewal: number | undefined =
    typeof props.daysUntilRenewal === "number" &&
    Number.isFinite(props.daysUntilRenewal)
      ? Math.max(0, Math.floor(props.daysUntilRenewal))
      : undefined;

  const countdownLabel: string | undefined =
    daysUntilRenewal === undefined
      ? undefined
      : daysUntilRenewal === 0
        ? "renews today"
        : daysUntilRenewal === 1
          ? "renews tomorrow"
          : `renews in ${daysUntilRenewal} days`;

  const headingText: string =
    daysUntilRenewal === 0
      ? `Your ${planName} renews today.`
      : daysUntilRenewal === 1
        ? `Your ${planName} renews tomorrow.`
        : daysUntilRenewal === undefined
          ? `Your ${planName} renews on ${props.renewalDate}.`
          : `Your ${planName} renews in ${daysUntilRenewal} days.`;

  const previewText: string = `Hi ${greetingName} — your ${productName} ${planName} renews on ${props.renewalDate} for ${props.renewalAmount}. No action needed to continue.`;

  const metaRows: Array<[string, string]> = [["Plan", planName]];
  if (billingInterval) {
    metaRows.push(["Billing cycle", billingInterval]);
  }
  metaRows.push(["Renews on", props.renewalDate]);
  if (paymentMethod) {
    metaRows.push(["Payment method", paymentMethod]);
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
              This is a heads-up that your {productName} {planName} renews
              automatically on <strong>{props.renewalDate}</strong>. You don't
              need to do anything to stay subscribed — we'll charge your saved
              payment method on that date.
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <div
              style={{
                backgroundColor: ACCENT_BG,
                border: `1px solid ${ACCENT_BORDER}`,
                borderRadius: "10px",
                padding: "18px 20px",
              }}
            >
              <Text
                style={{
                  color: BRAND_BLUE_DARK,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                Amount due on {props.renewalDate}
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "30px",
                  fontWeight: 700,
                  lineHeight: "1.2",
                  margin: 0,
                }}
              >
                {props.renewalAmount}
              </Text>
              {billingInterval ? (
                <Text
                  style={{
                    color: MUTED_FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.5",
                    margin: "6px 0 0 0",
                  }}
                >
                  {billingInterval}
                </Text>
              ) : null}
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

          {includedHighlights.length > 0 ? (
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
                    margin: "0 0 6px 0",
                    textTransform: "uppercase",
                  }}
                >
                  What stays active
                </Text>
                <ul
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                    paddingLeft: "20px",
                  }}
                >
                  {includedHighlights.map((highlight) => (
                    <li key={highlight} style={{ margin: "2px 0" }}>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </Section>
          ) : null}

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

          {invoiceUrl ? (
            <Section style={{ padding: "8px 32px 0 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                Want the line-by-line breakdown before it's charged?{" "}
                <a
                  href={invoiceUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  Preview the upcoming invoice
                </a>
                .
              </Text>
            </Section>
          ) : null}

          {cancelUrl ? (
            <Section style={{ padding: "16px 32px 24px 32px" }}>
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
                  Not planning to continue? You can{" "}
                  <a
                    href={cancelUrl}
                    style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                  >
                    cancel your plan
                  </a>{" "}
                  any time before {props.renewalDate} and you won't be charged
                  again.
                </Text>
              </div>
            </Section>
          ) : (
            <Section style={{ padding: "16px 32px 24px 32px" }} />
          )}

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
              Questions about your plan, pricing, or an upcoming charge? Reply
              to this email or reach us at{" "}
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
            © {new Date().getFullYear()} {productName}. This renewal notice was
            sent to the billing address on file for your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

SubscriptionRenewalReminderEmail.PreviewProps = {
  recipientName: "Jane Doe",
  planName: "Team plan",
  billingInterval: "Billed yearly · 5 seats",
  renewalDate: "May 14, 2026",
  renewalAmount: "$540.00 USD",
  daysUntilRenewal: 7,
  paymentMethod: "Visa ending in 4242",
  manageSubscriptionUrl: "https://example.com/account/billing",
  invoiceUrl: "https://example.com/account/billing/upcoming-invoice",
  cancelUrl: "https://example.com/account/billing/cancel",
  includedHighlights: [
    "5 team seats with shared workspaces",
    "Unlimited version history",
    "Priority support with a 1-business-day response",
  ],
} satisfies SubscriptionRenewalReminderEmailProps;
