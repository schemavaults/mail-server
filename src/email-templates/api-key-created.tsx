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

export interface ApiKeyCreatedEmailProps {
  userName?: string;
  keyName: string;
  keyPrefix: string;
  manageKeysUrl: string;
  createdAt?: string;
  createdFromDevice?: string;
  createdFromIpAddress?: string;
  createdFromLocation?: string;
  expiresAt?: string;
  scopes?: string[];
  revokeUrl?: string;
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
const CODE_BG = "#0f172a";
const CODE_FOREGROUND = "#e2e8f0";

export default function ApiKeyCreatedEmail(
  props: ApiKeyCreatedEmailProps,
): ReactElement {
  if (
    typeof props.keyName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'keyName' in props for ApiKeyCreatedEmail template!",
    );
  }
  if (
    typeof props.keyPrefix !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'keyPrefix' in props for ApiKeyCreatedEmail template!",
    );
  }
  if (
    typeof props.manageKeysUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'manageKeysUrl' in props for ApiKeyCreatedEmail template!",
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
  const createdAt: string | undefined =
    typeof props.createdAt === "string" && props.createdAt.length > 0
      ? props.createdAt
      : undefined;
  const device: string | undefined =
    typeof props.createdFromDevice === "string" &&
    props.createdFromDevice.length > 0
      ? props.createdFromDevice
      : undefined;
  const ipAddress: string | undefined =
    typeof props.createdFromIpAddress === "string" &&
    props.createdFromIpAddress.length > 0
      ? props.createdFromIpAddress
      : undefined;
  const location: string | undefined =
    typeof props.createdFromLocation === "string" &&
    props.createdFromLocation.length > 0
      ? props.createdFromLocation
      : undefined;
  const expiresAt: string | undefined =
    typeof props.expiresAt === "string" && props.expiresAt.length > 0
      ? props.expiresAt
      : undefined;
  const scopes: readonly string[] =
    Array.isArray(props.scopes) && props.scopes.length > 0 ? props.scopes : [];
  const revokeUrl: string =
    typeof props.revokeUrl === "string" && props.revokeUrl.length > 0
      ? props.revokeUrl
      : props.manageKeysUrl;

  const previewText = `A new API key "${props.keyName}" was created on your ${productName} account.`;

  const metaRows: Array<[string, string]> = [["Key name", props.keyName]];
  metaRows.push(["Prefix", props.keyPrefix]);
  if (createdAt) {
    metaRows.push(["Created", createdAt]);
  }
  if (device) {
    metaRows.push(["Device", device]);
  }
  if (ipAddress) {
    metaRows.push(["IP address", ipAddress]);
  }
  if (location) {
    metaRows.push(["Location", location]);
  }
  if (expiresAt) {
    metaRows.push(["Expires", expiresAt]);
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
              {productName} · API key created
            </Text>
            <Heading
              as="h1"
              style={{
                color: "#ffffff",
                fontSize: "24px",
                fontWeight: 700,
                lineHeight: "1.25",
                margin: "8px 0 0 0",
              }}
            >
              A new API key was issued on your account.
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
              A new API key named <strong>{props.keyName}</strong> was just
              created on your {productName} account. We're letting you know so
              you can confirm it was you — and quickly rotate it if it wasn't.
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: CODE_BG,
                border: `1px solid ${CODE_BG}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: "#94a3b8",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  margin: "0 0 6px 0",
                  textTransform: "uppercase",
                }}
              >
                Key prefix
              </Text>
              <Text
                style={{
                  color: CODE_FOREGROUND,
                  fontFamily:
                    "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
                  fontSize: "14px",
                  lineHeight: "1.4",
                  margin: 0,
                  wordBreak: "break-all",
                }}
              >
                {props.keyPrefix}…
              </Text>
            </div>
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

          {scopes.length > 0 ? (
            <Section style={{ padding: "12px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
                  borderLeft: `4px solid ${BRAND_BLUE_DARK}`,
                  borderRadius: "8px",
                  padding: "12px 16px",
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
                  Scopes
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontFamily:
                      "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    margin: 0,
                  }}
                >
                  {scopes.join(", ")}
                </Text>
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={props.manageKeysUrl}
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
              Review your API keys
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
              Or copy this link into your browser:{" "}
              <a
                href={props.manageKeysUrl}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {props.manageKeysUrl}
              </a>
            </Text>
          </Section>

          <Hr style={{ borderColor: BORDER, margin: "0 32px" }} />

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Text
              style={{
                color: BRAND_RED,
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                margin: "0 0 4px 0",
                textTransform: "uppercase",
              }}
            >
              Didn't create this key?
            </Text>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "14px",
                lineHeight: "1.6",
                margin: "0 0 12px 0",
              }}
            >
              If you don't recognize this activity, revoke the key immediately
              and rotate any credentials shared with it.
            </Text>
            <Button
              href={revokeUrl}
              style={{
                backgroundColor: "#ffffff",
                border: `1px solid ${BRAND_RED}`,
                borderRadius: "8px",
                color: BRAND_RED,
                display: "inline-block",
                fontSize: "14px",
                fontWeight: 600,
                padding: "10px 18px",
                textDecoration: "none",
              }}
            >
              Revoke this key
            </Button>
          </Section>

          <Section style={{ padding: "16px 32px 28px 32px" }}>
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
            email because a new API key was created on your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

ApiKeyCreatedEmail.PreviewProps = {
  userName: "Jane Doe",
  keyName: "CI deploy key",
  keyPrefix: "svlts_mail_pk_a7k2",
  manageKeysUrl: "https://schemavaults.com/admin/keys",
  createdAt: "Apr 23, 2026 14:07 UTC",
  createdFromDevice: "MacBook Pro",
  createdFromIpAddress: "203.0.113.42",
  createdFromLocation: "San Francisco, CA",
  expiresAt: "Apr 23, 2027 14:07 UTC",
  scopes: ["mail:send", "mailing-lists:read"],
  revokeUrl: "https://schemavaults.com/admin/keys?revoke=a7k2",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies ApiKeyCreatedEmailProps;
