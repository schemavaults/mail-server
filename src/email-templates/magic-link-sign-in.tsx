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

export interface MagicLinkSignInEmailProps {
  magicLinkUrl: string;
  recipientEmail?: string;
  recipientName?: string;
  oneTimeCode?: string;
  expiresInMinutes?: number;
  device?: string;
  browser?: string;
  location?: string;
  ipAddress?: string;
  requestedAt?: string;
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
const CODE_BG = "#0f172a";
const CODE_FG = "#f8fafc";

export default function MagicLinkSignInEmail(
  props: MagicLinkSignInEmailProps,
): ReactElement {
  if (
    typeof props.magicLinkUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'magicLinkUrl' in props for MagicLinkSignInEmail template!",
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
  const recipientName: string =
    typeof props.recipientName === "string" && props.recipientName.length > 0
      ? props.recipientName
      : "there";
  const recipientEmail: string | undefined =
    typeof props.recipientEmail === "string" && props.recipientEmail.length > 0
      ? props.recipientEmail
      : undefined;
  const expiresInMinutes: number =
    typeof props.expiresInMinutes === "number" &&
    Number.isFinite(props.expiresInMinutes) &&
    props.expiresInMinutes > 0
      ? Math.floor(props.expiresInMinutes)
      : 15;
  const oneTimeCode: string | undefined =
    typeof props.oneTimeCode === "string" && props.oneTimeCode.length > 0
      ? props.oneTimeCode
      : undefined;

  const contextRows: Array<[string, string]> = [];
  if (typeof props.requestedAt === "string" && props.requestedAt.length > 0) {
    contextRows.push(["Requested", props.requestedAt]);
  }
  if (typeof props.device === "string" && props.device.length > 0) {
    contextRows.push(["Device", props.device]);
  }
  if (typeof props.browser === "string" && props.browser.length > 0) {
    contextRows.push(["Browser", props.browser]);
  }
  if (typeof props.location === "string" && props.location.length > 0) {
    contextRows.push(["Location", props.location]);
  }
  if (typeof props.ipAddress === "string" && props.ipAddress.length > 0) {
    contextRows.push(["IP address", props.ipAddress]);
  }

  const previewText = `Your ${productName} sign-in link — expires in ${expiresInMinutes} minutes.`;

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
              {productName} · Sign-in link
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
              Your magic sign-in link is ready.
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
              Hi {recipientName},
            </Text>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "15px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Click the button below to securely sign in to{" "}
              <strong>{productName}</strong>
              {recipientEmail ? (
                <>
                  {" "}
                  as <strong>{recipientEmail}</strong>
                </>
              ) : null}
              . This link will expire in{" "}
              <strong>{expiresInMinutes} minutes</strong> and can only be used
              once.
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={props.magicLinkUrl}
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
              Sign in to {productName}
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
                href={props.magicLinkUrl}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {props.magicLinkUrl}
              </a>
            </Text>
          </Section>

          {oneTimeCode ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
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
                  Or paste this one-time code
                </Text>
                <div
                  style={{
                    backgroundColor: CODE_BG,
                    borderRadius: "6px",
                    color: CODE_FG,
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                    fontSize: "20px",
                    fontWeight: 600,
                    letterSpacing: "0.18em",
                    padding: "12px 16px",
                    textAlign: "center",
                  }}
                >
                  {oneTimeCode}
                </div>
              </div>
            </Section>
          ) : null}

          {contextRows.length > 0 ? (
            <Section style={{ padding: "16px 32px 8px 32px" }}>
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
                Sign-in attempt details
              </Text>
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{ borderCollapse: "collapse", width: "100%" }}
              >
                <tbody>
                  {contextRows.map(([label, value]) => (
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

          <Hr style={{ borderColor: BORDER, margin: "20px 32px 0 32px" }} />

          <Section style={{ padding: "16px 32px 28px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Didn't request this email? You can safely ignore it — your account
              stays secure as long as the link is not used. If you're worried
              about unauthorized access, please contact us at{" "}
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
            © {new Date().getFullYear()} {productName}. This sign-in link was
            requested from your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

MagicLinkSignInEmail.PreviewProps = {
  magicLinkUrl:
    "https://schemavaults.com/auth/magic-link?token=example-magic-link-token-please-replace-in-production",
  recipientEmail: "jane@acme.co",
  recipientName: "Jane",
  oneTimeCode: "742-918",
  expiresInMinutes: 15,
  device: "MacBook Pro",
  browser: "Chrome 134",
  location: "San Francisco, CA",
  ipAddress: "203.0.113.42",
  requestedAt: "Apr 28, 2026 09:14 UTC",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies MagicLinkSignInEmailProps;
