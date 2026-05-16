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

export interface UnsubscribeConfirmationEmailProps {
  mailingListName: string;
  resubscribeUrl: string;
  mailingListDescription?: string;
  unsubscribedEmail?: string;
  unsubscribedAt?: string;
  senderOrganization?: string;
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

export default function UnsubscribeConfirmationEmail(
  props: UnsubscribeConfirmationEmailProps,
): ReactElement {
  if (
    typeof props.mailingListName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'mailingListName' in props for UnsubscribeConfirmationEmail template!",
    );
  }
  if (
    typeof props.resubscribeUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'resubscribeUrl' in props for UnsubscribeConfirmationEmail template!",
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
  const senderOrganization: string =
    typeof props.senderOrganization === "string" &&
    props.senderOrganization.length > 0
      ? props.senderOrganization
      : productName;
  const unsubscribedEmail: string | undefined =
    typeof props.unsubscribedEmail === "string" &&
    props.unsubscribedEmail.length > 0
      ? props.unsubscribedEmail
      : undefined;
  const unsubscribedAt: string | undefined =
    typeof props.unsubscribedAt === "string" &&
    props.unsubscribedAt.length > 0
      ? props.unsubscribedAt
      : undefined;
  const mailingListDescription: string | undefined =
    typeof props.mailingListDescription === "string" &&
    props.mailingListDescription.length > 0
      ? props.mailingListDescription
      : undefined;

  const previewText = `You've been unsubscribed from ${props.mailingListName}.`;

  const metaRows: Array<[string, string]> = [
    ["Mailing list", props.mailingListName],
  ];
  if (unsubscribedEmail) {
    metaRows.push(["Email", unsubscribedEmail]);
  }
  if (unsubscribedAt) {
    metaRows.push(["Unsubscribed", unsubscribedAt]);
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
              {productName} · Unsubscribe confirmed
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
              You're unsubscribed from {props.mailingListName}.
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
              We've removed{" "}
              {unsubscribedEmail ? (
                <strong>{unsubscribedEmail}</strong>
              ) : (
                "this address"
              )}{" "}
              from <strong>{props.mailingListName}</strong>. You won't receive
              any more messages to this list from {senderOrganization}. No
              further action is needed.
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
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "14px",
                lineHeight: "1.6",
                margin: "0 0 12px 0",
              }}
            >
              Unsubscribed by mistake, or changed your mind? You can rejoin at
              any time.
            </Text>
            <Button
              href={props.resubscribeUrl}
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
              Resubscribe
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
                href={props.resubscribeUrl}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {props.resubscribeUrl}
              </a>
            </Text>
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
              Didn't request this change? Someone may have entered this address
              by mistake — use the link above to resubscribe, or reach us at{" "}
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
            © {new Date().getFullYear()} {productName}. This is a one-time
            confirmation that this address was removed from a mailing list.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

UnsubscribeConfirmationEmail.PreviewProps = {
  mailingListName: "SchemaVaults Product Updates",
  resubscribeUrl:
    "https://schemavaults.com/mailing-lists/resubscribe?token=example-token",
  mailingListDescription:
    "Monthly product updates, new schema releases, and ecosystem highlights from the SchemaVaults team.",
  unsubscribedEmail: "jane@acme.co",
  unsubscribedAt: "May 16, 2026 17:00 UTC",
  senderOrganization: "SchemaVaults",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies UnsubscribeConfirmationEmailProps;
