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
  name?: string;
  keyPrefix?: string;
  daysUntilExpiration?: number;
  lastUsedAt?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties, so token hex values are inlined here.
const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
// Amber warning tokens — map to --warning (oklch amber) in @schemavaults/theme.
const WARNING = "#d97706";
const WARNING_DARK = "#92400e";
const WARNING_BG = "#fffbeb";
const WARNING_BORDER = "#fde68a";
const CODE_BG = "#f1f5f9";

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
    typeof props.name === "string" && props.name.length > 0
      ? props.name
      : "there";

  const hasDaysLeft: boolean =
    typeof props.daysUntilExpiration === "number" &&
    Number.isFinite(props.daysUntilExpiration);
  const daysLeft: number = hasDaysLeft
    ? Math.max(0, Math.floor(props.daysUntilExpiration as number))
    : 0;
  const urgencyLabel: string = hasDaysLeft
    ? daysLeft <= 0
      ? "Expires today"
      : daysLeft === 1
        ? "1 day left"
        : `${daysLeft} days left`
    : "Expiring soon";

  const metaRows: Array<[string, string]> = [
    ["Key name", props.keyName],
  ];
  if (typeof props.keyPrefix === "string" && props.keyPrefix.length > 0) {
    metaRows.push(["Prefix", props.keyPrefix]);
  }
  metaRows.push(["Expires", props.expiresAt]);
  if (typeof props.lastUsedAt === "string" && props.lastUsedAt.length > 0) {
    metaRows.push(["Last used", props.lastUsedAt]);
  }

  const previewText: string = hasDaysLeft
    ? `Your ${productName} API key "${props.keyName}" expires in ${urgencyLabel.toLowerCase()}.`
    : `Your ${productName} API key "${props.keyName}" is expiring soon.`;

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
              {productName} · API Keys
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
              Your API key is expiring soon
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
              One of your {productName} API keys is approaching its expiration
              date. Rotate it before it expires to avoid interrupting any
              integrations or scheduled jobs that depend on it.
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 4px 32px" }}>
            <div
              style={{
                backgroundColor: WARNING_BG,
                border: `1px solid ${WARNING_BORDER}`,
                borderLeft: `4px solid ${WARNING}`,
                borderRadius: "8px",
                padding: "12px 16px",
              }}
            >
              <Text
                style={{
                  color: WARNING_DARK,
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  margin: "0 0 2px 0",
                  textTransform: "uppercase",
                }}
              >
                {urgencyLabel}
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                After the expiration date, requests using this key will be
                rejected with <code style={{
                  backgroundColor: CODE_BG,
                  borderRadius: "3px",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
                  fontSize: "12px",
                  padding: "1px 5px",
                }}>401 Unauthorized</code>.
              </Text>
            </div>
          </Section>

          <Section style={{ padding: "16px 32px 8px 32px" }}>
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              style={{
                borderCollapse: "collapse",
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
                        fontFamily:
                          label === "Prefix"
                            ? "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace"
                            : undefined,
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

          <Section style={{ padding: "16px 32px 24px 32px" }}>
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
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "12px",
                lineHeight: "1.6",
                margin: "12px 0 0 0",
                wordBreak: "break-all",
              }}
            >
              Or paste this link into your browser:{" "}
              <a
                href={props.rotateKeyUrl}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {props.rotateKeyUrl}
              </a>
            </Text>
          </Section>

          <Hr style={{ borderColor: BORDER, margin: "0 32px" }} />

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Heading
              as="h2"
              style={{
                color: FOREGROUND,
                fontSize: "15px",
                fontWeight: 600,
                margin: "0 0 10px 0",
              }}
            >
              How to rotate safely
            </Heading>
            {[
              "Create a new API key with the same scopes from the dashboard.",
              "Deploy the new key to your applications, CI, and secrets stores.",
              "Revoke the old key once you've confirmed traffic has moved over.",
            ].map((step, idx) => (
              <Text
                key={idx}
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.6",
                  margin: "0 0 6px 0",
                  paddingLeft: "22px",
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
                  {idx + 1}.
                </span>
                {step}
              </Text>
            ))}
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
              Didn't create this key or need help rotating? Reach us at{" "}
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
            notification because an API key on your account is nearing its
            expiration.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

ApiKeyExpiringEmail.PreviewProps = {
  name: "Jane Doe",
  keyName: "production-ingest",
  keyPrefix: "sk_live_ab4c…9f21",
  expiresAt: "May 08, 2026 00:00 UTC",
  daysUntilExpiration: 7,
  lastUsedAt: "Apr 24, 2026 09:14 UTC",
  rotateKeyUrl:
    "https://schemavaults.com/account/api-keys?rotate=sk_live_ab4c9f21",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies ApiKeyExpiringEmailProps;
