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

export interface DataExportReadyEmailProps {
  userName?: string;
  exportType: string;
  exportFormat?: string;
  fileSize?: string;
  recordCount?: string;
  requestedAt?: string;
  expiresAt: string;
  downloadUrl: string;
  checksumSha256?: string;
  encryptionNote?: string;
  manageExportsUrl?: string;
  includedItems?: readonly string[];
  productName?: string;
  supportEmail?: string;
}

// Neutral palette and semantic status colors for this template. Email clients
// don't resolve CSS custom properties or oklch(), so concrete hex values are
// inlined; the accent colors come from the configured brand accent inside
// the component.
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const CODE_BG = "#0f172a";
const CODE_FG = "#e2e8f0";
// Amber warning palette for the "link expires" callout (mirrors the theme's
// --warning oklch tokens, resolved to hex for email-client compatibility).
const WARNING_BG = "#fffbeb";
const WARNING_BORDER = "#fde68a";
const WARNING_ACCENT = "#f59e0b";
const WARNING_FOREGROUND = "#78350f";

export default function DataExportReadyEmail(
  props: DataExportReadyEmailProps,
): ReactElement {
  if (
    typeof props.exportType !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'exportType' in props for DataExportReadyEmail template!",
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
  if (
    typeof props.downloadUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'downloadUrl' in props for DataExportReadyEmail template!",
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
    typeof props.userName === "string" && props.userName.length > 0
      ? props.userName
      : "there";
  const exportFormat: string | undefined =
    typeof props.exportFormat === "string" && props.exportFormat.length > 0
      ? props.exportFormat
      : undefined;
  const fileSize: string | undefined =
    typeof props.fileSize === "string" && props.fileSize.length > 0
      ? props.fileSize
      : undefined;
  const recordCount: string | undefined =
    typeof props.recordCount === "string" && props.recordCount.length > 0
      ? props.recordCount
      : undefined;
  const requestedAt: string | undefined =
    typeof props.requestedAt === "string" && props.requestedAt.length > 0
      ? props.requestedAt
      : undefined;
  const checksumSha256: string | undefined =
    typeof props.checksumSha256 === "string" && props.checksumSha256.length > 0
      ? props.checksumSha256
      : undefined;
  const encryptionNote: string | undefined =
    typeof props.encryptionNote === "string" && props.encryptionNote.length > 0
      ? props.encryptionNote
      : undefined;
  const manageExportsUrl: string | undefined =
    typeof props.manageExportsUrl === "string" &&
    props.manageExportsUrl.length > 0
      ? props.manageExportsUrl
      : undefined;
  const includedItems: readonly string[] =
    Array.isArray(props.includedItems) && props.includedItems.length > 0
      ? props.includedItems.filter(
          (item): item is string => typeof item === "string" && item.length > 0,
        )
      : [];

  const previewText = `Your ${props.exportType} export is ready to download. Link expires ${props.expiresAt}.`;

  const metaRows: Array<[string, string]> = [["Export", props.exportType]];
  if (exportFormat) {
    metaRows.push(["Format", exportFormat]);
  }
  if (fileSize) {
    metaRows.push(["File size", fileSize]);
  }
  if (recordCount) {
    metaRows.push(["Records", recordCount]);
  }
  if (requestedAt) {
    metaRows.push(["Requested", requestedAt]);
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
                margin: "8px 0 12px 0",
              }}
            >
              Your export is ready to download.
            </Heading>
            <span
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.18)",
                border: "1px solid rgba(255, 255, 255, 0.35)",
                borderRadius: "999px",
                color: "#ffffff",
                display: "inline-block",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                padding: "4px 12px",
                textTransform: "uppercase",
              }}
            >
              Ready · {props.exportType}
            </span>
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
              The <strong>{props.exportType}</strong> export you requested on{" "}
              {productName} has finished processing and is ready for you to
              download. For your security, the download link is single-use per
              session and will expire.
            </Text>
          </Section>

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

          {includedItems.length > 0 ? (
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
                    margin: "0 0 8px 0",
                    textTransform: "uppercase",
                  }}
                >
                  What&apos;s included
                </Text>
                <ul
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                    paddingLeft: "18px",
                  }}
                >
                  {includedItems.map((item, idx) => (
                    <li key={`${item}-${idx}`} style={{ marginBottom: "2px" }}>
                      {item}
                    </li>
                  ))}
                </ul>
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
                  color: WARNING_FOREGROUND,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                Link expires {props.expiresAt}
              </Text>
              <Text
                style={{
                  color: WARNING_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                After expiration, this export is permanently deleted from our
                servers. If you need it again, request a fresh export from your{" "}
                {productName} account.
              </Text>
            </div>
          </Section>

          {checksumSha256 ? (
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
                  SHA-256 checksum
                </Text>
                <Text
                  style={{
                    color: CODE_FG,
                    fontFamily:
                      "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
                    fontSize: "12px",
                    letterSpacing: "0.02em",
                    margin: 0,
                    wordBreak: "break-all",
                  }}
                >
                  {checksumSha256}
                </Text>
              </div>
            </Section>
          ) : null}

          {encryptionNote ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "8px",
                  padding: "12px 16px",
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
                  Encryption
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  {encryptionNote}
                </Text>
              </div>
            </Section>
          ) : null}

          {manageExportsUrl ? (
            <Section style={{ padding: "16px 32px 24px 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                View past exports or request another anytime from your{" "}
                <a
                  href={manageExportsUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  exports dashboard
                </a>
                .
              </Text>
            </Section>
          ) : null}

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
              Didn&apos;t request this export? Reply to this email or reach us at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>{" "}
              so we can investigate.
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
  exportType: "Workspace data",
  exportFormat: "ZIP archive (JSON + CSV)",
  fileSize: "48.3 MB",
  recordCount: "124,731 rows across 14 tables",
  requestedAt: "May 14, 2026 09:12 UTC",
  expiresAt: "May 21, 2026 09:12 UTC",
  downloadUrl:
    "https://example.com/exports/download?token=example-download-token",
  checksumSha256:
    "a3f2c9d8e1b4f7a6c5d3e2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1",
  encryptionNote:
    "This archive is AES-256 encrypted. The passphrase was shown once in your dashboard when the export was requested and is not stored on our servers.",
  manageExportsUrl: "https://example.com/account/exports",
  includedItems: [
    "Schemas, tables, and views",
    "Row-level data snapshots",
    "Access logs (last 90 days)",
    "API key metadata (hashed)",
    "Workspace settings and integrations",
  ],
} satisfies DataExportReadyEmailProps;
