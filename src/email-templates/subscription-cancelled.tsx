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

export interface SubscriptionCancelledEmailProps {
  customerName?: string;
  planName: string;
  effectiveEndDate: string;
  cancellationDate?: string;
  amountRefunded?: string;
  reactivateUrl: string;
  manageBillingUrl?: string;
  cancellationReason?: string;
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
const WARNING_AMBER = "#f59e0b";

export default function SubscriptionCancelledEmail(
  props: SubscriptionCancelledEmailProps,
): ReactElement {
  if (
    typeof props.planName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'planName' in props for SubscriptionCancelledEmail template!",
    );
  }
  if (
    typeof props.effectiveEndDate !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'effectiveEndDate' in props for SubscriptionCancelledEmail template!",
    );
  }
  if (
    typeof props.reactivateUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'reactivateUrl' in props for SubscriptionCancelledEmail template!",
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
  const cancellationDate: string | undefined =
    typeof props.cancellationDate === "string" &&
    props.cancellationDate.length > 0
      ? props.cancellationDate
      : undefined;
  const amountRefunded: string | undefined =
    typeof props.amountRefunded === "string" && props.amountRefunded.length > 0
      ? props.amountRefunded
      : undefined;
  const cancellationReason: string | undefined =
    typeof props.cancellationReason === "string" &&
    props.cancellationReason.length > 0
      ? props.cancellationReason
      : undefined;
  const manageBillingUrl: string | undefined =
    typeof props.manageBillingUrl === "string" &&
    props.manageBillingUrl.length > 0
      ? props.manageBillingUrl
      : undefined;

  const previewText = `Your ${props.planName} subscription has been cancelled. Access ends ${props.effectiveEndDate}.`;

  const metaRows: Array<[string, string]> = [["Plan", props.planName]];
  if (cancellationDate) {
    metaRows.push(["Cancelled on", cancellationDate]);
  }
  metaRows.push(["Access ends", props.effectiveEndDate]);
  if (amountRefunded) {
    metaRows.push(["Refunded", amountRefunded]);
  }
  if (cancellationReason) {
    metaRows.push(["Reason", cancellationReason]);
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
              {productName} · Subscription cancelled
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
              Your {props.planName} plan has been cancelled.
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
              We've processed your cancellation request — no further charges
              will be made. You'll keep full access to your{" "}
              <strong>{props.planName}</strong> features until{" "}
              <strong>{props.effectiveEndDate}</strong>, after which your
              account will switch to the free tier.
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: PANEL_BG,
                border: `1px solid ${BORDER}`,
                borderLeft: `4px solid ${WARNING_AMBER}`,
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
                What happens next
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                Your data, vaults, and schemas will be preserved. After{" "}
                {props.effectiveEndDate}, premium features (private vaults,
                team seats, higher API limits) become unavailable until you
                resubscribe. You can reactivate at any time and pick up exactly
                where you left off.
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

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={props.reactivateUrl}
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
              Reactivate subscription
            </Button>
          </Section>

          {manageBillingUrl ? (
            <Section style={{ padding: "4px 32px 8px 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                Need to download invoices or update billing details?{" "}
                <a
                  href={manageBillingUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  Manage billing
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
                href={props.reactivateUrl}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {props.reactivateUrl}
              </a>
            </Text>
          </Section>

          <Hr style={{ borderColor: BORDER, margin: "0 32px" }} />

          <Section style={{ padding: "20px 32px 28px 32px" }}>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "14px",
                lineHeight: "1.6",
                margin: "0 0 8px 0",
              }}
            >
              Thanks for trying {productName} — we're sorry to see you go.
            </Text>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              If this cancellation wasn't intentional, or if there's anything
              we could have done better, reply to this email or reach us at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>
              . We read every message.
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
            email because you recently cancelled a subscription on your
            account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

SubscriptionCancelledEmail.PreviewProps = {
  customerName: "Jane Doe",
  planName: "Pro",
  effectiveEndDate: "Jun 27, 2026",
  cancellationDate: "May 30, 2026",
  amountRefunded: "$0.00 (no prorated refund)",
  reactivateUrl:
    "https://schemavaults.com/billing/reactivate?token=example-token",
  manageBillingUrl: "https://schemavaults.com/billing",
  cancellationReason: "Switching to a different tool",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies SubscriptionCancelledEmailProps;
