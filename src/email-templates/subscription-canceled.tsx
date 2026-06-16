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
  serviceEndsAt: string;
  cancellationEffectiveAt?: string;
  refundAmount?: string;
  reactivateUrl: string;
  manageBillingUrl?: string;
  dataRetentionDays?: number;
  cancellationReason?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties, so the token hex values are inlined here.
// SLATE values approximate the muted/neutral palette (--secondary, --muted) used for a calm,
// non-alarming cancellation confirmation header — distinct from the BRAND_BLUE (transactional)
// and AMBER (warning) headers used elsewhere in the catalog.
const BRAND_BLUE_DARK = "#2563eb";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const SLATE = "#475569";
const SLATE_DARK = "#1e293b";
const ACCENT_BG = "#eff6ff";
const ACCENT_BORDER = "#bfdbfe";

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
    typeof props.serviceEndsAt !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'serviceEndsAt' in props for SubscriptionCanceledEmail template!",
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
  const cancellationEffectiveAt: string | undefined =
    typeof props.cancellationEffectiveAt === "string" &&
    props.cancellationEffectiveAt.length > 0
      ? props.cancellationEffectiveAt
      : undefined;
  const refundAmount: string | undefined =
    typeof props.refundAmount === "string" && props.refundAmount.length > 0
      ? props.refundAmount
      : undefined;
  const manageBillingUrl: string | undefined =
    typeof props.manageBillingUrl === "string" &&
    props.manageBillingUrl.length > 0
      ? props.manageBillingUrl
      : undefined;
  const cancellationReason: string | undefined =
    typeof props.cancellationReason === "string" &&
    props.cancellationReason.length > 0
      ? props.cancellationReason
      : undefined;
  const dataRetentionDays: number | undefined =
    typeof props.dataRetentionDays === "number" &&
    Number.isFinite(props.dataRetentionDays) &&
    props.dataRetentionDays > 0
      ? Math.floor(props.dataRetentionDays)
      : undefined;

  const previewText = `Your ${productName} ${props.planName} subscription has been canceled. You'll keep access until ${props.serviceEndsAt}.`;

  const metaRows: Array<[string, string]> = [["Plan", props.planName]];
  if (cancellationEffectiveAt) {
    metaRows.push(["Canceled on", cancellationEffectiveAt]);
  }
  metaRows.push(["Access ends", props.serviceEndsAt]);
  if (refundAmount) {
    metaRows.push(["Refund", refundAmount]);
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
              {productName} · Subscription canceled
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
              Your {props.planName} subscription has been canceled.
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
              We've processed your cancellation request for{" "}
              <strong>{props.planName}</strong>. You'll keep full access to{" "}
              {productName} until <strong>{props.serviceEndsAt}</strong> — no
              further charges will be made after that date.
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

          {typeof dataRetentionDays === "number" ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
                  borderLeft: `4px solid ${SLATE_DARK}`,
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
                  Your vaults, schemas, and team data will be retained in
                  read-only mode for{" "}
                  <strong>
                    {dataRetentionDays} day{dataRetentionDays === 1 ? "" : "s"}
                  </strong>{" "}
                  after {props.serviceEndsAt}. Reactivate within that window to
                  resume exactly where you left off — after that, your data will
                  be permanently deleted.
                </Text>
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: ACCENT_BG,
                border: `1px solid ${ACCENT_BORDER}`,
                borderRadius: "8px",
                padding: "16px",
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  fontWeight: 500,
                  lineHeight: "1.55",
                  margin: "0 0 12px 0",
                }}
              >
                Changed your mind? You can reactivate any time before your
                access ends.
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
            </div>
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

          {manageBillingUrl ? (
            <Section style={{ padding: "12px 32px 24px 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                You can review past invoices and download receipts any time in
                your{" "}
                <a
                  href={manageBillingUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  billing settings
                </a>
                .
              </Text>
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
              Was something missing or did you run into a problem? We'd love to
              hear about it — reply to this email or reach us at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>
              . Thanks for trying {productName}.
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
            email because you canceled your subscription.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

SubscriptionCanceledEmail.PreviewProps = {
  recipientName: "Jane Doe",
  planName: "Pro (Monthly)",
  serviceEndsAt: "June 30, 2026 23:59 UTC",
  cancellationEffectiveAt: "June 16, 2026 14:22 UTC",
  refundAmount: "No refund — service continues until period end",
  reactivateUrl: "https://schemavaults.com/billing/reactivate?plan=pro",
  manageBillingUrl: "https://schemavaults.com/account/billing",
  dataRetentionDays: 30,
  cancellationReason: "Switching to annual plan later this year",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies SubscriptionCanceledEmailProps;
