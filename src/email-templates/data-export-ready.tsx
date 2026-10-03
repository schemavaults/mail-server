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
  downloadUrl: string;
  expiresAt: string;
  recipientName?: string;
  exportId?: string;
  requestedAt?: string;
  completedAt?: string;
  fileName?: string;
  fileSize?: string;
  fileFormat?: string;
  recordCount?: number;
  checksumSha256?: string;
  includedDatasets?: string[];
  passwordProtected?: boolean;
  manageExportsUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Neutral and semantic palette values. Email clients don't resolve CSS custom
// properties or oklch(), so concrete hex values are inlined here; the accent
// colors come from the configured brand accent (see ./brand.ts) inside the
// component. The neutral ramp approximates the theme's `--foreground`,
// `--muted-foreground` and `--border` tokens; AMBER approximates the theme's
// `--warning` / `--warning-foreground` pair and is used only for the
// link-expiry notice, so the brand accent stays reserved for the download CTA.
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const CODE_BG = "#0f172a";
const CODE_FG = "#e2e8f0";
const CODE_MUTED_FG = "#94a3b8";
const AMBER_DARK = "#b45309";
const AMBER_BG = "#fffbeb";
const AMBER_BORDER = "#fde68a";
const AMBER_FOREGROUND = "#78350f";

const MONOSPACE =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', monospace";

/** Breaks a long hex digest into readable 16-character groups. */
function groupChecksum(digest: string): string {
  const normalized = digest.replace(/\s+/g, "");
  const groups = normalized.match(/.{1,16}/g);
  return groups ? groups.join(" ") : normalized;
}

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
  const exportId: string | undefined =
    typeof props.exportId === "string" && props.exportId.length > 0
      ? props.exportId
      : undefined;
  const requestedAt: string | undefined =
    typeof props.requestedAt === "string" && props.requestedAt.length > 0
      ? props.requestedAt
      : undefined;
  const completedAt: string | undefined =
    typeof props.completedAt === "string" && props.completedAt.length > 0
      ? props.completedAt
      : undefined;
  const fileName: string =
    typeof props.fileName === "string" && props.fileName.length > 0
      ? props.fileName
      : "data-export.zip";
  const fileSize: string | undefined =
    typeof props.fileSize === "string" && props.fileSize.length > 0
      ? props.fileSize
      : undefined;
  const fileFormat: string | undefined =
    typeof props.fileFormat === "string" && props.fileFormat.length > 0
      ? props.fileFormat
      : undefined;
  const checksumSha256: string | undefined =
    typeof props.checksumSha256 === "string" && props.checksumSha256.length > 0
      ? props.checksumSha256
      : undefined;
  const manageExportsUrl: string | undefined =
    typeof props.manageExportsUrl === "string" &&
    props.manageExportsUrl.length > 0
      ? props.manageExportsUrl
      : undefined;
  const recordCount: number | undefined =
    typeof props.recordCount === "number" && Number.isFinite(props.recordCount)
      ? Math.max(0, Math.floor(props.recordCount))
      : undefined;
  const passwordProtected: boolean = props.passwordProtected === true;

  const includedDatasets: string[] = Array.isArray(props.includedDatasets)
    ? props.includedDatasets.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      )
    : [];

  const previewText = `Your ${productName} data export is ready to download — the link expires ${props.expiresAt}.`;

  const metaRows: Array<[string, string]> = [["File", fileName]];
  if (fileFormat) {
    metaRows.push(["Format", fileFormat]);
  }
  if (fileSize) {
    metaRows.push(["Size", fileSize]);
  }
  if (typeof recordCount === "number") {
    metaRows.push([
      "Records",
      `${recordCount.toLocaleString("en-US")} record${
        recordCount === 1 ? "" : "s"
      }`,
    ]);
  }
  if (requestedAt) {
    metaRows.push(["Requested", requestedAt]);
  }
  if (completedAt) {
    metaRows.push(["Completed", completedAt]);
  }
  metaRows.push(["Link expires", props.expiresAt]);
  if (exportId) {
    metaRows.push(["Export ID", exportId]);
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
              Your data export is ready to download.
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
              Link expires {props.expiresAt}
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
              We've finished packaging the {productName} data export you
              requested. Everything is bundled into a single archive that only
              you can download from the private link below.
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: PANEL_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <Text
                style={{
                  color: FOREGROUND,
                  fontFamily: MONOSPACE,
                  fontSize: "14px",
                  fontWeight: 600,
                  lineHeight: "1.4",
                  margin: "0 0 12px 0",
                  wordBreak: "break-all",
                }}
              >
                {fileName}
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
                          wordBreak: "break-word",
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

          <Section style={{ padding: "8px 32px 0 32px" }}>
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

          {includedDatasets.length > 0 ? (
            <Section style={{ padding: "20px 32px 0 32px" }}>
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
                  What's included
                </Text>
                <ul
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                    paddingLeft: "20px",
                  }}
                >
                  {includedDatasets.map((dataset) => (
                    <li key={dataset} style={{ margin: "2px 0" }}>
                      {dataset}
                    </li>
                  ))}
                </ul>
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 0 32px" }}>
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
                  color: AMBER_FOREGROUND,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 6px 0",
                  textTransform: "uppercase",
                }}
              >
                This link expires
              </Text>
              <Text
                style={{
                  color: AMBER_FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                For your security the download link stops working on{" "}
                <strong>{props.expiresAt}</strong>, and the archive is deleted
                from our servers at the same time. Save the file somewhere safe
                before then
                {manageExportsUrl
                  ? " — you can always request a fresh export afterwards."
                  : " — you can always request a fresh export from your account settings afterwards."}
              </Text>
            </div>
          </Section>

          {checksumSha256 ? (
            <Section style={{ padding: "20px 32px 0 32px" }}>
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
                Verify your download (SHA-256)
              </Text>
              <div
                style={{
                  backgroundColor: CODE_BG,
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <Text
                  style={{
                    color: CODE_MUTED_FG,
                    fontFamily: MONOSPACE,
                    fontSize: "12px",
                    lineHeight: "1.5",
                    margin: "0 0 6px 0",
                  }}
                >
                  shasum -a 256 {fileName}
                </Text>
                <Text
                  style={{
                    color: CODE_FG,
                    fontFamily: MONOSPACE,
                    fontSize: "12px",
                    letterSpacing: "0.02em",
                    lineHeight: "1.6",
                    margin: 0,
                    wordBreak: "break-all",
                  }}
                >
                  {groupChecksum(checksumSha256)}
                </Text>
              </div>
            </Section>
          ) : null}

          {passwordProtected ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: CARD_BG,
                  border: `1px dashed ${BRAND_BLUE}`,
                  borderRadius: "8px",
                  padding: "12px 16px",
                }}
              >
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  This archive is encrypted. We never send the passphrase by
                  email — it's shown once in your account when you start an
                  export, so use the copy you saved then to open the file.
                </Text>
              </div>
            </Section>
          ) : null}

          {manageExportsUrl ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                You can review past exports or start a new one from your{" "}
                <a
                  href={manageExportsUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  export history
                </a>
                .
              </Text>
            </Section>
          ) : null}

          <Hr style={{ borderColor: BORDER, margin: "24px 32px 0 32px" }} />

          <Section style={{ padding: "20px 32px 28px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Didn't request this export? Don't open the link — someone may have
              access to your account. Contact us right away at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>{" "}
              and we'll revoke the download and help you secure your account.
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
            notification about a data export you requested.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

DataExportReadyEmail.PreviewProps = {
  recipientName: "Jane Doe",
  exportId: "exp_8Fq2Lm4Xa9Rb",
  requestedAt: "Oct 1, 2026 at 9:14 AM UTC",
  completedAt: "Oct 1, 2026 at 9:21 AM UTC",
  fileName: "account-export-2026-10-01.zip",
  fileSize: "48.2 MB",
  fileFormat: "ZIP archive (JSON + CSV)",
  recordCount: 182431,
  checksumSha256:
    "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  includedDatasets: [
    "Account profile and settings",
    "Schemas, versions and migration history",
    "Vault entries and access grants",
    "Audit log (last 24 months)",
    "Billing invoices and receipts",
  ],
  passwordProtected: true,
  downloadUrl: "https://example.com/account/exports/exp_8Fq2Lm4Xa9Rb/download",
  manageExportsUrl: "https://example.com/account/exports",
  expiresAt: "Oct 8, 2026 at 9:21 AM UTC",
} satisfies DataExportReadyEmailProps;
