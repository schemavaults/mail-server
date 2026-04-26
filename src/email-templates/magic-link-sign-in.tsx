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
  signInUrl: string;
  recipientName?: string;
  recipientEmail?: string;
  expiresInMinutes?: number;
  requestedFromDevice?: string;
  requestedFromBrowser?: string;
  requestedFromLocation?: string;
  requestedFromIp?: string;
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
const ACCENT_BG = "#eff6ff";
const ACCENT_BORDER = "#bfdbfe";

export default function MagicLinkSignInEmail(
  props: MagicLinkSignInEmailProps,
): ReactElement {
  if (
    typeof props.signInUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'signInUrl' in props for MagicLinkSignInEmail template!",
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
  const expiresInMinutes: number =
    typeof props.expiresInMinutes === "number" &&
    Number.isFinite(props.expiresInMinutes) &&
    props.expiresInMinutes > 0
      ? Math.floor(props.expiresInMinutes)
      : 15;

  const previewText = `Your ${productName} sign-in link — expires in ${expiresInMinutes} minutes.`;

  const metaRows: Array<[string, string]> = [];
  if (
    typeof props.recipientEmail === "string" &&
    props.recipientEmail.length > 0
  ) {
    metaRows.push(["Account", props.recipientEmail]);
  }
  if (typeof props.requestedAt === "string" && props.requestedAt.length > 0) {
    metaRows.push(["Requested", props.requestedAt]);
  }
  if (
    typeof props.requestedFromDevice === "string" &&
    props.requestedFromDevice.length > 0
  ) {
    metaRows.push(["Device", props.requestedFromDevice]);
  }
  if (
    typeof props.requestedFromBrowser === "string" &&
    props.requestedFromBrowser.length > 0
  ) {
    metaRows.push(["Browser", props.requestedFromBrowser]);
  }
  if (
    typeof props.requestedFromLocation === "string" &&
    props.requestedFromLocation.length > 0
  ) {
    metaRows.push(["Location", props.requestedFromLocation]);
  }
  if (
    typeof props.requestedFromIp === "string" &&
    props.requestedFromIp.length > 0
  ) {
    metaRows.push(["IP address", props.requestedFromIp]);
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
              {productName} · Sign in
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
              Your one-time sign-in link
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
              You requested a sign-in link for {productName}. Click the
              button below to sign in — no password required. This link is
              single-use and expires shortly.
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 4px 32px" }}>
            <Button
              href={props.signInUrl}
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

          <Section style={{ padding: "12px 32px 8px 32px" }}>
            <div
              style={{
                backgroundColor: ACCENT_BG,
                border: `1px solid ${ACCENT_BORDER}`,
                borderRadius: "8px",
                padding: "10px 14px",
              }}
            >
              <Text
                style={{
                  color: BRAND_BLUE_DARK,
                  fontSize: "13px",
                  fontWeight: 600,
                  lineHeight: "1.5",
                  margin: 0,
                }}
              >
                This link expires in {expiresInMinutes}{" "}
                {expiresInMinutes === 1 ? "minute" : "minutes"} and can only
                be used once.
              </Text>
            </div>
          </Section>

          <Section style={{ padding: "8px 32px 16px 32px" }}>
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
                href={props.signInUrl}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {props.signInUrl}
              </a>
            </Text>
          </Section>

          {metaRows.length > 0 ? (
            <>
              <Hr style={{ borderColor: BORDER, margin: "0 32px" }} />
              <Section style={{ padding: "20px 32px 8px 32px" }}>
                <Text
                  style={{
                    color: MUTED_FOREGROUND,
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    margin: "0 0 10px 0",
                    textTransform: "uppercase",
                  }}
                >
                  Request details
                </Text>
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    backgroundColor: PANEL_BG,
                    border: `1px solid ${BORDER}`,
                    borderCollapse: "separate",
                    borderRadius: "8px",
                    width: "100%",
                  }}
                >
                  <tbody>
                    {metaRows.map(([label, value]) => (
                      <tr key={label}>
                        <td
                          style={{
                            color: MUTED_FOREGROUND,
                            fontSize: "13px",
                            lineHeight: "1.6",
                            padding: "8px 12px 8px 14px",
                            verticalAlign: "top",
                            whiteSpace: "nowrap",
                            width: "30%",
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
                            padding: "8px 14px 8px 0",
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
            </>
          ) : null}

          <Hr style={{ borderColor: BORDER, margin: "16px 32px 0 32px" }} />

          <Section style={{ padding: "20px 32px 28px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Didn't request this? You can safely ignore this email — the
              link will expire on its own and your account stays untouched.
              If you're concerned, reach us at{" "}
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
            © {new Date().getFullYear()} {productName}. You are receiving this
            email because a sign-in link was requested for your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

MagicLinkSignInEmail.PreviewProps = {
  signInUrl:
    "https://schemavaults.com/auth/sign-in?token=example-magic-link-token",
  recipientName: "Jane Doe",
  recipientEmail: "jane@acme.co",
  expiresInMinutes: 15,
  requestedFromDevice: "MacBook Pro",
  requestedFromBrowser: "Chrome 126",
  requestedFromLocation: "San Francisco, CA",
  requestedFromIp: "203.0.113.42",
  requestedAt: "Apr 26, 2026 14:32 UTC",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies MagicLinkSignInEmailProps;
