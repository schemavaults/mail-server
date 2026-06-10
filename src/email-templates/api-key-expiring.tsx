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

export interface ApiKeyExpiringEmailProps {
  keyName: string;
  expiresAt: string;
  rotateKeyUrl: string;
  userName?: string;
  daysUntilExpiration?: number;
  keyPrefix?: string;
  keyLastFour?: string;
  scopes?: readonly string[];
  lastUsedAt?: string;
  manageKeysUrl?: string;
  productName?: string;
  supportEmail?: string;
  docsUrl?: string;
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
const WARNING_BG = "#fffbeb";
const WARNING_BORDER = "#fde68a";
const WARNING_FG = "#92400e";
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

interface UrgencyCopy {
  ribbon: string;
  ribbonBg: string;
  ribbonFg: string;
  ribbonBorder: string;
  ribbonAccent: string;
  heading: string;
  lede: (keyName: string, product: string) => string;
}

function resolveUrgency(daysUntilExpiration: number | undefined): UrgencyCopy {
  const days =
    typeof daysUntilExpiration === "number" &&
    Number.isFinite(daysUntilExpiration)
      ? Math.floor(daysUntilExpiration)
      : undefined;

  if (days !== undefined && days <= 0) {
    return {
      ribbon: "Expired",
      ribbonBg: ALERT_BG,
      ribbonFg: BRAND_RED_DARK,
      ribbonBorder: ALERT_BORDER,
      ribbonAccent: BRAND_RED,
      heading: "Your API key has expired.",
      lede: (keyName, product) =>
        `Your ${product} API key "${keyName}" has reached its expiration date and is no longer accepted by the API. Issue a replacement now to restore traffic.`,
    };
  }
  if (days !== undefined && days <= 3) {
    return {
      ribbon: days === 1 ? "Expires in 1 day" : `Expires in ${days} days`,
      ribbonBg: ALERT_BG,
      ribbonFg: BRAND_RED_DARK,
      ribbonBorder: ALERT_BORDER,
      ribbonAccent: BRAND_RED,
      heading: "Your API key is about to expire.",
      lede: (keyName, product) =>
        `Your ${product} API key "${keyName}" stops working in the next few days. Rotate it now to avoid downtime in any integration that depends on it.`,
    };
  }
  if (days !== undefined) {
    return {
      ribbon: `Expires in ${days} days`,
      ribbonBg: WARNING_BG,
      ribbonFg: WARNING_FG,
      ribbonBorder: WARNING_BORDER,
      ribbonAccent: BRAND_BLUE_DARK,
      heading: "Your API key is expiring soon.",
      lede: (keyName, product) =>
        `Your ${product} API key "${keyName}" will expire shortly. Rotate it ahead of the deadline so production traffic isn't interrupted.`,
    };
  }
  return {
    ribbon: "Expiring soon",
    ribbonBg: WARNING_BG,
    ribbonFg: WARNING_FG,
    ribbonBorder: WARNING_BORDER,
    ribbonAccent: BRAND_BLUE_DARK,
    heading: "Your API key is expiring soon.",
    lede: (keyName, product) =>
      `Your ${product} API key "${keyName}" will expire shortly. Rotate it ahead of the deadline so production traffic isn't interrupted.`,
  };
}

export default function ApiKeyExpiringEmail(
  props: ApiKeyExpiringEmailProps,
): ReactElement {
  if (
    typeof props.keyName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'keyName' in props for ApiKeyExpiringEmail template!",
    );
  }
  if (
    typeof props.expiresAt !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'expiresAt' in props for ApiKeyExpiringEmail template!",
    );
  }
  if (
    typeof props.rotateKeyUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'rotateKeyUrl' in props for ApiKeyExpiringEmail template!",
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
  const docsUrl: string | undefined =
    typeof props.docsUrl === "string" && props.docsUrl.length > 0
      ? props.docsUrl
      : undefined;
  const manageKeysUrl: string | undefined =
    typeof props.manageKeysUrl === "string" && props.manageKeysUrl.length > 0
      ? props.manageKeysUrl
      : undefined;
  const urgency = resolveUrgency(props.daysUntilExpiration);

  const previewText = `Action needed: your ${productName} API key "${props.keyName}" ${
    typeof props.daysUntilExpiration === "number" &&
    Number.isFinite(props.daysUntilExpiration) &&
    Math.floor(props.daysUntilExpiration) <= 0
      ? "has expired"
      : "is expiring soon"
  } — rotate it to avoid downtime.`;

  const metaRows: Array<[string, string]> = [["Key name", props.keyName]];
  if (maskedKey) {
    metaRows.push(["Key", maskedKey]);
  }
  metaRows.push(["Expires", props.expiresAt]);
  if (typeof props.lastUsedAt === "string" && props.lastUsedAt.length > 0) {
    metaRows.push(["Last used", props.lastUsedAt]);
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
              {urgency.heading}
            </Heading>
          </Section>

          <Section style={{ padding: "20px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: urgency.ribbonBg,
                border: `1px solid ${urgency.ribbonBorder}`,
                borderLeft: `4px solid ${urgency.ribbonAccent}`,
                borderRadius: "8px",
                padding: "12px 16px",
              }}
            >
              <Text
                style={{
                  color: urgency.ribbonFg,
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                {urgency.ribbon}
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: "4px 0 0 0",
                }}
              >
                Expiration date:{" "}
                <strong style={{ color: FOREGROUND }}>{props.expiresAt}</strong>
              </Text>
            </div>
          </Section>

          <Section style={{ padding: "20px 32px 8px 32px" }}>
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
              {urgency.lede(props.keyName, productName)} Generating a new key
              gives you a short overlap window — you can roll out the
              replacement to every integration before revoking the old one.
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
                  Scopes on this key
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
              href={props.rotateKeyUrl}
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
              Rotate this key
            </Button>
            {manageKeysUrl ? (
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: "12px 0 0 0",
                }}
              >
                Or open the full API keys page:{" "}
                <a
                  href={manageKeysUrl}
                  style={{
                    color: BRAND_BLUE_DARK,
                    textDecoration: "none",
                  }}
                >
                  Manage API keys
                </a>
              </Text>
            ) : null}
          </Section>

          <Section style={{ padding: "16px 32px 8px 32px" }}>
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
                  color: FOREGROUND,
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 8px 0",
                  textTransform: "uppercase",
                }}
              >
                How to rotate without downtime
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.6",
                  margin: "0 0 6px 0",
                  paddingLeft: "20px",
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
                  1.
                </span>
                Generate a replacement key with the same scopes from the API
                keys page.
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.6",
                  margin: "0 0 6px 0",
                  paddingLeft: "20px",
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
                  2.
                </span>
                Roll the new key out to every integration and confirm traffic
                with it.
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.6",
                  margin: 0,
                  paddingLeft: "20px",
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
                  3.
                </span>
                Revoke the old key once nothing depends on it.
              </Text>
              {docsUrl ? (
                <Text
                  style={{
                    color: MUTED_FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.6",
                    margin: "10px 0 0 0",
                  }}
                >
                  Step-by-step guide:{" "}
                  <a
                    href={docsUrl}
                    style={{
                      color: BRAND_BLUE_DARK,
                      textDecoration: "none",
                    }}
                  >
                    Rotating API keys
                  </a>
                </Text>
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
            notification because an API key on your account is approaching its
            expiration date.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

ApiKeyExpiringEmail.PreviewProps = {
  userName: "Jane Doe",
  keyName: "production-pipeline-writer",
  expiresAt: "Jun 17, 2026 14:22 UTC",
  daysUntilExpiration: 7,
  keyPrefix: "svlts_pk",
  keyLastFour: "a3f2",
  scopes: ["schemas:read", "schemas:write", "vaults:read"],
  lastUsedAt: "Jun 09, 2026 18:04 UTC",
  rotateKeyUrl:
    "https://schemavaults.com/account/api-keys/rotate?id=key_example",
  manageKeysUrl: "https://schemavaults.com/account/api-keys",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
  docsUrl: "https://schemavaults.com/docs/api-keys/rotating",
} satisfies ApiKeyExpiringEmailProps;
