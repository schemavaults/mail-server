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

export interface DataExportReadyEmailProps {
  recipientName?: string;
  downloadUrl: string;
  expiresAt: string;
  fileSize?: string;
  fileFormat?: string;
  requestedAt?: string;
  exportScope?: string;
  manageAccountUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties, so the token hex values are inlined here.
const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
// AMBER values approximate `--warning: oklch(82% 0.189 84.429)` and `--warning-foreground: oklch(41% 0.112 45.904)`.
const AMBER_BG = "#fffbeb";
const AMBER_BORDER = "#fde68a";
const AMBER_FOREGROUND = "#78350f";

export default function DataExportReadyEmail(
  props: DataExportReadyEmailProps,
): ReactElement {
  if (
    typeof props.downloadUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'downloadUrl' in props for DataExportReadyEmail template!",
    );
  }
  if (
    typeof props.expiresAt !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'expiresAt' in props for DataExportReadyEmail template!",
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
    typeof props.recipientName === "string" && props.recipientName.length > 0
      ? props.recipientName
      : "there";
  const fileSize: string | undefined =
    typeof props.fileSize === "string" && props.fileSize.length > 0
      ? props.fileSize
      : undefined;
  const fileFormat: string | undefined =
    typeof props.fileFormat === "string" && props.fileFormat.length > 0
      ? props.fileFormat
      : undefined;
  const requestedAt: string | undefined =
    typeof props.requestedAt === "string" && props.requestedAt.length > 0
      ? props.requestedAt
      : undefined;
  const exportScope: string | undefined =
    typeof props.exportScope === "string" && props.exportScope.length > 0
      ? props.exportScope
      : undefined;
  const manageAccountUrl: string | undefined =
    typeof props.manageAccountUrl === "string" &&
    props.manageAccountUrl.length > 0
      ? props.manageAccountUrl
      : undefined;

  const previewText = `Your ${productName} data export is ready to download (expires ${props.expiresAt}).`;

  const metaRows: Array<[string, string]> = [];
  if (requestedAt) {
    metaRows.push(["Requested", requestedAt]);
  }
  if (fileFormat) {
    metaRows.push(["Format", fileFormat]);
  }
  if (fileSize) {
    metaRows.push(["Size", fileSize]);
  }
  metaRows.push(["Link expires", props.expiresAt]);

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
              {productName} · Data export
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
              Your data export is ready.
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
              The export of your {productName} data you requested has finished
              processing and is ready to download. Use the secure link below to
              retrieve your archive.
            </Text>
          </Section>

          {exportScope ? (
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
                  What's included
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  {exportScope}
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
              href={props.downloadUrl}
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
              Download your archive
            </Button>
          </Section>

          <Section style={{ padding: "8px 32px 8px 32px" }}>
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
                href={props.downloadUrl}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {props.downloadUrl}
              </a>
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: AMBER_BG,
                border: `1px solid ${AMBER_BORDER}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: AMBER_FOREGROUND,
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                Keep your export private
              </Text>
              <Text
                style={{
                  color: AMBER_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                This archive contains data from your account. Anyone with the
                download link can read it, so do not share or forward this
                email. The link expires on {props.expiresAt}; after that you'll
                need to request a new export.
              </Text>
            </div>
          </Section>

          <Hr style={{ borderColor: BORDER, margin: "20px 32px 0 32px" }} />

          <Section style={{ padding: "16px 32px 28px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Didn't request this export?{" "}
              {manageAccountUrl ? (
                <>
                  <a
                    href={manageAccountUrl}
                    style={{
                      color: BRAND_BLUE_DARK,
                      textDecoration: "none",
                    }}
                  >
                    Review your account activity
                  </a>{" "}
                  and then contact us at{" "}
                </>
              ) : (
                <>Contact us right away at </>
              )}
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
            email because a data export was requested for your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

DataExportReadyEmail.PreviewProps = {
  recipientName: "Jane Doe",
  downloadUrl:
    "https://schemavaults.com/account/exports/download?token=example-token",
  expiresAt: "Jun 12, 2026 17:00 UTC",
  fileSize: "12.4 MB",
  fileFormat: "ZIP archive (JSON + CSV)",
  requestedAt: "Jun 5, 2026 09:42 UTC",
  exportScope:
    "Your profile, all owned schemas and vaults, mailing-list subscriptions, API key metadata, and a full audit log of account activity.",
  manageAccountUrl: "https://schemavaults.com/account",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies DataExportReadyEmailProps;
