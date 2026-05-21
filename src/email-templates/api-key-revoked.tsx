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

export interface ApiKeyRevokedEmailProps {
  userName?: string;
  keyName: string;
  keyPrefix?: string;
  keyLastFour?: string;
  scopes?: readonly string[];
  createdAt?: string;
  revokedAt?: string;
  revokedByName?: string;
  revokedByEmail?: string;
  revocationReason?: string;
  ipAddress?: string;
  location?: string;
  manageKeysUrl: string;
  createNewKeyUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties, so the token hex values are inlined here.
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

function formatMaskedKey(
  prefix: string | undefined,
  lastFour: string | undefined,
): string | undefined {
  const p =
    typeof prefix === "string" && prefix.length > 0 ? prefix : undefined;
  const l =
    typeof lastFour === "string" && lastFour.length > 0 ? lastFour : undefined;
  if (!p && !l) return undefined;
  return `${p ?? ""}${p ? "_" : ""}••••••••${l ?? ""}`;
}

export default function ApiKeyRevokedEmail(
  props: ApiKeyRevokedEmailProps,
): ReactElement {
  if (
    typeof props.keyName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'keyName' in props for ApiKeyRevokedEmail template!",
    );
  }
  if (
    typeof props.manageKeysUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'manageKeysUrl' in props for ApiKeyRevokedEmail template!",
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
  const revokedByLine: string | undefined =
    typeof props.revokedByName === "string" && props.revokedByName.length > 0
      ? typeof props.revokedByEmail === "string" &&
        props.revokedByEmail.length > 0
        ? `${props.revokedByName} (${props.revokedByEmail})`
        : props.revokedByName
      : typeof props.revokedByEmail === "string" &&
          props.revokedByEmail.length > 0
        ? props.revokedByEmail
        : undefined;

  const previewText = `The API key "${props.keyName}" was revoked on your ${productName} account.`;

  const metaRows: Array<[string, string]> = [["Key name", props.keyName]];
  if (maskedKey) {
    metaRows.push(["Key", maskedKey]);
  }
  if (revokedByLine) {
    metaRows.push(["Revoked by", revokedByLine]);
  }
  if (typeof props.revokedAt === "string" && props.revokedAt.length > 0) {
    metaRows.push(["Revoked at", props.revokedAt]);
  }
  if (typeof props.createdAt === "string" && props.createdAt.length > 0) {
    metaRows.push(["Originally created", props.createdAt]);
  }
  if (typeof props.ipAddress === "string" && props.ipAddress.length > 0) {
    metaRows.push(["IP address", props.ipAddress]);
  }
  if (typeof props.location === "string" && props.location.length > 0) {
    metaRows.push(["Location", props.location]);
  }

  const revocationReason: string | undefined =
    typeof props.revocationReason === "string" &&
    props.revocationReason.length > 0
      ? props.revocationReason
      : undefined;

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
              background: `linear-gradient(135deg, ${BRAND_RED} 0%, ${BRAND_RED_DARK} 100%)`,
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
              An API key was revoked.
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
              The API key named <strong>{props.keyName}</strong> on your{" "}
              {productName} account has been revoked. Any requests it was
              authorizing will now fail with <code>401 Unauthorized</code>.
              Make sure to update any integrations that depended on this key.
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

          {revocationReason ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
                  borderLeft: `4px solid ${BRAND_RED_DARK}`,
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
                  Reason
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  {revocationReason}
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
                  Scopes that were granted
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
            {typeof props.createNewKeyUrl === "string" &&
            props.createNewKeyUrl.length > 0 ? (
              <Button
                href={props.createNewKeyUrl}
                style={{
                  backgroundColor: CARD_BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "8px",
                  color: BRAND_BLUE_DARK,
                  display: "inline-block",
                  fontSize: "15px",
                  fontWeight: 600,
                  marginLeft: "10px",
                  padding: "12px 22px",
                  textDecoration: "none",
                }}
              >
                Create a new key
              </Button>
            ) : null}
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
                Didn't expect this?
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                If you didn't revoke this key and don't recognize who did,
                someone else may have access to your account. Review your
                active sessions and rotate other credentials right away, then
                contact{" "}
                <a
                  href={`mailto:${supportEmail}`}
                  style={{
                    color: BRAND_RED_DARK,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  {supportEmail}
                </a>
                .
              </Text>
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
            notification because an API key was revoked on your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

ApiKeyRevokedEmail.PreviewProps = {
  userName: "Jane Doe",
  keyName: "production-pipeline-writer",
  keyPrefix: "svlts_pk",
  keyLastFour: "a3f2",
  scopes: ["schemas:read", "schemas:write", "vaults:read"],
  createdAt: "May 14, 2026 14:22 UTC",
  revokedAt: "May 21, 2026 09:48 UTC",
  revokedByName: "Jane Doe",
  revokedByEmail: "jane@acme.co",
  revocationReason:
    "Routine quarterly rotation — replaced by 'production-pipeline-writer-v2'.",
  ipAddress: "203.0.113.42",
  location: "San Francisco, CA",
  manageKeysUrl: "https://schemavaults.com/account/api-keys",
  createNewKeyUrl: "https://schemavaults.com/account/api-keys/new",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies ApiKeyRevokedEmailProps;
