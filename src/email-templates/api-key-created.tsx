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
  keyPrefix?: string;
  keyLastFour?: string;
  scopes?: readonly string[];
  createdAt?: string;
  createdByName?: string;
  createdByEmail?: string;
  ipAddress?: string;
  location?: string;
  expiresAt?: string;
  manageKeysUrl: string;
  revokeKeyUrl?: string;
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
const CODE_BG = "#0f172a";
const CODE_FG = "#e2e8f0";
const ALERT_BG = "#fef2f2";
const ALERT_BORDER = "#fecaca";

function formatMaskedKey(prefix: string | undefined, lastFour: string | undefined): string | undefined {
  const p =
    typeof prefix === "string" && prefix.length > 0 ? prefix : undefined;
  const l =
    typeof lastFour === "string" && lastFour.length > 0 ? lastFour : undefined;
  if (!p && !l) return undefined;
  return `${p ?? ""}${p ? "_" : ""}••••••••${l ?? ""}`;
}

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
  const maskedKey: string | undefined = formatMaskedKey(
    props.keyPrefix,
    props.keyLastFour,
  );
  const scopes: readonly string[] =
    Array.isArray(props.scopes) && props.scopes.length > 0 ? props.scopes : [];
  const createdByLine: string | undefined =
    typeof props.createdByName === "string" && props.createdByName.length > 0
      ? typeof props.createdByEmail === "string" &&
        props.createdByEmail.length > 0
        ? `${props.createdByName} (${props.createdByEmail})`
        : props.createdByName
      : typeof props.createdByEmail === "string" &&
          props.createdByEmail.length > 0
        ? props.createdByEmail
        : undefined;

  const previewText = `A new API key "${props.keyName}" was created on your ${productName} account.`;

  const metaRows: Array<[string, string]> = [["Key name", props.keyName]];
  if (maskedKey) {
    metaRows.push(["Key", maskedKey]);
  }
  if (createdByLine) {
    metaRows.push(["Created by", createdByLine]);
  }
  if (typeof props.createdAt === "string" && props.createdAt.length > 0) {
    metaRows.push(["Created at", props.createdAt]);
  }
  if (typeof props.ipAddress === "string" && props.ipAddress.length > 0) {
    metaRows.push(["IP address", props.ipAddress]);
  }
  if (typeof props.location === "string" && props.location.length > 0) {
    metaRows.push(["Location", props.location]);
  }
  if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
    metaRows.push(["Expires", props.expiresAt]);
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
              {productName} · API access
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
              A new API key was created.
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
              issued on your {productName} account. The full key is only
              displayed once — at the moment of creation — and is never sent in
              email. If you saved it, keep it secret like a password.
            </Text>
          </Section>

          {maskedKey ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: CODE_BG,
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
                  Key identifier
                </Text>
                <Text
                  style={{
                    color: CODE_FG,
                    fontFamily:
                      "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
                    fontSize: "14px",
                    letterSpacing: "0.02em",
                    margin: 0,
                    wordBreak: "break-all",
                  }}
                >
                  {maskedKey}
                </Text>
              </div>
            </Section>
          ) : null}

          {scopes.length > 0 ? (
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
                  Scopes granted
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontFamily:
                      "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
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
                        wordBreak: "break-all",
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
              Manage API keys
            </Button>
          </Section>

          <Section style={{ padding: "16px 32px 8px 32px" }}>
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
                Didn't create this key?
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: "0 0 10px 0",
                }}
              >
                Revoke it right away and rotate any other credentials you
                think may be exposed.
              </Text>
              {typeof props.revokeKeyUrl === "string" &&
              props.revokeKeyUrl.length > 0 ? (
                <Button
                  href={props.revokeKeyUrl}
                  style={{
                    backgroundColor: BRAND_RED,
                    borderRadius: "6px",
                    color: "#ffffff",
                    display: "inline-block",
                    fontSize: "13px",
                    fontWeight: 600,
                    padding: "8px 14px",
                    textDecoration: "none",
                  }}
                >
                  Revoke this key
                </Button>
              ) : null}
            </div>
          </Section>

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
              Questions? Reach us at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>
              . We'll never ask for your API key or password over email.
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
            notification because an API key was issued on your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

ApiKeyCreatedEmail.PreviewProps = {
  userName: "Jane Doe",
  keyName: "production-pipeline-writer",
  keyPrefix: "svlts_pk",
  keyLastFour: "a3f2",
  scopes: ["schemas:read", "schemas:write", "vaults:read"],
  createdAt: "May 14, 2026 14:22 UTC",
  createdByName: "Jane Doe",
  createdByEmail: "jane@acme.co",
  ipAddress: "203.0.113.42",
  location: "San Francisco, CA",
  expiresAt: "Nov 14, 2026 14:22 UTC",
  manageKeysUrl: "https://schemavaults.com/account/api-keys",
  revokeKeyUrl:
    "https://schemavaults.com/account/api-keys/revoke?id=key_example",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies ApiKeyCreatedEmailProps;
