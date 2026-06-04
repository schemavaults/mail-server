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
  recipientName?: string;
  planName: string;
  accessEndsAt: string;
  cancellationEffectiveAt?: string;
  daysOfAccessRemaining?: number;
  reactivateUrl: string;
  manageBillingUrl?: string;
  feedbackUrl?: string;
  cancellationReason?: string;
  refundAmount?: string;
  retainedFeatures?: string[];
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties, so the token hex values are inlined here.
// SLATE values approximate the muted/secondary tokens used for a calm, non-alarming cancellation header.
const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const SLATE = "#475569";
const SLATE_DARK = "#1e293b";
const SUCCESS_BG = "#ecfdf5";
const SUCCESS_BORDER = "#a7f3d0";
const SUCCESS_DARK = "#047857";
const SUCCESS_FOREGROUND = "#064e3b";

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
    typeof props.accessEndsAt !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'accessEndsAt' in props for SubscriptionCancelledEmail template!",
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
    typeof props.recipientName === "string" && props.recipientName.length > 0
      ? props.recipientName
      : "there";
  const cancellationEffectiveAt: string | undefined =
    typeof props.cancellationEffectiveAt === "string" &&
    props.cancellationEffectiveAt.length > 0
      ? props.cancellationEffectiveAt
      : undefined;
  const manageBillingUrl: string | undefined =
    typeof props.manageBillingUrl === "string" &&
    props.manageBillingUrl.length > 0
      ? props.manageBillingUrl
      : undefined;
  const feedbackUrl: string | undefined =
    typeof props.feedbackUrl === "string" && props.feedbackUrl.length > 0
      ? props.feedbackUrl
      : undefined;
  const cancellationReason: string | undefined =
    typeof props.cancellationReason === "string" &&
    props.cancellationReason.length > 0
      ? props.cancellationReason
      : undefined;
  const refundAmount: string | undefined =
    typeof props.refundAmount === "string" && props.refundAmount.length > 0
      ? props.refundAmount
      : undefined;
  const retainedFeatures: string[] = Array.isArray(props.retainedFeatures)
    ? props.retainedFeatures.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      )
    : [];

  const safeDaysOfAccessRemaining: number | undefined =
    typeof props.daysOfAccessRemaining === "number" &&
    Number.isFinite(props.daysOfAccessRemaining)
      ? Math.max(0, Math.floor(props.daysOfAccessRemaining))
      : undefined;

  const countdownLabel: string | undefined =
    safeDaysOfAccessRemaining === undefined
      ? undefined
      : safeDaysOfAccessRemaining === 0
        ? "access ends today"
        : safeDaysOfAccessRemaining === 1
          ? "1 day of access left"
          : `${safeDaysOfAccessRemaining} days of access left`;

  const previewText = `Your ${productName} ${props.planName} subscription has been cancelled. You still have access until ${props.accessEndsAt}.`;

  const metaRows: Array<[string, string]> = [["Plan", props.planName]];
  if (cancellationEffectiveAt) {
    metaRows.push(["Cancelled on", cancellationEffectiveAt]);
  }
  metaRows.push(["Access ends", props.accessEndsAt]);
  if (refundAmount) {
    metaRows.push(["Refund issued", refundAmount]);
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
              background: `linear-gradient(135deg, ${SLATE} 0%, ${SLATE_DARK} 100%)`,
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
                margin: "8px 0 12px 0",
              }}
            >
              Your {props.planName} subscription has been cancelled.
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
              We're confirming that your {productName}{" "}
              <strong>{props.planName}</strong> subscription has been
              cancelled. You'll keep full access through{" "}
              <strong>{props.accessEndsAt}</strong>, after which your account
              will move to the free tier. Nothing you've built will be deleted.
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

          {retainedFeatures.length > 0 ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: SUCCESS_BG,
                  border: `1px solid ${SUCCESS_BORDER}`,
                  borderLeft: `4px solid ${SUCCESS_DARK}`,
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <Text
                  style={{
                    color: SUCCESS_FOREGROUND,
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    margin: "0 0 6px 0",
                    textTransform: "uppercase",
                  }}
                >
                  You'll keep on the free tier
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
                  {retainedFeatures.map((feature) => (
                    <li key={feature} style={{ margin: "2px 0" }}>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </Section>
          ) : null}

          {cancellationReason ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
                  borderLeft: `4px solid ${SLATE}`,
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
                  Reason you shared
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
                lineHeight: "1.6",
                margin: "0 0 12px 0",
              }}
            >
              Changed your mind? Reactivate any time before{" "}
              <strong>{props.accessEndsAt}</strong> and you won't lose a thing.
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
              Reactivate {props.planName}
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

          {manageBillingUrl || feedbackUrl ? (
            <Section style={{ padding: "12px 32px 24px 32px" }}>
              <div
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "8px",
                  padding: "12px 16px",
                }}
              >
                {manageBillingUrl ? (
                  <Text
                    style={{
                      color: FOREGROUND,
                      fontSize: "13px",
                      lineHeight: "1.55",
                      margin: feedbackUrl ? "0 0 6px 0" : 0,
                    }}
                  >
                    Need an invoice copy or to update billing details? Visit
                    your{" "}
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
                  </Text>
                ) : null}
                {feedbackUrl ? (
                  <Text
                    style={{
                      color: FOREGROUND,
                      fontSize: "13px",
                      lineHeight: "1.55",
                      margin: 0,
                    }}
                  >
                    Mind telling us what we could do better?{" "}
                    <a
                      href={feedbackUrl}
                      style={{
                        color: BRAND_BLUE_DARK,
                        textDecoration: "none",
                      }}
                    >
                      Share two minutes of feedback
                    </a>{" "}
                    — it directly shapes what we build next.
                  </Text>
                ) : null}
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
              Didn't mean to cancel? Reply to this email or reach{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>{" "}
              and we'll get you sorted — usually within a business day. Thanks
              for being part of {productName}; we hope to see you again on the{" "}
              <span style={{ color: BRAND_BLUE }}>blue side</span>.
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
            email because you cancelled a paid subscription on this account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

SubscriptionCancelledEmail.PreviewProps = {
  recipientName: "Jane Doe",
  planName: "Pro",
  accessEndsAt: "Jul 14, 2026 23:59 UTC",
  cancellationEffectiveAt: "Jun 4, 2026 16:22 UTC",
  daysOfAccessRemaining: 40,
  reactivateUrl: "https://schemavaults.com/billing/reactivate?plan=pro",
  manageBillingUrl: "https://schemavaults.com/account/billing",
  feedbackUrl: "https://schemavaults.com/feedback/cancellation",
  cancellationReason:
    "Switching to a self-hosted setup for the next two quarters — may be back when our team grows.",
  refundAmount: "$12.40 USD (prorated)",
  retainedFeatures: [
    "Read-only access to all public schemas you've authored",
    "1 private vault (under 50 MB)",
    "Email export of audit logs once per month",
  ],
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies SubscriptionCancelledEmailProps;
