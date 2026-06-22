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

export interface AccountDeletionRequestedEmailProps {
  name: string;
  scheduledDeletionDate: string;
  cancelDeletionUrl: string;
  gracePeriodDays?: number;
  requestedFrom?: string;
  requestTime?: string;
  itemsToBeDeleted?: string[];
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties, so the token hex values are inlined here.
const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
const BRAND_RED = "#dc2626";
const BRAND_RED_DARK = "#b91c1c";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const ALERT_BG = "#fef2f2";
const ALERT_BORDER = "#fecaca";
const COUNTDOWN_BG = "#fff7ed";
const COUNTDOWN_BORDER = "#fed7aa";
const COUNTDOWN_ACCENT = "#c2410c";

const DEFAULT_ITEMS_TO_BE_DELETED: readonly string[] = [
  "Your account profile and authentication credentials",
  "Schemas you have vaulted and any private collections you own",
  "API keys, tokens, and active sessions tied to your account",
  "Mailing list subscriptions and notification preferences",
];

export default function AccountDeletionRequestedEmail(
  props: AccountDeletionRequestedEmailProps,
): ReactElement {
  if (
    typeof props.name !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'name' in props for AccountDeletionRequestedEmail template!",
    );
  }
  if (
    typeof props.scheduledDeletionDate !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'scheduledDeletionDate' in props for AccountDeletionRequestedEmail template!",
    );
  }
  if (
    typeof props.cancelDeletionUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'cancelDeletionUrl' in props for AccountDeletionRequestedEmail template!",
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
  const gracePeriodDays: number | undefined =
    typeof props.gracePeriodDays === "number" &&
    Number.isFinite(props.gracePeriodDays) &&
    props.gracePeriodDays > 0
      ? Math.floor(props.gracePeriodDays)
      : undefined;
  const itemsToBeDeleted: readonly string[] =
    Array.isArray(props.itemsToBeDeleted) && props.itemsToBeDeleted.length > 0
      ? props.itemsToBeDeleted
      : DEFAULT_ITEMS_TO_BE_DELETED;

  const metaRows: Array<[string, string]> = [];
  if (typeof props.requestTime === "string" && props.requestTime.length > 0) {
    metaRows.push(["Requested", props.requestTime]);
  }
  if (
    typeof props.requestedFrom === "string" &&
    props.requestedFrom.length > 0
  ) {
    metaRows.push(["From", props.requestedFrom]);
  }
  metaRows.push(["Scheduled deletion", props.scheduledDeletionDate]);
  if (typeof gracePeriodDays === "number") {
    metaRows.push([
      "Grace period",
      `${gracePeriodDays} day${gracePeriodDays === 1 ? "" : "s"}`,
    ]);
  }

  const previewText = `${props.name}, your ${productName} account is scheduled for deletion on ${props.scheduledDeletionDate}. You can still cancel.`;

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
              {productName} · Account
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
              Your account is scheduled for deletion
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
              We received a request to permanently delete your {productName}{" "}
              account. We're confirming the request so you have a chance to
              cancel it if you didn't ask for this — or changed your mind.
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: COUNTDOWN_BG,
                border: `1px solid ${COUNTDOWN_BORDER}`,
                borderRadius: "10px",
                padding: "18px 18px",
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  color: COUNTDOWN_ACCENT,
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  margin: "0 0 6px 0",
                  textTransform: "uppercase",
                }}
              >
                Scheduled deletion
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "22px",
                  fontWeight: 700,
                  lineHeight: "1.25",
                  margin: 0,
                }}
              >
                {props.scheduledDeletionDate}
              </Text>
              {typeof gracePeriodDays === "number" ? (
                <Text
                  style={{
                    color: MUTED_FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.5",
                    margin: "6px 0 0 0",
                  }}
                >
                  You have{" "}
                  <strong style={{ color: COUNTDOWN_ACCENT }}>
                    {gracePeriodDays} day{gracePeriodDays === 1 ? "" : "s"}
                  </strong>{" "}
                  to cancel before deletion becomes permanent.
                </Text>
              ) : null}
            </div>
          </Section>

          {metaRows.length > 0 ? (
            <Section style={{ padding: "20px 32px 8px 32px" }}>
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
                  margin: "0 0 8px 0",
                  textTransform: "uppercase",
                }}
              >
                What will be deleted
              </Text>
              {itemsToBeDeleted.map((item, idx) => (
                <Text
                  key={idx}
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: "0 0 6px 0",
                    paddingLeft: "16px",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      color: BRAND_BLUE_DARK,
                      fontWeight: 700,
                      left: 0,
                      position: "absolute",
                    }}
                  >
                    •
                  </span>
                  {item}
                </Text>
              ))}
            </div>
          </Section>

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={props.cancelDeletionUrl}
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
              Cancel the deletion request
            </Button>
          </Section>

          <Section style={{ padding: "8px 32px 20px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "12px",
                lineHeight: "1.55",
                margin: 0,
                wordBreak: "break-all",
              }}
            >
              Or open this link in your browser:{" "}
              <a
                href={props.cancelDeletionUrl}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {props.cancelDeletionUrl}
              </a>
            </Text>
          </Section>

          <Section style={{ padding: "8px 32px 24px 32px" }}>
            <div
              style={{
                backgroundColor: ALERT_BG,
                border: `1px solid ${ALERT_BORDER}`,
                borderLeft: `4px solid ${BRAND_RED}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: BRAND_RED_DARK,
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                Didn't request this?
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                If you didn't ask to delete your account, cancel the request
                right away and change your password. Then reach out to support
                so we can review recent activity on your account.
              </Text>
            </div>
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
              Once the grace period ends, deletion is permanent and your data
              cannot be restored. Questions? Reach us at{" "}
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
            © {new Date().getFullYear()} {productName}. This notice was sent
            to confirm an account deletion request on the address associated
            with your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

AccountDeletionRequestedEmail.PreviewProps = {
  name: "Jane Doe",
  scheduledDeletionDate: "Jul 22, 2026",
  cancelDeletionUrl:
    "https://schemavaults.com/account/deletion/cancel?token=example-token",
  gracePeriodDays: 30,
  requestedFrom: "San Francisco, CA · 203.0.113.42",
  requestTime: "Jun 22, 2026 14:05 UTC",
  itemsToBeDeleted: [
    "Your account profile and authentication credentials",
    "Schemas you have vaulted and any private collections you own",
    "API keys, tokens, and active sessions tied to your account",
    "Mailing list subscriptions and notification preferences",
  ],
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies AccountDeletionRequestedEmailProps;
