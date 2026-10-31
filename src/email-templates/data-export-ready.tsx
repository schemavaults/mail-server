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

export interface DataExportContentItem {
  /** Short name of an included dataset, e.g. "Schemas". */
  label: string;
  /** Optional detail line, e.g. "412 schemas across 6 vaults". */
  detail?: string;
}

export interface DataExportReadyEmailProps {
  /** Expiring, account-scoped download link for the generated archive. */
  downloadUrl: string;
  /** File name of the generated archive, shown in monospace. */
  fileName: string;
  /** Human-readable moment the download link stops working. */
  expiresAt: string;
  recipientName?: string;
  /** Archive format, e.g. "JSON (gzip)" or "CSV (zip)". */
  exportFormat?: string;
  /** Human-readable archive size, e.g. "48.2 MB". */
  fileSize?: string;
  /** Human-readable row/record total, e.g. "128,409 records". */
  recordCount?: string;
  /** When the export was requested. */
  requestedAt?: string;
  /** When the export finished generating. */
  completedAt?: string;
  /** Support/correlation identifier for the export job. */
  requestId?: string;
  /** Workspace or organization the export was taken from. */
  workspaceName?: string;
  /** SHA-256 checksum of the archive, for integrity verification. */
  checksumSha256?: string;
  /** Breakdown of what the archive contains. */
  contents?: DataExportContentItem[];
  /** Link to the exports/privacy page where exports are managed. */
  manageExportsUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Neutral palette and semantic status colors for this template. Email clients
// don't resolve CSS custom properties or oklch(), so the @schemavaults/theme
// tokens are inlined here as their concrete hex equivalents; the brand accent
// colors come from the configured brand inside the component.
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
// EMERALD conveys the completed/ready state of the export job.
const EMERALD = "#10b981";
const EMERALD_DARK = "#047857";
const EMERALD_BG = "#ecfdf5";
const EMERALD_BORDER = "#a7f3d0";
const EMERALD_FOREGROUND = "#064e3b";
// AMBER mirrors the theme's --warning token for the link-expiry callout.
const AMBER_DARK = "#b45309";
const AMBER_BG = "#fffbeb";
const AMBER_BORDER = "#fde68a";
const AMBER_FOREGROUND = "#78350f";
// Monospace surfaces (file name, checksum) reuse the dark slate code palette.
const CODE_BG = "#0f172a";
const CODE_FG = "#e2e8f0";

const MONOSPACE_FONT =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";

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
    typeof props.fileName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'fileName' in props for DataExportReadyEmail template!",
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
  const workspaceName: string | undefined =
    typeof props.workspaceName === "string" && props.workspaceName.length > 0
      ? props.workspaceName
      : undefined;
  const checksumSha256: string | undefined =
    typeof props.checksumSha256 === "string" &&
    props.checksumSha256.length > 0
      ? props.checksumSha256
      : undefined;
  const manageExportsUrl: string | undefined =
    typeof props.manageExportsUrl === "string" &&
    props.manageExportsUrl.length > 0
      ? props.manageExportsUrl
      : undefined;
  const contents: DataExportContentItem[] = Array.isArray(props.contents)
    ? props.contents.filter(
        (item): item is DataExportContentItem =>
          typeof item === "object" &&
          item !== null &&
          typeof item.label === "string" &&
          item.label.length > 0,
      )
    : [];

  const scopeLine: string = workspaceName
    ? `your ${workspaceName} data`
    : "your data";
  const previewText = `Your ${productName} data export is ready — the download link expires ${props.expiresAt}.`;

  const metaRows: Array<[string, string]> = [];
  if (workspaceName) {
    metaRows.push(["Workspace", workspaceName]);
  }
  if (exportFormat) {
    metaRows.push(["Format", exportFormat]);
  }
  if (fileSize) {
    metaRows.push(["Size", fileSize]);
  }
  if (recordCount) {
    metaRows.push(["Contents", recordCount]);
  }
  if (typeof props.requestedAt === "string" && props.requestedAt.length > 0) {
    metaRows.push(["Requested", props.requestedAt]);
  }
  if (typeof props.completedAt === "string" && props.completedAt.length > 0) {
    metaRows.push(["Completed", props.completedAt]);
  }
  metaRows.push(["Link expires", props.expiresAt]);
  if (typeof props.requestId === "string" && props.requestId.length > 0) {
    metaRows.push(["Request ID", props.requestId]);
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
              We finished packaging {scopeLine} and the archive is ready to
              download. The link below is tied to your account and stops
              working after it expires.
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: EMERALD_BG,
                border: `1px solid ${EMERALD_BORDER}`,
                borderLeft: `4px solid ${EMERALD_DARK}`,
                borderRadius: "8px",
                padding: "16px 18px",
              }}
            >
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{ borderCollapse: "collapse", width: "100%" }}
              >
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>
                      <Text
                        style={{
                          color: EMERALD_FOREGROUND,
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          margin: "0 0 6px 0",
                          textTransform: "uppercase",
                        }}
                      >
                        Export complete
                      </Text>
                    </td>
                    <td style={{ textAlign: "right", verticalAlign: "top" }}>
                      {exportFormat ? (
                        <span
                          style={{
                            backgroundColor: EMERALD,
                            borderRadius: "999px",
                            color: "#ffffff",
                            display: "inline-block",
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "0.04em",
                            padding: "3px 10px",
                          }}
                        >
                          {exportFormat}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                </tbody>
              </table>
              <Text
                style={{
                  backgroundColor: CODE_BG,
                  borderRadius: "6px",
                  color: CODE_FG,
                  fontFamily: MONOSPACE_FONT,
                  fontSize: "13px",
                  lineHeight: "1.5",
                  margin: "4px 0 0 0",
                  padding: "10px 12px",
                  wordBreak: "break-all",
                }}
              >
                {props.fileName}
              </Text>
              {fileSize || recordCount ? (
                <Text
                  style={{
                    color: EMERALD_FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.55",
                    margin: "10px 0 0 0",
                  }}
                >
                  {[fileSize, recordCount].filter(Boolean).join(" · ")}
                </Text>
              ) : null}
            </div>
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
              Download export
            </Button>
          </Section>

          <Section style={{ padding: "8px 32px 4px 32px" }}>
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
                borderLeft: `4px solid ${AMBER_DARK}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: AMBER_DARK,
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                Link expires {props.expiresAt}
              </Text>
              <Text
                style={{
                  color: AMBER_FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                Download the archive before then — after it expires the file is
                deleted from our servers and you'll need to request a new
                export.
              </Text>
            </div>
          </Section>

          {contents.length > 0 ? (
            <Section style={{ padding: "20px 32px 0 32px" }}>
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
                What's in this archive
              </Text>
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
                  borderCollapse: "separate",
                  borderRadius: "8px",
                  width: "100%",
                }}
              >
                <tbody>
                  {contents.map((item, index) => (
                    <tr key={`${item.label}-${index}`}>
                      <td
                        style={{
                          borderTop:
                            index === 0 ? "none" : `1px solid ${BORDER}`,
                          padding: "10px 14px",
                          verticalAlign: "top",
                        }}
                      >
                        <Text
                          style={{
                            color: FOREGROUND,
                            fontSize: "14px",
                            fontWeight: 600,
                            lineHeight: "1.5",
                            margin: 0,
                          }}
                        >
                          {item.label}
                        </Text>
                        {typeof item.detail === "string" &&
                        item.detail.length > 0 ? (
                          <Text
                            style={{
                              color: MUTED_FOREGROUND,
                              fontSize: "13px",
                              lineHeight: "1.5",
                              margin: "2px 0 0 0",
                            }}
                          >
                            {item.detail}
                          </Text>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 8px 32px" }}>
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

          {checksumSha256 ? (
            <Section style={{ padding: "8px 32px 0 32px" }}>
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
                SHA-256 checksum
              </Text>
              <Text
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "6px",
                  color: FOREGROUND,
                  fontFamily: MONOSPACE_FONT,
                  fontSize: "12px",
                  lineHeight: "1.5",
                  margin: 0,
                  padding: "10px 12px",
                  wordBreak: "break-all",
                }}
              >
                {checksumSha256}
              </Text>
            </Section>
          ) : null}

          {manageExportsUrl ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                You can review past exports or request a new one from{" "}
                <a
                  href={manageExportsUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  your export history
                </a>
                .
              </Text>
            </Section>
          ) : null}

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
              This archive may contain sensitive data — treat the link like a
              password and don't forward this email. Didn't request an export?
              Contact us right away at{" "}
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
    "https://example.com/exports/download?token=example-download-token",
  fileName: "acme-platform-export-2026-04-21.json.gz",
  exportFormat: "JSON (gzip)",
  fileSize: "48.2 MB",
  recordCount: "128,409 records",
  requestedAt: "Apr 21, 2026 09:12 UTC",
  completedAt: "Apr 21, 2026 09:18 UTC",
  expiresAt: "Apr 28, 2026 09:18 UTC",
  requestId: "exp_8f31c7a2e4b9",
  workspaceName: "Acme Platform",
  checksumSha256:
    "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  contents: [
    { label: "Schemas", detail: "412 schemas across 6 vaults" },
    { label: "Vault metadata", detail: "6 vaults, including access policies" },
    { label: "Members & roles", detail: "23 members" },
    { label: "Audit log", detail: "Jan 1, 2026 – Apr 21, 2026" },
  ],
  manageExportsUrl: "https://example.com/settings/exports",
} satisfies DataExportReadyEmailProps;
