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

export interface DataExportContentsEntry {
  /** Name of a dataset bundled into the archive, e.g. "Schemas". */
  label: string;
  /** Optional detail for the dataset, e.g. "412 records · JSON". */
  detail?: string;
}

export interface DataExportReadyEmailProps {
  /** Signed, account-scoped URL the archive is downloaded from. */
  downloadUrl: string;
  recipientName?: string;
  /** Opaque identifier of the export job, shown for support requests. */
  exportId?: string;
  /** Human-readable timestamp the export was requested at. */
  requestedAt?: string;
  /** Human-readable timestamp the export finished at. */
  completedAt?: string;
  /** Human-readable timestamp the download link stops working at. */
  expiresAt?: string;
  /** File name of the archive, e.g. "schemavaults-export-2026-11-07.zip". */
  fileName?: string;
  /** Archive format summary, e.g. "ZIP (JSON + CSV)". */
  fileFormat?: string;
  /** Pre-formatted archive size, e.g. "48.2 MB". */
  fileSize?: string;
  /** Number of files inside the archive. */
  fileCount?: number;
  /** Start of the exported data range. */
  dataRangeStart?: string;
  /** End of the exported data range. */
  dataRangeEnd?: string;
  /** Lowercase hex SHA-256 digest of the archive, for integrity checks. */
  checksumSha256?: string;
  /** Datasets bundled into the archive. */
  contents?: DataExportContentsEntry[];
  /** Link to start a fresh export once this one expires. */
  requestAnotherExportUrl?: string;
  /** Link to the deployment's privacy policy / data-handling page. */
  privacyPolicyUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Neutral palette tokens. Email clients don't resolve CSS custom properties
// or oklch(), so concrete hex values are inlined here; the brand accent
// colors come from the configured brand inside the component.
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";

// Teal-green "ready/complete" palette — mirrors the theme's
// `--chart-3: #1baf7a` data-visualization token, used here for the
// completed-export state so it stays distinct from the emerald
// payment-success palette.
const TEAL = "#1baf7a";
const TEAL_DARK = "#0f7f59";
const TEAL_BG = "#effbf5";
const TEAL_BORDER = "#a7ebcf";
const TEAL_FOREGROUND = "#0a5740";

// Amber — mirrors theme `--warning: oklch(82% 0.189 84.429)`, used for the
// link-expiration notice.
const AMBER_DARK = "#b45309";
const AMBER_BG = "#fffbeb";
const AMBER_BORDER = "#fde68a";
const AMBER_FOREGROUND = "#78350f";

const MONOSPACE_STACK =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

function nonEmpty(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
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

  const brand = getEmailBrand();
  const BRAND_BLUE = brand.colors.accent;
  const BRAND_BLUE_DARK = brand.colors.accentDark;

  const productName: string = nonEmpty(props.productName) ?? brand.productName;
  const supportEmail: string =
    nonEmpty(props.supportEmail) ?? brand.supportEmail;
  const greetingName: string = nonEmpty(props.recipientName) ?? "there";

  const fileName: string | undefined = nonEmpty(props.fileName);
  const fileFormat: string | undefined = nonEmpty(props.fileFormat);
  const fileSize: string | undefined = nonEmpty(props.fileSize);
  const fileCount: number | undefined =
    typeof props.fileCount === "number" && Number.isFinite(props.fileCount)
      ? props.fileCount
      : undefined;
  const exportId: string | undefined = nonEmpty(props.exportId);
  const requestedAt: string | undefined = nonEmpty(props.requestedAt);
  const completedAt: string | undefined = nonEmpty(props.completedAt);
  const expiresAt: string | undefined = nonEmpty(props.expiresAt);
  const dataRangeStart: string | undefined = nonEmpty(props.dataRangeStart);
  const dataRangeEnd: string | undefined = nonEmpty(props.dataRangeEnd);
  const checksumSha256: string | undefined = nonEmpty(props.checksumSha256);
  const requestAnotherExportUrl: string | undefined = nonEmpty(
    props.requestAnotherExportUrl,
  );
  const privacyPolicyUrl: string | undefined = nonEmpty(props.privacyPolicyUrl);
  const contents: DataExportContentsEntry[] = Array.isArray(props.contents)
    ? props.contents
    : [];

  // "48.2 MB · 14 files · ZIP (JSON + CSV)" — only the parts we were given.
  const archiveSummary: string = [
    fileSize,
    typeof fileCount === "number"
      ? `${fileCount.toLocaleString("en-US")} ${fileCount === 1 ? "file" : "files"}`
      : undefined,
    fileFormat,
  ]
    .filter((part): part is string => typeof part === "string")
    .join(" · ");

  const dataRange: string | undefined =
    dataRangeStart && dataRangeEnd
      ? `${dataRangeStart} – ${dataRangeEnd}`
      : (dataRangeStart ?? dataRangeEnd);

  const previewText: string = expiresAt
    ? `Your ${productName} data export is ready to download. The link expires ${expiresAt}.`
    : `Your ${productName} data export is ready to download.`;

  const metaRows: Array<[string, string, boolean]> = [];
  if (exportId) {
    metaRows.push(["Export ID", exportId, true]);
  }
  if (requestedAt) {
    metaRows.push(["Requested", requestedAt, false]);
  }
  if (completedAt) {
    metaRows.push(["Completed", completedAt, false]);
  }
  if (dataRange) {
    metaRows.push(["Data range", dataRange, false]);
  }
  if (fileFormat) {
    metaRows.push(["Format", fileFormat, false]);
  }
  if (fileSize) {
    metaRows.push(["Size", fileSize, false]);
  }
  if (typeof fileCount === "number") {
    metaRows.push(["Files", fileCount.toLocaleString("en-US"), false]);
  }
  if (expiresAt) {
    metaRows.push(["Link expires", expiresAt, false]);
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
              We finished packaging the {productName} data you asked us to
              export. Use the button below to download the archive
              {expiresAt ? " before the link expires" : ""}.
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: TEAL_BG,
                border: `1px solid ${TEAL_BORDER}`,
                borderLeft: `4px solid ${TEAL}`,
                borderRadius: "8px",
                padding: "16px 18px",
              }}
            >
              <Text
                style={{
                  color: TEAL_DARK,
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                Export complete
              </Text>
              <Text
                style={{
                  color: TEAL_FOREGROUND,
                  fontFamily: fileName ? MONOSPACE_STACK : undefined,
                  fontSize: fileName ? "14px" : "15px",
                  fontWeight: 600,
                  lineHeight: "1.5",
                  margin: "6px 0 0 0",
                  wordBreak: "break-all",
                }}
              >
                {fileName ?? "Your archive is ready to download."}
              </Text>
              {archiveSummary.length > 0 ? (
                <Text
                  style={{
                    color: TEAL_DARK,
                    fontSize: "13px",
                    lineHeight: "1.5",
                    margin: "4px 0 0 0",
                  }}
                >
                  {archiveSummary}
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

          <Section style={{ padding: "8px 32px 16px 32px" }}>
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

          {expiresAt ? (
            <Section style={{ padding: "0 32px 0 32px" }}>
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
                    color: AMBER_DARK,
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    margin: "0 0 4px 0",
                    textTransform: "uppercase",
                  }}
                >
                  Link expires {expiresAt}
                </Text>
                <Text
                  style={{
                    color: AMBER_FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  After that the archive is deleted from our servers and the
                  link stops working.
                  {requestAnotherExportUrl
                    ? " You can start a fresh export at any time."
                    : " Request a new export if you still need the data."}
                </Text>
              </div>
            </Section>
          ) : null}

          {contents.length > 0 ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
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
                What's included
              </Text>
              <div
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "8px",
                  padding: "6px 16px",
                }}
              >
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{ borderCollapse: "collapse", width: "100%" }}
                >
                  <tbody>
                    {contents.map((entry, index) => (
                      <tr key={`${entry.label}-${index}`}>
                        <td
                          style={{
                            borderTop:
                              index === 0 ? "none" : `1px solid ${BORDER}`,
                            color: FOREGROUND,
                            fontSize: "14px",
                            fontWeight: 500,
                            lineHeight: "1.6",
                            padding: "10px 12px 10px 0",
                            verticalAlign: "top",
                          }}
                        >
                          {entry.label}
                        </td>
                        <td
                          style={{
                            borderTop:
                              index === 0 ? "none" : `1px solid ${BORDER}`,
                            color: MUTED_FOREGROUND,
                            fontSize: "13px",
                            lineHeight: "1.6",
                            padding: "10px 0",
                            textAlign: "right",
                            verticalAlign: "top",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {nonEmpty(entry.detail) ?? ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          ) : null}

          {metaRows.length > 0 ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
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
                Export details
              </Text>
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{ borderCollapse: "collapse", width: "100%" }}
              >
                <tbody>
                  {metaRows.map(([label, value, mono]) => (
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
                          fontFamily: mono ? MONOSPACE_STACK : undefined,
                          fontSize: "13px",
                          fontWeight: 500,
                          lineHeight: "1.6",
                          padding: "4px 0",
                          verticalAlign: "top",
                          wordBreak: mono ? "break-all" : undefined,
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

          {checksumSha256 ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "8px",
                  padding: "12px 14px",
                }}
              >
                <Text
                  style={{
                    color: MUTED_FOREGROUND,
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    margin: "0 0 4px 0",
                    textTransform: "uppercase",
                  }}
                >
                  SHA-256 checksum
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontFamily: MONOSPACE_STACK,
                    fontSize: "12px",
                    lineHeight: "1.5",
                    margin: 0,
                    wordBreak: "break-all",
                  }}
                >
                  {checksumSha256}
                </Text>
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 0 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              This download link is tied to your export request and should be
              treated like a password — anyone who has it can download your
              data, so please don't forward this email.
            </Text>
          </Section>

          {requestAnotherExportUrl || privacyPolicyUrl ? (
            <Section style={{ padding: "12px 32px 0 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                {requestAnotherExportUrl ? (
                  <a
                    href={requestAnotherExportUrl}
                    style={{
                      color: BRAND_BLUE_DARK,
                      textDecoration: "none",
                    }}
                  >
                    Request another export
                  </a>
                ) : null}
                {requestAnotherExportUrl && privacyPolicyUrl ? " · " : null}
                {privacyPolicyUrl ? (
                  <a
                    href={privacyPolicyUrl}
                    style={{
                      color: BRAND_BLUE_DARK,
                      textDecoration: "none",
                    }}
                  >
                    How we handle your data
                  </a>
                ) : null}
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
              Didn't request an export? Please contact us right away at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>
              {exportId ? ` and quote export ID ${exportId}` : ""}.
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
    "https://example.com/exports/exp_8f2c1a7d4b/download?token=example-token",
  exportId: "exp_8f2c1a7d4b",
  requestedAt: "Nov 7, 2026 09:12 UTC",
  completedAt: "Nov 7, 2026 09:18 UTC",
  expiresAt: "Nov 14, 2026 09:18 UTC",
  fileName: "acme-platform-export-2026-11-07.zip",
  fileFormat: "ZIP (JSON + CSV)",
  fileSize: "48.2 MB",
  fileCount: 14,
  dataRangeStart: "Jan 1, 2025",
  dataRangeEnd: "Nov 7, 2026",
  checksumSha256:
    "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  contents: [
    { label: "Schemas", detail: "412 records · JSON" },
    { label: "Vault documents", detail: "1,208 records · JSON" },
    { label: "Audit log", detail: "36,540 rows · CSV" },
    { label: "Team members", detail: "9 records · JSON" },
    { label: "Attachments", detail: "6 files" },
  ],
  requestAnotherExportUrl: "https://example.com/settings/data-exports",
  privacyPolicyUrl: "https://example.com/legal/privacy",
} satisfies DataExportReadyEmailProps;
