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
  userName?: string;
  exportName?: string;
  exportFormat?: string;
  downloadUrl: string;
  fileSize?: string;
  itemCount?: string;
  requestedAt?: string;
  readyAt?: string;
  expiresAt?: string;
  expiresInHours?: string;
  manageExportsUrl?: string;
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
const WARNING_BG = "#fffbeb";
const WARNING_BORDER = "#fde68a";
const WARNING_FG = "#78350f";
const WARNING_ACCENT = "#d97706";

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
  const exportName: string =
    typeof props.exportName === "string" && props.exportName.length > 0
      ? props.exportName
      : "your data export";
  const exportFormat: string | undefined =
    typeof props.exportFormat === "string" && props.exportFormat.length > 0
      ? props.exportFormat
      : undefined;
  const fileSize: string | undefined =
    typeof props.fileSize === "string" && props.fileSize.length > 0
      ? props.fileSize
      : undefined;
  const itemCount: string | undefined =
    typeof props.itemCount === "string" && props.itemCount.length > 0
      ? props.itemCount
      : undefined;
  const requestedAt: string | undefined =
    typeof props.requestedAt === "string" && props.requestedAt.length > 0
      ? props.requestedAt
      : undefined;
  const readyAt: string | undefined =
    typeof props.readyAt === "string" && props.readyAt.length > 0
      ? props.readyAt
      : undefined;
  const expiresAt: string | undefined =
    typeof props.expiresAt === "string" && props.expiresAt.length > 0
      ? props.expiresAt
      : undefined;
  const expiresInHours: string | undefined =
    typeof props.expiresInHours === "string" && props.expiresInHours.length > 0
      ? props.expiresInHours
      : undefined;
  const manageExportsUrl: string | undefined =
    typeof props.manageExportsUrl === "string" &&
    props.manageExportsUrl.length > 0
      ? props.manageExportsUrl
      : undefined;

  const previewText = `${exportName} is ready to download from ${productName}.`;

  const metaRows: Array<[string, string]> = [];
  if (exportFormat) {
    metaRows.push(["Format", exportFormat]);
  }
  if (itemCount) {
    metaRows.push(["Items", itemCount]);
  }
  if (fileSize) {
    metaRows.push(["File size", fileSize]);
  }
  if (requestedAt) {
    metaRows.push(["Requested", requestedAt]);
  }
  if (readyAt) {
    metaRows.push(["Ready", readyAt]);
  }
  if (expiresAt) {
    metaRows.push(["Expires", expiresAt]);
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
              <strong>{exportName}</strong> has finished processing and is
              ready to download. The link below is a secure, single-use URL
              tied to your {productName} account.
            </Text>
          </Section>

          {metaRows.length > 0 ? (
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
                  Export details
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
                            padding: "2px 12px 2px 0",
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
                            padding: "2px 0",
                            verticalAlign: "top",
                          }}
                        >
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          ) : null}

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
              Download export
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

          {expiresInHours || expiresAt ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: WARNING_BG,
                  border: `1px solid ${WARNING_BORDER}`,
                  borderLeft: `4px solid ${WARNING_ACCENT}`,
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <Text
                  style={{
                    color: WARNING_ACCENT,
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    margin: "0 0 4px 0",
                    textTransform: "uppercase",
                  }}
                >
                  Link expires soon
                </Text>
                <Text
                  style={{
                    color: WARNING_FG,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  {expiresInHours
                    ? `This download link expires in ${expiresInHours}. `
                    : ""}
                  {expiresAt
                    ? `Access ends ${expiresAt}. `
                    : ""}
                  After that, re-request the export from your account.
                </Text>
              </div>
            </Section>
          ) : null}

          {manageExportsUrl ? (
            <Section style={{ padding: "16px 32px 8px 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                Need to re-run this export or check the history? Visit{" "}
                <a
                  href={manageExportsUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  your exports dashboard
                </a>
                .
              </Text>
            </Section>
          ) : null}

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
              Didn't request this export?{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_RED, textDecoration: "none" }}
              >
                Contact {supportEmail}
              </a>{" "}
              right away — someone with access to your account may have
              generated it. Otherwise, questions? We're at{" "}
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
            email because a data export was requested on your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

DataExportReadyEmail.PreviewProps = {
  userName: "Jane Doe",
  exportName: "Full account export (Q2 2026)",
  exportFormat: "JSON (gzip)",
  downloadUrl:
    "https://schemavaults.com/exports/download?token=example-signed-token",
  fileSize: "48.2 MB",
  itemCount: "12,483 schemas · 3 vaults",
  requestedAt: "Jul 01, 2026 09:14 UTC",
  readyAt: "Jul 01, 2026 09:21 UTC",
  expiresAt: "Jul 08, 2026 09:21 UTC",
  expiresInHours: "168 hours (7 days)",
  manageExportsUrl: "https://schemavaults.com/account/exports",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies DataExportReadyEmailProps;
