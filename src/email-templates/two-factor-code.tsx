import {
  Body,
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

export interface TwoFactorCodeEmailProps {
  code: string;
  userName?: string;
  expiresInMinutes?: string;
  requestIp?: string;
  requestLocation?: string;
  requestUserAgent?: string;
  requestTime?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties, so the token hex values are inlined here.
const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
const BRAND_RED = "#dc2626";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const CODE_BG = "#eff6ff";
const CODE_BORDER = "#bfdbfe";

function formatCodeDisplay(code: string): string {
  const digits = code.replace(/\s+/g, "");
  if (digits.length === 6) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  }
  if (digits.length === 8) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  }
  return digits;
}

export default function TwoFactorCodeEmail(
  props: TwoFactorCodeEmailProps,
): ReactElement {
  if (
    typeof props.code !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'code' in props for TwoFactorCodeEmail template!",
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
    typeof props.userName === "string" && props.userName.length > 0
      ? props.userName
      : "there";
  const expiresInMinutes: string =
    typeof props.expiresInMinutes === "string" &&
    props.expiresInMinutes.length > 0
      ? props.expiresInMinutes
      : "10 minutes";

  const rawCode: string = typeof props.code === "string" ? props.code : "";
  const displayCode: string = formatCodeDisplay(rawCode);

  const requestRows: Array<[string, string]> = [];
  if (
    typeof props.requestTime === "string" &&
    props.requestTime.length > 0
  ) {
    requestRows.push(["Requested", props.requestTime]);
  }
  if (
    typeof props.requestLocation === "string" &&
    props.requestLocation.length > 0
  ) {
    requestRows.push(["Location", props.requestLocation]);
  }
  if (typeof props.requestIp === "string" && props.requestIp.length > 0) {
    requestRows.push(["IP address", props.requestIp]);
  }
  if (
    typeof props.requestUserAgent === "string" &&
    props.requestUserAgent.length > 0
  ) {
    requestRows.push(["Device", props.requestUserAgent]);
  }

  const previewText = `Your ${productName} verification code is ${displayCode}. It expires in ${expiresInMinutes}.`;

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
              {productName} · Verification code
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
              Your one-time sign-in code
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
              Enter the verification code below to complete your sign-in to{" "}
              {productName}. This code expires in{" "}
              <strong>{expiresInMinutes}</strong>.
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <div
              style={{
                backgroundColor: CODE_BG,
                border: `1px solid ${CODE_BORDER}`,
                borderRadius: "10px",
                padding: "22px 16px",
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  margin: "0 0 10px 0",
                  textAlign: "center",
                  textTransform: "uppercase",
                }}
              >
                Verification code
              </Text>
              <Text
                style={{
                  color: BRAND_BLUE_DARK,
                  fontFamily:
                    "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
                  fontSize: "36px",
                  fontWeight: 700,
                  letterSpacing: "0.28em",
                  lineHeight: "1.1",
                  margin: 0,
                  textAlign: "center",
                }}
              >
                {displayCode}
              </Text>
            </div>
          </Section>

          {requestRows.length > 0 ? (
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
                  Request details
                </Text>
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{ borderCollapse: "collapse", width: "100%" }}
                >
                  <tbody>
                    {requestRows.map(([label, value]) => (
                      <tr key={label}>
                        <td
                          style={{
                            color: MUTED_FOREGROUND,
                            fontSize: "13px",
                            lineHeight: "1.6",
                            padding: "3px 12px 3px 0",
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
                            padding: "3px 0",
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
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <div
              style={{
                backgroundColor: "#fef2f2",
                border: `1px solid #fecaca`,
                borderLeft: `4px solid ${BRAND_RED}`,
                borderRadius: "8px",
                padding: "12px 14px",
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
                <strong>Didn't try to sign in?</strong> Ignore this email and
                consider changing your password. {productName} will never ask
                you to share this code with anyone.
              </Text>
            </div>
          </Section>

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
              Questions? Reach us at{" "}
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
            email because a verification code was requested for your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

TwoFactorCodeEmail.PreviewProps = {
  code: "428193",
  userName: "Jane Doe",
  expiresInMinutes: "10 minutes",
  requestIp: "203.0.113.42",
  requestLocation: "San Francisco, CA, USA",
  requestUserAgent: "Chrome 140 on macOS 15",
  requestTime: "Jul 4, 2026 14:32 UTC",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies TwoFactorCodeEmailProps;
