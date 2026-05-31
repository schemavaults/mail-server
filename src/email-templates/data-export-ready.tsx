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
  downloadUrl: string;
  userName?: string;
  exportType?: string;
  fileName?: string;
  fileSize?: string;
  fileFormat?: string;
  itemCount?: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  requestedAt?: string;
  requestedFromIp?: string;
  requestedFromLocation?: string;
  expiresAt?: string;
  downloadPasswordHint?: string;
  manageDataUrl?: string;
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
const CODE_BG = "#0f172a";
const CODE_FG = "#e2e8f0";
const WARN_BG = "#fffbeb";
const WARN_BORDER = "#fde68a";
const WARN_FG = "#92400e";

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
  const exportType: string =
    typeof props.exportType === "string" && props.exportType.length > 0
      ? props.exportType
      : "Account data export";
  const fileName: string | undefined =
    typeof props.fileName === "string" && props.fileName.length > 0
      ? props.fileName
      : undefined;
  const dateRange: string | undefined =
    typeof props.dateRangeStart === "string" &&
    props.dateRangeStart.length > 0 &&
    typeof props.dateRangeEnd === "string" &&
    props.dateRangeEnd.length > 0
      ? `${props.dateRangeStart} → ${props.dateRangeEnd}`
      : typeof props.dateRangeStart === "string" &&
          props.dateRangeStart.length > 0
        ? `from ${props.dateRangeStart}`
        : typeof props.dateRangeEnd === "string" && props.dateRangeEnd.length > 0
          ? `through ${props.dateRangeEnd}`
          : undefined;
  const passwordHint: string | undefined =
    typeof props.downloadPasswordHint === "string" &&
    props.downloadPasswordHint.length > 0
      ? props.downloadPasswordHint
      : undefined;

  const previewText = `Your ${productName} data export is ready to download.`;

  const metaRows: Array<[string, string]> = [["Export type", exportType]];
  if (fileName) {
    metaRows.push(["File name", fileName]);
  }
  if (typeof props.fileFormat === "string" && props.fileFormat.length > 0) {
    metaRows.push(["Format", props.fileFormat]);
  }
  if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
    metaRows.push(["File size", props.fileSize]);
  }
  if (typeof props.itemCount === "string" && props.itemCount.length > 0) {
    metaRows.push(["Items", props.itemCount]);
  }
  if (dateRange) {
    metaRows.push(["Date range", dateRange]);
  }
  if (typeof props.requestedAt === "string" && props.requestedAt.length > 0) {
    metaRows.push(["Requested at", props.requestedAt]);
  }
  if (
    typeof props.requestedFromIp === "string" &&
    props.requestedFromIp.length > 0
  ) {
    metaRows.push(["Requested from", props.requestedFromIp]);
  }
  if (
    typeof props.requestedFromLocation === "string" &&
    props.requestedFromLocation.length > 0
  ) {
    metaRows.push(["Location", props.requestedFromLocation]);
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
              Your export is ready to download.
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
              The <strong>{exportType.toLowerCase()}</strong> you requested from{" "}
              {productName} has finished processing and is ready to download.
              The archive contains a complete copy of your data in a portable,
              machine-readable format.
            </Text>
          </Section>

          {fileName ? (
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
                  Archive
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
                  {fileName}
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
              Download your export
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

          {typeof props.expiresAt === "string" && props.expiresAt.length > 0 ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: WARN_BG,
                  border: `1px solid ${WARN_BORDER}`,
                  borderLeft: `4px solid ${WARN_FG}`,
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <Text
                  style={{
                    color: WARN_FG,
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
                    color: FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  For your security, this download link is one-time-use and
                  expires after the date above. After it expires, you'll need
                  to request a new export.
                </Text>
              </div>
            </Section>
          ) : null}

          {passwordHint ? (
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
                  Archive is password-protected
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  {passwordHint}
                </Text>
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "14px",
                fontWeight: 600,
                lineHeight: "1.55",
                margin: "0 0 6px 0",
              }}
            >
              Handle this archive carefully
            </Text>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              The export contains a complete copy of your account data —
              including any personal information you've stored with us. Treat
              it like a backup of your password manager: store it somewhere
              encrypted and delete it once you're done.
            </Text>
          </Section>

          {typeof props.manageDataUrl === "string" &&
          props.manageDataUrl.length > 0 ? (
            <Section style={{ padding: "12px 32px 8px 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                Manage your data and privacy preferences at{" "}
                <a
                  href={props.manageDataUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  {props.manageDataUrl}
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
              <span style={{ color: BRAND_RED, fontWeight: 600 }}>
                Don't download the archive
              </span>{" "}
              and email{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>{" "}
              right away — someone may have access to your account.
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
  exportType: "Full account export",
  fileName: "schemavaults-export-jane-2026-05-31.zip",
  fileFormat: "ZIP archive (JSON + CSV)",
  fileSize: "12.4 MB",
  itemCount: "1,243 records across 7 collections",
  dateRangeStart: "Jan 1, 2025",
  dateRangeEnd: "May 31, 2026",
  requestedAt: "May 31, 2026 14:22 UTC",
  requestedFromIp: "203.0.113.42",
  requestedFromLocation: "Brooklyn, NY, USA",
  expiresAt: "Jun 7, 2026 14:22 UTC",
  downloadUrl:
    "https://schemavaults.com/exports/download?token=example-export-token",
  downloadPasswordHint:
    "The password is the last 8 characters of your account ID, available on your Account → Security page.",
  manageDataUrl: "https://schemavaults.com/account/data",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies DataExportReadyEmailProps;
