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

export interface SubscriptionCanceledEmailProps {
  recipientName?: string;
  planName: string;
  accessEndsAt: string;
  reactivateUrl: string;
  canceledAt?: string;
  billingCycle?: string;
  lastPaymentAmount?: string;
  lastPaymentDate?: string;
  cancellationReason?: string;
  manageBillingUrl?: string;
  dataRetentionDays?: number;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties or oklch(), so the token values are inlined as hex.
// SLATE palette is used to convey a neutral end-of-relationship tone (not an error),
// with the brand blue reserved for the reactivation CTA to keep the win-back path prominent.
const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
const BRAND_BLUE_BG = "#eff6ff";
const BRAND_BLUE_BORDER = "#bfdbfe";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const SLATE_HEADER_FROM = "#475569";
const SLATE_HEADER_TO = "#1e293b";
const AMBER_BG = "#fffbeb";
const AMBER_BORDER = "#fde68a";
const AMBER_FOREGROUND = "#78350f";

export default function SubscriptionCanceledEmail(
  props: SubscriptionCanceledEmailProps,
): ReactElement {
  if (
    typeof props.planName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'planName' in props for SubscriptionCanceledEmail template!",
    );
  }
  if (
    typeof props.accessEndsAt !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'accessEndsAt' in props for SubscriptionCanceledEmail template!",
    );
  }
  if (
    typeof props.reactivateUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'reactivateUrl' in props for SubscriptionCanceledEmail template!",
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
  const dataRetentionDays: number =
    typeof props.dataRetentionDays === "number" &&
    Number.isFinite(props.dataRetentionDays) &&
    props.dataRetentionDays > 0
      ? Math.floor(props.dataRetentionDays)
      : 30;

  const metaRows: Array<[string, string]> = [["Plan", props.planName]];
  if (
    typeof props.billingCycle === "string" &&
    props.billingCycle.length > 0
  ) {
    metaRows.push(["Billing cycle", props.billingCycle]);
  }
  if (typeof props.canceledAt === "string" && props.canceledAt.length > 0) {
    metaRows.push(["Canceled on", props.canceledAt]);
  }
  if (
    typeof props.lastPaymentAmount === "string" &&
    props.lastPaymentAmount.length > 0
  ) {
    metaRows.push(["Last payment", props.lastPaymentAmount]);
  }
  if (
    typeof props.lastPaymentDate === "string" &&
    props.lastPaymentDate.length > 0
  ) {
    metaRows.push(["Paid on", props.lastPaymentDate]);
  }
  if (
    typeof props.cancellationReason === "string" &&
    props.cancellationReason.length > 0
  ) {
    metaRows.push(["Reason", props.cancellationReason]);
  }

  const previewText = `Your ${productName} ${props.planName} subscription has been canceled. You'll keep access through ${props.accessEndsAt}.`;

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
              background: `linear-gradient(135deg, ${SLATE_HEADER_FROM} 0%, ${SLATE_HEADER_TO} 100%)`,
              padding: "32px 32px 28px 32px",
            }}
          >
            <Text
              style={{
                color: "#cbd5e1",
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
              Your subscription has been canceled.
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
              We've canceled your <strong>{props.planName}</strong>{" "}
              subscription on {productName}. You won't be charged again. Thanks
              for trying us out — we're sorry to see you go.
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: BRAND_BLUE_BG,
                border: `1px solid ${BRAND_BLUE_BORDER}`,
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
                You still have access until
              </Text>
              <Text
                style={{
                  color: BRAND_BLUE_DARK,
                  fontSize: "20px",
                  fontWeight: 700,
                  lineHeight: "1.3",
                  margin: 0,
                }}
              >
                {props.accessEndsAt}
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: "6px 0 0 0",
                }}
              >
                Your paid features stay on until then. After that, your
                account moves to the free tier.
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
                        wordBreak: "break-word",
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
            {typeof props.manageBillingUrl === "string" &&
            props.manageBillingUrl.length > 0 ? (
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: "12px 0 0 0",
                }}
              >
                Or{" "}
                <a
                  href={props.manageBillingUrl}
                  style={{
                    color: BRAND_BLUE_DARK,
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  manage billing
                </a>{" "}
                to update your payment method or switch plans.
              </Text>
            ) : null}
          </Section>

          <Section style={{ padding: "16px 32px 8px 32px" }}>
            <div
              style={{
                backgroundColor: AMBER_BG,
                border: `1px solid ${AMBER_BORDER}`,
                borderLeft: `4px solid ${BRAND_BLUE}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: AMBER_FOREGROUND,
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                What happens to your data
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                We'll keep your schemas and vaults for{" "}
                <strong>{dataRetentionDays} days</strong> after access ends.
                Reactivate before then and everything picks up where you left
                off. After that, your workspace data is permanently deleted.
              </Text>
            </div>
          </Section>

          <Hr style={{ borderColor: BORDER, margin: "16px 32px 0 32px" }} />

          <Section style={{ padding: "20px 32px 28px 32px" }}>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "14px",
                lineHeight: "1.6",
                margin: "0 0 8px 0",
              }}
            >
              Mind sharing why you canceled? Just reply to this email — we
              read every response and use it to make {productName} better.
            </Text>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Questions about your account? Reach us at{" "}
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
            © {new Date().getFullYear()} {productName}. You're receiving this
            confirmation because a subscription on your account was canceled.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

SubscriptionCanceledEmail.PreviewProps = {
  recipientName: "Jane Doe",
  planName: "Team — Annual",
  accessEndsAt: "August 14, 2026",
  reactivateUrl: "https://schemavaults.com/account/billing/reactivate",
  canceledAt: "June 30, 2026",
  billingCycle: "Annual",
  lastPaymentAmount: "$240.00 USD",
  lastPaymentDate: "August 14, 2025",
  cancellationReason: "Switching to a self-hosted setup",
  manageBillingUrl: "https://schemavaults.com/account/billing",
  dataRetentionDays: 60,
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies SubscriptionCanceledEmailProps;
