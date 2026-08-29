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

export interface OneTimePasscodeEmailProps {
  code: string;
  recipientName?: string;
  /** Short description of what the code authorizes, e.g. "signing in". */
  purpose?: string;
  /** Minutes until the code expires, as a string (e.g. "10"). */
  expiresInMinutes?: string;
  requestedAt?: string;
  device?: string;
  location?: string;
  ipAddress?: string;
  /** Optional CTA link to a page where the code can be entered. */
  verifyUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Neutral palette and semantic status colors for this template. Email clients
// don't resolve CSS custom properties, so the hex values are inlined here;
// they mirror the slate scale used by the @schemavaults/theme tokens.
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const CODE_FOREGROUND = "#0f172a";
const NOTICE_BG = "#fffbeb";
const NOTICE_BORDER = "#fde68a";
const NOTICE_FOREGROUND = "#78350f";

const MONOSPACE_STACK =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";

/**
 * Splits the passcode into visually separated character cells so the digits
 * stay easy to read (and to transcribe) at a glance. Falls back to a single
 * cell for codes that contain separators or are unusually long.
 */
function toCodeCells(code: string): string[] {
  const compact = code.trim();
  if (compact.length === 0 || compact.length > 10 || /\s/.test(compact)) {
    return [compact];
  }
  return compact.split("");
}

export default function OneTimePasscodeEmail(
  props: OneTimePasscodeEmailProps,
): ReactElement {
  if (typeof props.code !== "string" && process.env.NODE_ENV !== "development") {
    throw new Error(
      "Missing 'code' in props for OneTimePasscodeEmail template!",
    );
  }

  const brand = getEmailBrand();
  const BRAND_BLUE = brand.colors.accent;
  const BRAND_BLUE_DARK = brand.colors.accentDark;

  const productName: string =
    typeof props.productName === "string" && props.productName.length > 0
      ? props.productName
      : brand.productName;
  const supportEmail: string =
    typeof props.supportEmail === "string" && props.supportEmail.length > 0
      ? props.supportEmail
      : brand.supportEmail;
  const greetingName: string =
    typeof props.recipientName === "string" && props.recipientName.length > 0
      ? props.recipientName
      : "there";
  const purpose: string =
    typeof props.purpose === "string" && props.purpose.length > 0
      ? props.purpose
      : "signing in to your account";
  const expiresInMinutes: string | undefined =
    typeof props.expiresInMinutes === "string" &&
    props.expiresInMinutes.length > 0
      ? props.expiresInMinutes
      : undefined;
  const verifyUrl: string | undefined =
    typeof props.verifyUrl === "string" && props.verifyUrl.length > 0
      ? props.verifyUrl
      : undefined;

  const code: string = typeof props.code === "string" ? props.code : "";
  const codeCells: string[] = toCodeCells(code);

  const previewText = `${code} is your ${productName} verification code.`;

  const metaRows: Array<[string, string]> = [];
  if (typeof props.requestedAt === "string" && props.requestedAt.length > 0) {
    metaRows.push(["Requested", props.requestedAt]);
  }
  if (typeof props.device === "string" && props.device.length > 0) {
    metaRows.push(["Device", props.device]);
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
              Your one-time passcode
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
              Use the passcode below to finish {purpose} on {productName}.
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 4px 32px" }}>
            <div
              style={{
                backgroundColor: PANEL_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: "10px",
                borderTop: `3px solid ${BRAND_BLUE_DARK}`,
                padding: "20px 16px 18px 16px",
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  margin: "0 0 12px 0",
                  textTransform: "uppercase",
                }}
              >
                Your passcode
              </Text>
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{
                  borderCollapse: "separate",
                  borderSpacing: "6px 0",
                  margin: "0 auto",
                }}
              >
                <tbody>
                  <tr>
                    {codeCells.map((cell, index) => (
                      <td
                        // Cells are positional: identical characters may repeat.
                        key={`${index}-${cell}`}
                        style={{
                          backgroundColor: CARD_BG,
                          border: `1px solid ${BORDER}`,
                          borderRadius: "8px",
                          color: CODE_FOREGROUND,
                          fontFamily: MONOSPACE_STACK,
                          fontSize: "28px",
                          fontWeight: 700,
                          lineHeight: "1",
                          minWidth: "22px",
                          padding: "12px 10px",
                          textAlign: "center",
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
              {expiresInMinutes ? (
                <Text
                  style={{
                    color: MUTED_FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.55",
                    margin: "14px 0 0 0",
                  }}
                >
                  This code expires in {expiresInMinutes} minutes and can only
                  be used once.
                </Text>
              ) : (
                <Text
                  style={{
                    color: MUTED_FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.55",
                    margin: "14px 0 0 0",
                  }}
                >
                  This code can only be used once.
                </Text>
              )}
            </div>
          </Section>

          {verifyUrl ? (
            <Section style={{ padding: "20px 32px 8px 32px" }}>
              <Button
                href={verifyUrl}
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
                Enter the code
              </Button>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "12px",
                  lineHeight: "1.55",
                  margin: "12px 0 0 0",
                  wordBreak: "break-all",
                }}
              >
                Or copy this link into your browser:{" "}
                <a
                  href={verifyUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  {verifyUrl}
                </a>
              </Text>
            </Section>
          ) : null}

          {metaRows.length > 0 ? (
            <Section style={{ padding: "16px 32px 8px 32px" }}>
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

          <Section style={{ padding: "16px 32px 4px 32px" }}>
            <div
              style={{
                backgroundColor: NOTICE_BG,
                border: `1px solid ${NOTICE_BORDER}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: NOTICE_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                <strong>Never share this code.</strong> {productName} staff will
                never ask you for it by email, chat, or phone. If someone is
                asking you for this passcode, they are trying to access your
                account.
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
              Didn't request this code? You can safely ignore this email — the
              code expires on its own and nothing changes unless it is used. If
              you keep receiving codes you didn't ask for, contact us at{" "}
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
            © {new Date().getFullYear()} {productName}. This is an automated
            security message sent because a passcode was requested for your
            account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

OneTimePasscodeEmail.PreviewProps = {
  code: "418209",
  recipientName: "Jane Doe",
  purpose: "signing in",
  expiresInMinutes: "10",
  requestedAt: "Apr 27, 2026 17:04 UTC",
  device: "Chrome on macOS",
  location: "Austin, TX, US",
  ipAddress: "203.0.113.24",
  verifyUrl: "https://example.com/sign-in/verify?session=example-session",
} satisfies OneTimePasscodeEmailProps;
