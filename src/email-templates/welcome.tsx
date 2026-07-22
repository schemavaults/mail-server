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
import { getEmailBrand } from "./brand";

export interface WelcomeEmailProps {
  name: string;
  productName?: string;
  ctaUrl?: string;
  ctaLabel?: string;
  highlights?: string[];
  supportEmail?: string;
}

const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";

const DEFAULT_HIGHLIGHTS: readonly string[] = [
  "Explore your dashboard and set up your workspace",
  "Invite your team to collaborate",
  "Connect your tools and integrations",
];

export default function WelcomeEmail(props: WelcomeEmailProps): ReactElement {
  if (typeof props.name !== "string" && process.env.NODE_ENV !== "development") {
    throw new Error("Missing 'name' in props for WelcomeEmail template!");
  }

  const brand = getEmailBrand();
  const BRAND_BLUE = brand.colors.accent;
  const BRAND_BLUE_DARK = brand.colors.accentDark;

  const productName: string =
    typeof props.productName === "string" && props.productName.length > 0
      ? props.productName
      : brand.productName;
  const ctaUrl: string =
    typeof props.ctaUrl === "string" && props.ctaUrl.length > 0
      ? props.ctaUrl
      : brand.url;
  const ctaLabel: string =
    typeof props.ctaLabel === "string" && props.ctaLabel.length > 0
      ? props.ctaLabel
      : "Open your dashboard";
  const highlights: readonly string[] =
    Array.isArray(props.highlights) && props.highlights.length > 0
      ? props.highlights
      : DEFAULT_HIGHLIGHTS;
  const supportEmail: string =
    typeof props.supportEmail === "string" && props.supportEmail.length > 0
      ? props.supportEmail
      : brand.supportEmail;

  const previewText = `Welcome to ${productName}, ${props.name} — here's how to get started.`;

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
            padding: "0",
            overflow: "hidden",
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
              {productName}
            </Text>
            <Heading
              as="h1"
              style={{
                color: "#ffffff",
                fontSize: "28px",
                fontWeight: 700,
                lineHeight: "1.2",
                margin: "8px 0 0 0",
              }}
            >
              Welcome, {props.name}.
            </Heading>
          </Section>

          <Section style={{ padding: "28px 32px 8px 32px" }}>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "16px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Thanks for joining {productName}. Your account is ready — the
              dashboard is one click away, and the quick-start guide below
              walks through what most teams do first.
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 24px 32px" }}>
            <Button
              href={ctaUrl}
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
              {ctaLabel}
            </Button>
          </Section>

          <Hr style={{ borderColor: BORDER, margin: "0 32px" }} />

          <Section style={{ padding: "24px 32px 8px 32px" }}>
            <Heading
              as="h2"
              style={{
                color: FOREGROUND,
                fontSize: "16px",
                fontWeight: 600,
                margin: "0 0 12px 0",
              }}
            >
              Quick start
            </Heading>
            {highlights.map((item, idx) => (
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
              Questions or feedback? Reply to this email or reach us at{" "}
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
            email because you created an account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

WelcomeEmail.PreviewProps = {
  name: "Jane Doe",
  ctaLabel: "Open your dashboard",
} satisfies WelcomeEmailProps;
