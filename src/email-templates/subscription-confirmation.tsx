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

export interface SubscriptionConfirmationEmailProps {
  email: string;
  mailingListName: string;
  mailingListDescription?: string;
  unsubscribeUrl: string;
  manageSubscriptionsUrl?: string;
  expectations?: string[];
  cadence?: string;
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

const DEFAULT_EXPECTATIONS: readonly string[] = [
  "Curated updates from the SchemaVaults team",
  "Release notes and product changelogs",
  "Occasional deep-dives on schema design and data infrastructure",
];

export default function SubscriptionConfirmationEmail(
  props: SubscriptionConfirmationEmailProps,
): ReactElement {
  if (
    typeof props.email !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'email' in props for SubscriptionConfirmationEmail template!",
    );
  }
  if (
    typeof props.mailingListName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'mailingListName' in props for SubscriptionConfirmationEmail template!",
    );
  }
  if (
    typeof props.unsubscribeUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'unsubscribeUrl' in props for SubscriptionConfirmationEmail template!",
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
  const mailingListDescription: string | undefined =
    typeof props.mailingListDescription === "string" &&
    props.mailingListDescription.length > 0
      ? props.mailingListDescription
      : undefined;
  const expectations: readonly string[] =
    Array.isArray(props.expectations) && props.expectations.length > 0
      ? props.expectations
      : DEFAULT_EXPECTATIONS;
  const cadence: string | undefined =
    typeof props.cadence === "string" && props.cadence.length > 0
      ? props.cadence
      : undefined;
  const manageSubscriptionsUrl: string | undefined =
    typeof props.manageSubscriptionsUrl === "string" &&
    props.manageSubscriptionsUrl.length > 0
      ? props.manageSubscriptionsUrl
      : undefined;

  const previewText = `You're subscribed to ${props.mailingListName} — confirmed for ${props.email}.`;

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
              {productName} · Subscription confirmed
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
              You're on the list.
            </Heading>
          </Section>

          <Section style={{ padding: "28px 32px 8px 32px" }}>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "15px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Thanks for subscribing to <strong>{props.mailingListName}</strong>
              . We confirmed your subscription for{" "}
              <strong>{props.email}</strong>
              {cadence ? (
                <>
                  {" "}
                  — expect emails roughly <strong>{cadence}</strong>
                </>
              ) : null}
              .
            </Text>
          </Section>

          {mailingListDescription ? (
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
                    margin: "0 0 4px 0",
                    textTransform: "uppercase",
                  }}
                >
                  About this list
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  {mailingListDescription}
                </Text>
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Heading
              as="h2"
              style={{
                color: FOREGROUND,
                fontSize: "16px",
                fontWeight: 600,
                margin: "0 0 12px 0",
              }}
            >
              What to expect
            </Heading>
            {expectations.map((item, idx) => (
              <Text
                key={idx}
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.6",
                  margin: "0 0 8px 0",
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
                  →
                </span>
                {item}
              </Text>
            ))}
          </Section>

          {manageSubscriptionsUrl ? (
            <Section style={{ padding: "12px 32px 8px 32px" }}>
              <Button
                href={manageSubscriptionsUrl}
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
                Manage your subscriptions
              </Button>
            </Section>
          ) : null}

          <Hr style={{ borderColor: BORDER, margin: "20px 32px 0 32px" }} />

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: "0 0 8px 0",
              }}
            >
              Didn't sign up, or changed your mind? You can unsubscribe at any
              time — one click, no questions asked.
            </Text>
            <Button
              href={props.unsubscribeUrl}
              style={{
                backgroundColor: "transparent",
                border: `1px solid ${BRAND_RED}`,
                borderRadius: "8px",
                color: BRAND_RED,
                display: "inline-block",
                fontSize: "13px",
                fontWeight: 600,
                padding: "8px 16px",
                textDecoration: "none",
              }}
            >
              Unsubscribe {props.email}
            </Button>
          </Section>

          <Section style={{ padding: "12px 32px 28px 32px" }}>
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
                href={props.unsubscribeUrl}
                style={{ color: BRAND_RED, textDecoration: "none" }}
              >
                {props.unsubscribeUrl}
              </a>
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
              Questions? Reply to this email or reach us at{" "}
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
            email because {props.email} subscribed to {props.mailingListName}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

SubscriptionConfirmationEmail.PreviewProps = {
  email: "jane@acme.co",
  mailingListName: "SchemaVaults Product Updates",
  mailingListDescription:
    "Release notes, product changelogs, and the occasional deep-dive on schema design — straight from the SchemaVaults team.",
  unsubscribeUrl:
    "https://schemavaults.com/mailing-lists/unsubscribe?token=example-token",
  manageSubscriptionsUrl: "https://schemavaults.com/account/subscriptions",
  expectations: [
    "Release notes and product changelogs",
    "Curated updates from the SchemaVaults team",
    "Occasional deep-dives on schema design and data infrastructure",
  ],
  cadence: "1–2 emails per month",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies SubscriptionConfirmationEmailProps;
