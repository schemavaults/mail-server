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

export interface SecurityAlertEmailProps {
  name: string;
  eventType?:
    | "new-sign-in"
    | "password-changed"
    | "new-api-key"
    | "new-device";
  device?: string;
  browser?: string;
  location?: string;
  ipAddress?: string;
  eventTime?: string;
  secureAccountUrl?: string;
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
const ALERT_BG = "#fef2f2";
const ALERT_BORDER = "#fecaca";

interface EventCopy {
  preview: (name: string, product: string) => string;
  heading: string;
  lede: (product: string) => string;
  primaryLabel: string;
}

const EVENT_COPY: Record<
  NonNullable<SecurityAlertEmailProps["eventType"]>,
  EventCopy
> = {
  "new-sign-in": {
    preview: (name, product) =>
      `${name}, we detected a new sign-in to your ${product} account.`,
    heading: "New sign-in detected",
    lede: (product) =>
      `We noticed a new sign-in to your ${product} account. If this was you, no action is needed.`,
    primaryLabel: "Review account activity",
  },
  "password-changed": {
    preview: (name, product) =>
      `${name}, your ${product} password was just changed.`,
    heading: "Your password was changed",
    lede: (product) =>
      `The password on your ${product} account was just changed. If this was you, no action is needed.`,
    primaryLabel: "Secure your account",
  },
  "new-api-key": {
    preview: (name, product) =>
      `${name}, a new API key was issued on your ${product} account.`,
    heading: "A new API key was issued",
    lede: (product) =>
      `A new API key was just issued on your ${product} account. If this was you, no action is needed.`,
    primaryLabel: "Manage API keys",
  },
  "new-device": {
    preview: (name, product) =>
      `${name}, a new device just signed in to your ${product} account.`,
    heading: "New device signed in",
    lede: (product) =>
      `A device we haven't seen before just signed in to your ${product} account. If this was you, no action is needed.`,
    primaryLabel: "Review devices",
  },
};

export default function SecurityAlertEmail(
  props: SecurityAlertEmailProps,
): ReactElement {
  if (typeof props.name !== "string" && process.env.NODE_ENV !== "development") {
    throw new Error("Missing 'name' in props for SecurityAlertEmail template!");
  }

  const productName: string =
    typeof props.productName === "string" && props.productName.length > 0
      ? props.productName
      : "SchemaVaults";
  const supportEmail: string =
    typeof props.supportEmail === "string" && props.supportEmail.length > 0
      ? props.supportEmail
      : "support@schemavaults.com";
  const secureAccountUrl: string =
    typeof props.secureAccountUrl === "string" &&
    props.secureAccountUrl.length > 0
      ? props.secureAccountUrl
      : "https://schemavaults.com/account/security";
  const eventType: NonNullable<SecurityAlertEmailProps["eventType"]> =
    props.eventType ?? "new-sign-in";
  const copy: EventCopy = EVENT_COPY[eventType];

  const metaRows: Array<[string, string]> = [];
  if (typeof props.eventTime === "string" && props.eventTime.length > 0) {
    metaRows.push(["When", props.eventTime]);
  }
  if (typeof props.device === "string" && props.device.length > 0) {
    metaRows.push(["Device", props.device]);
  }
  if (typeof props.browser === "string" && props.browser.length > 0) {
    metaRows.push(["Browser", props.browser]);
  }
  if (typeof props.location === "string" && props.location.length > 0) {
    metaRows.push(["Location", props.location]);
  }
  if (typeof props.ipAddress === "string" && props.ipAddress.length > 0) {
    metaRows.push(["IP address", props.ipAddress]);
  }

  return (
    <Html>
      <Head />
      <Preview>{copy.preview(props.name, productName)}</Preview>
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
              {productName} · Security
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
              {copy.heading}
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
              {copy.lede(productName)}
            </Text>
          </Section>

          {metaRows.length > 0 ? (
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
                Didn't recognize this?
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                Secure your account immediately — change your password and
                revoke any sessions you don't recognize.
              </Text>
            </div>
          </Section>

          <Section style={{ padding: "16px 32px 24px 32px" }}>
            <Button
              href={secureAccountUrl}
              style={{
                backgroundColor: BRAND_RED,
                borderRadius: "8px",
                color: "#ffffff",
                display: "inline-block",
                fontSize: "15px",
                fontWeight: 600,
                padding: "12px 22px",
                textDecoration: "none",
              }}
            >
              {copy.primaryLabel}
            </Button>
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
              . We'll never ask for your password over email.
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
            © {new Date().getFullYear()} {productName}. This security
            notification was sent to the address on file for your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

SecurityAlertEmail.PreviewProps = {
  name: "Jane Doe",
  eventType: "new-sign-in",
  device: "MacBook Pro",
  browser: "Chrome 126",
  location: "San Francisco, CA",
  ipAddress: "203.0.113.42",
  eventTime: "Apr 19, 2026 10:30 UTC",
  secureAccountUrl: "https://schemavaults.com/account/security",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies SecurityAlertEmailProps;
