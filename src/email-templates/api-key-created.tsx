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
  name: string;
  keyName: string;
  keyPrefix: string;
  scopes?: string[];
  createdAt?: string;
  createdBy?: string;
  manageKeysUrl?: string;
  revokeUrl?: string;
  docsUrl?: string;
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
const CODE_BG = "#0b1220";
const CODE_FG = "#e2e8f0";
const NOTICE_BG = "#fffbeb";
const NOTICE_BORDER = "#fde68a";
const NOTICE_ACCENT = "#b45309";

export default function ApiKeyCreatedEmail(
  props: ApiKeyCreatedEmailProps,
): ReactElement {
  if (
    typeof props.name !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error("Missing 'name' in props for ApiKeyCreatedEmail template!");
  }
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

  const productName: string =
    typeof props.productName === "string" && props.productName.length > 0
      ? props.productName
      : "SchemaVaults";
  const supportEmail: string =
    typeof props.supportEmail === "string" && props.supportEmail.length > 0
      ? props.supportEmail
      : "support@schemavaults.com";
  const manageKeysUrl: string =
    typeof props.manageKeysUrl === "string" && props.manageKeysUrl.length > 0
      ? props.manageKeysUrl
      : "https://schemavaults.com/account/api-keys";
  const revokeUrl: string | undefined =
    typeof props.revokeUrl === "string" && props.revokeUrl.length > 0
      ? props.revokeUrl
      : undefined;
  const docsUrl: string | undefined =
    typeof props.docsUrl === "string" && props.docsUrl.length > 0
      ? props.docsUrl
      : undefined;
  const createdBy: string =
    typeof props.createdBy === "string" && props.createdBy.length > 0
      ? props.createdBy
      : "you";
  const scopes: string[] = Array.isArray(props.scopes)
    ? props.scopes.filter(
        (s): s is string => typeof s === "string" && s.length > 0,
      )
    : [];

  const metaRows: Array<[string, string]> = [];
  metaRows.push(["Key name", props.keyName]);
  metaRows.push(["Created by", createdBy]);
  if (typeof props.createdAt === "string" && props.createdAt.length > 0) {
    metaRows.push(["Created at", props.createdAt]);
  }

  const previewText = `A new API key (${props.keyName}) was created on your ${productName} account.`;

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
              {productName} · API keys
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
              Your new API key is ready
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
              A new API key named <strong>{props.keyName}</strong> was just
              created on your {productName} account. Use it to authenticate
              requests from your apps, servers, and background jobs.
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 0 32px" }}>
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
              Key prefix
            </Text>
            <div
              style={{
                backgroundColor: CODE_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: "8px",
                padding: "12px 14px",
              }}
            >
              <Text
                style={{
                  color: CODE_FG,
                  fontFamily:
                    "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
                  fontSize: "14px",
                  lineHeight: "1.4",
                  margin: 0,
                  wordBreak: "break-all",
                }}
              >
                {props.keyPrefix}
              </Text>
            </div>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "12px",
                lineHeight: "1.5",
                margin: "6px 0 0 0",
              }}
            >
              Only the public prefix is shown here. The full secret was
              displayed once at creation and cannot be retrieved again.
            </Text>
          </Section>

          {scopes.length > 0 ? (
            <Section style={{ padding: "20px 32px 0 32px" }}>
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
                Scopes
              </Text>
              <div>
                {scopes.map((scope) => (
                  <span
                    key={scope}
                    style={{
                      backgroundColor: PANEL_BG,
                      border: `1px solid ${BORDER}`,
                      borderRadius: "999px",
                      color: BRAND_BLUE_DARK,
                      display: "inline-block",
                      fontFamily:
                        "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
                      fontSize: "12px",
                      fontWeight: 500,
                      margin: "0 6px 6px 0",
                      padding: "4px 10px",
                    }}
                  >
                    {scope}
                  </span>
                ))}
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 0 32px" }}>
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

          <Section style={{ padding: "20px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: NOTICE_BG,
                border: `1px solid ${NOTICE_BORDER}`,
                borderLeft: `4px solid ${NOTICE_ACCENT}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: NOTICE_ACCENT,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                Keep it secret, keep it safe
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                Store the full secret in a secret manager or environment
                variable. Never commit it to source control or ship it in a
                browser bundle.
              </Text>
            </div>
          </Section>

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={manageKeysUrl}
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
            {docsUrl ? (
              <a
                href={docsUrl}
                style={{
                  color: BRAND_BLUE_DARK,
                  display: "inline-block",
                  fontSize: "14px",
                  fontWeight: 500,
                  marginLeft: "12px",
                  padding: "12px 4px",
                  textDecoration: "none",
                  verticalAlign: "middle",
                }}
              >
                Read the docs →
              </a>
            ) : null}
          </Section>

          <Section style={{ padding: "4px 32px 24px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Didn't create this key?{" "}
              {revokeUrl ? (
                <>
                  <a
                    href={revokeUrl}
                    style={{
                      color: BRAND_RED_DARK,
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Revoke it now
                  </a>{" "}
                  and contact support.
                </>
              ) : (
                <>
                  Revoke it immediately from your API keys page and contact
                  support.
                </>
              )}
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
            © {new Date().getFullYear()} {productName}. This notification was
            sent to the address on file for your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

ApiKeyCreatedEmail.PreviewProps = {
  name: "Jane Doe",
  keyName: "Production ingest service",
  keyPrefix: "svlts_mail_pk_4b8c9d1e",
  scopes: ["schemas:read", "schemas:write", "mailing-lists:send"],
  createdAt: "Apr 21, 2026 09:12 UTC",
  createdBy: "Jane Doe (jane@acme.co)",
  manageKeysUrl: "https://schemavaults.com/account/api-keys",
  revokeUrl:
    "https://schemavaults.com/account/api-keys?revoke=svlts_mail_pk_4b8c9d1e",
  docsUrl: "https://docs.schemavaults.com/api/authentication",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies ApiKeyCreatedEmailProps;
