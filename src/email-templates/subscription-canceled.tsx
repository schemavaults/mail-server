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
  reactivateUrl: string;
  canceledAt?: string;
  accessUntil?: string;
  finalChargeAmount?: string;
  cancellationReason?: string;
  feedbackUrl?: string;
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
  const canceledAt: string | undefined =
    typeof props.canceledAt === "string" && props.canceledAt.length > 0
      ? props.canceledAt
      : undefined;
  const accessUntil: string | undefined =
    typeof props.accessUntil === "string" && props.accessUntil.length > 0
      ? props.accessUntil
      : undefined;
  const finalChargeAmount: string | undefined =
    typeof props.finalChargeAmount === "string" &&
    props.finalChargeAmount.length > 0
      ? props.finalChargeAmount
      : undefined;
  const cancellationReason: string | undefined =
    typeof props.cancellationReason === "string" &&
    props.cancellationReason.length > 0
      ? props.cancellationReason
      : undefined;
  const feedbackUrl: string | undefined =
    typeof props.feedbackUrl === "string" && props.feedbackUrl.length > 0
      ? props.feedbackUrl
      : undefined;

  const previewText: string = accessUntil
    ? `Your ${productName} ${props.planName} subscription is canceled — access continues through ${accessUntil}.`
    : `Your ${productName} ${props.planName} subscription has been canceled.`;

  const metaRows: Array<[string, string]> = [["Plan", props.planName]];
  if (canceledAt) {
    metaRows.push(["Canceled on", canceledAt]);
  }
  if (accessUntil) {
    metaRows.push(["Access until", accessUntil]);
  }
  if (finalChargeAmount) {
    metaRows.push(["Final charge", finalChargeAmount]);
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
              {productName} · Subscription
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
              We've canceled your <strong>{props.planName}</strong> subscription
              on {productName}.{" "}
              {accessUntil
                ? `You'll keep full access through ${accessUntil}, after which your account will switch to the free tier.`
                : "Your account has been switched to the free tier effective immediately."}{" "}
              No further charges will be made.
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

          {cancellationReason ? (
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
                  Reason on file
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  {cancellationReason}
                </Text>
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "15px",
                fontWeight: 600,
                lineHeight: "1.6",
                margin: "0 0 4px 0",
              }}
            >
              Changed your mind?
            </Text>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "14px",
                lineHeight: "1.6",
                margin: "0 0 12px 0",
              }}
            >
              You can reactivate your subscription at any time. Your schemas,
              vaults, and team settings are preserved.
            </Text>
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
                href={props.reactivateUrl}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {props.reactivateUrl}
              </a>
            </Text>
          </Section>

          {feedbackUrl ? (
            <>
              <Hr style={{ borderColor: BORDER, margin: "16px 32px 0 32px" }} />
              <Section style={{ padding: "20px 32px 8px 32px" }}>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.6",
                    margin: "0 0 10px 0",
                  }}
                >
                  We'd love to learn what didn't work. A two-minute survey
                  helps us improve {productName} for everyone.
                </Text>
                <Button
                  href={feedbackUrl}
                  style={{
                    backgroundColor: "#ffffff",
                    border: `1px solid ${BORDER}`,
                    borderRadius: "8px",
                    color: BRAND_BLUE_DARK,
                    display: "inline-block",
                    fontSize: "14px",
                    fontWeight: 600,
                    padding: "10px 18px",
                    textDecoration: "none",
                  }}
                >
                  Share feedback
                </Button>
              </Section>
            </>
          ) : null}

          <Hr style={{ borderColor: BORDER, margin: "20px 32px 0 32px" }} />

          <Section style={{ padding: "20px 32px 28px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Didn't request this cancellation? Reach us right away at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>{" "}
              and we'll restore your subscription.
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
            email because a subscription was canceled on your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

SubscriptionCanceledEmail.PreviewProps = {
  recipientName: "Jane Doe",
  planName: "Team — Annual",
  reactivateUrl: "https://schemavaults.com/billing/reactivate?token=example",
  canceledAt: "May 9, 2026",
  accessUntil: "Jun 14, 2026",
  finalChargeAmount: "$0.00 — no further charges",
  cancellationReason: "Switching to the free tier for a side project.",
  feedbackUrl: "https://schemavaults.com/feedback/cancellation?token=example",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies SubscriptionCanceledEmailProps;
