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

export interface SubscriptionCancelledEmailProps {
  planName: string;
  accessEndsAt: string;
  reactivateUrl: string;
  recipientName?: string;
  cancelledAt?: string;
  billingInterval?: string;
  finalInvoiceAmount?: string;
  cancellationReason?: string;
  dataRetentionDays?: number;
  dataExportUrl?: string;
  feedbackUrl?: string;
  whatHappensNext?: string[];
  productName?: string;
  supportEmail?: string;
}

// Neutral palette tokens. Email clients don't resolve CSS custom properties
// or oklch(), so concrete hex values are inlined here; the brand accent comes
// from the configured brand (see ./brand.ts) inside the component.
// SLATE values approximate the theme's `--muted-foreground` / `--foreground`
// neutral ramp — a cancellation confirmation is deliberately calm rather than
// celebratory, so the hero uses the neutral ramp and the brand accent is
// reserved for the win-back CTA and links.
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const SLATE = "#475569";
const SLATE_DARK = "#0f172a";

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
  const cancelledAt: string | undefined =
    typeof props.cancelledAt === "string" && props.cancelledAt.length > 0
      ? props.cancelledAt
      : undefined;
  const billingInterval: string | undefined =
    typeof props.billingInterval === "string" &&
    props.billingInterval.length > 0
      ? props.billingInterval
      : undefined;
  const finalInvoiceAmount: string | undefined =
    typeof props.finalInvoiceAmount === "string" &&
    props.finalInvoiceAmount.length > 0
      ? props.finalInvoiceAmount
      : undefined;
  const cancellationReason: string | undefined =
    typeof props.cancellationReason === "string" &&
    props.cancellationReason.length > 0
      ? props.cancellationReason
      : undefined;
  const dataExportUrl: string | undefined =
    typeof props.dataExportUrl === "string" && props.dataExportUrl.length > 0
      ? props.dataExportUrl
      : undefined;
  const feedbackUrl: string | undefined =
    typeof props.feedbackUrl === "string" && props.feedbackUrl.length > 0
      ? props.feedbackUrl
      : undefined;
  const dataRetentionDays: number | undefined =
    typeof props.dataRetentionDays === "number" &&
    Number.isFinite(props.dataRetentionDays)
      ? Math.max(0, Math.floor(props.dataRetentionDays))
      : undefined;

  const providedNextSteps: string[] = Array.isArray(props.whatHappensNext)
    ? props.whatHappensNext.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      )
    : [];

  const defaultNextSteps: string[] = [
    `Your ${props.planName} features stay active until ${props.accessEndsAt}.`,
    "You won't be charged again — no further invoices will be issued.",
    typeof dataRetentionDays === "number"
      ? `Your data is kept for ${dataRetentionDays} day${
          dataRetentionDays === 1 ? "" : "s"
        } after your access ends, then permanently deleted.`
      : "Your account stays available on the free plan — nothing is deleted today.",
    "You can reactivate at any time and pick up exactly where you left off.",
  ];

  const nextSteps: string[] =
    providedNextSteps.length > 0 ? providedNextSteps : defaultNextSteps;

  const previewText = `Your ${productName} ${props.planName} subscription is cancelled. You keep access until ${props.accessEndsAt}.`;

  const metaRows: Array<[string, string]> = [["Plan", props.planName]];
  if (billingInterval) {
    metaRows.push(["Billing", billingInterval]);
  }
  if (cancelledAt) {
    metaRows.push(["Cancelled on", cancelledAt]);
  }
  metaRows.push(["Access ends", props.accessEndsAt]);
  if (finalInvoiceAmount) {
    metaRows.push(["Final invoice", finalInvoiceAmount]);
  }
  if (cancellationReason) {
    metaRows.push(["Reason given", cancellationReason]);
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
              {productName} · Subscription update
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
              Access until {props.accessEndsAt}
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
              We've cancelled your <strong>{props.planName}</strong>{" "}
              subscription on {productName}, so you won't be billed again. You
              keep full access until <strong>{props.accessEndsAt}</strong> —
              nothing changes before then.
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
                What happens next
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
                {nextSteps.map((step) => (
                  <li key={step} style={{ margin: "2px 0" }}>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "15px",
                lineHeight: "1.6",
                margin: "0 0 16px 0",
              }}
            >
              Changed your mind? Reactivating restores your {props.planName}{" "}
              plan and every project exactly as you left it.
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

          {dataExportUrl ? (
            <Section style={{ padding: "12px 32px 0 32px" }}>
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
                  Want to take your data with you? You can{" "}
                  <a
                    href={dataExportUrl}
                    style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                  >
                    export everything
                  </a>
                  {typeof dataRetentionDays === "number"
                    ? ` any time in the next ${dataRetentionDays} day${
                        dataRetentionDays === 1 ? "" : "s"
                      }.`
                    : " from your account settings."}
                </Text>
              </div>
            </Section>
          ) : null}

          {feedbackUrl ? (
            <Section style={{ padding: "12px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: CARD_BG,
                  border: `1px dashed ${BRAND_BLUE}`,
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
                  Mind telling us why you left? Two minutes of{" "}
                  <a
                    href={feedbackUrl}
                    style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                  >
                    feedback
                  </a>{" "}
                  genuinely shapes what we build next.
                </Text>
              </div>
            </Section>
          ) : null}

          <Hr style={{ borderColor: BORDER, margin: "24px 32px 0 32px" }} />

          <Section style={{ padding: "20px 32px 28px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Didn't request this cancellation, or think it was made in error?
              Contact us right away at{" "}
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
            © {new Date().getFullYear()} {productName}. This is a billing
            confirmation for your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

SubscriptionCancelledEmail.PreviewProps = {
  recipientName: "Jane Doe",
  planName: "Pro",
  billingInterval: "Monthly · $29.00/mo",
  cancelledAt: "Sep 12, 2026",
  accessEndsAt: "Oct 11, 2026",
  finalInvoiceAmount: "$29.00 (paid Sep 11, 2026)",
  cancellationReason: "Too expensive right now",
  dataRetentionDays: 30,
  dataExportUrl: "https://example.com/account/export",
  feedbackUrl: "https://example.com/feedback/cancellation",
  reactivateUrl: "https://example.com/billing/reactivate",
} satisfies SubscriptionCancelledEmailProps;
