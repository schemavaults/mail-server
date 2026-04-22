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

export interface MailingListSubscriptionConfirmationEmailProps {
  email: string;
  mailingListName: string;
  confirmUrl: string;
  mailingListDescription?: string;
  expiresAt?: string;
  cadence?: string;
  productName?: string;
  supportEmail?: string;
  unsubscribeUrl?: string;
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

export default function MailingListSubscriptionConfirmationEmail(
  props: MailingListSubscriptionConfirmationEmailProps,
): ReactElement {
  if (
    typeof props.email !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'email' in props for MailingListSubscriptionConfirmationEmail template!",
    );
  }
  if (
    typeof props.mailingListName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'mailingListName' in props for MailingListSubscriptionConfirmationEmail template!",
    );
  }
  if (
    typeof props.confirmUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'confirmUrl' in props for MailingListSubscriptionConfirmationEmail template!",
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
  const mailingListDescription: string | undefined =
    typeof props.mailingListDescription === "string" &&
    props.mailingListDescription.length > 0
      ? props.mailingListDescription
      : undefined;
  const expiresAt: string | undefined =
    typeof props.expiresAt === "string" && props.expiresAt.length > 0
      ? props.expiresAt
      : undefined;
  const cadence: string | undefined =
    typeof props.cadence === "string" && props.cadence.length > 0
      ? props.cadence
      : undefined;
  const unsubscribeUrl: string | undefined =
    typeof props.unsubscribeUrl === "string" && props.unsubscribeUrl.length > 0
      ? props.unsubscribeUrl
      : undefined;

  const previewText = `Confirm your subscription to ${props.mailingListName}.`;

  const metaRows: Array<[string, string]> = [
    ["List", props.mailingListName],
    ["Address", props.email],
  ];
  if (cadence) {
    metaRows.push(["Cadence", cadence]);
  }
  if (expiresAt) {
    metaRows.push(["Link expires", expiresAt]);
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
              Confirm your subscription
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
              Hi there,
            </Text>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "15px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Someone — hopefully you — asked to subscribe{" "}
              <strong>{props.email}</strong> to the{" "}
              <strong>{props.mailingListName}</strong> mailing list on{" "}
              {productName}. Confirm below and you're on the list.
            </Text>
          </Section>

          {mailingListDescription ? (
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
                  About this list
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  {mailingListDescription}
                </Text>
              </div>
            </Section>
          ) : null}

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
              href={props.confirmUrl}
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
              Confirm subscription
            </Button>
          </Section>

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
                href={props.confirmUrl}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {props.confirmUrl}
              </a>
            </Text>
          </Section>

          <Hr style={{ borderColor: BORDER, margin: "0 32px" }} />

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Didn't subscribe? You can safely ignore this email — we won't add
              you to the list unless you click the button above
              {unsubscribeUrl ? (
                <>
                  , or use{" "}
                  <a
                    href={unsubscribeUrl}
                    style={{
                      color: BRAND_BLUE_DARK,
                      textDecoration: "none",
                    }}
                  >
                    this unsubscribe link
                  </a>{" "}
                  to make sure you're off the list for good
                </>
              ) : null}
              . Questions? Reach us at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>
              .
            </Text>
          </Section>

          <Section style={{ padding: "12px 32px 28px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "12px",
                lineHeight: "1.55",
                margin: 0,
              }}
            >
              We'll never share your address. You can unsubscribe any time.
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
            email because this address was used to subscribe to{" "}
            {props.mailingListName}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

MailingListSubscriptionConfirmationEmail.PreviewProps = {
  email: "jane@acme.co",
  mailingListName: "SchemaVaults Product Updates",
  mailingListDescription:
    "Monthly notes on new schemas, platform releases, and upcoming features — from the SchemaVaults team.",
  confirmUrl:
    "https://schemavaults.com/mailing-lists/confirm?token=example-token",
  unsubscribeUrl:
    "https://schemavaults.com/mailing-lists/unsubscribe?token=example-token",
  cadence: "About one email per month",
  expiresAt: "Apr 29, 2026 17:00 UTC",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies MailingListSubscriptionConfirmationEmailProps;
