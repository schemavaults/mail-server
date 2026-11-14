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

export interface DataExportFile {
  /** File name as it appears inside the archive, e.g. "subscribers.csv". */
  name: string;
  /** Human-readable format label, e.g. "CSV", "JSON", "Parquet". */
  format?: string;
  /** Pre-formatted file size, e.g. "4.2 MB". */
  size?: string;
  /** Number of records/rows contained in the file. */
  recordCount?: number;
}

export interface DataExportReadyEmailProps {
  recipientName?: string;
  /** Reference ID of the export job, shown so support can trace it. */
  exportId: string;
  /** Signed, expiring download URL for the export archive. */
  downloadUrl: string;
  requestedAt?: string;
  readyAt?: string;
  /** When the download link stops working. Rendered as a prominent notice. */
  expiresAt?: string;
  /** Pre-formatted total archive size, e.g. "128 MB". */
  totalSize?: string;
  /** Per-file manifest of what the archive contains. */
  files?: DataExportFile[];
  /** One-line summary of what was exported (account, workspace, date range…). */
  scopeSummary?: string;
  /** Address that asked for the export, for "was this you?" context. */
  requestedByEmail?: string;
  /** IP address the export was requested from, for "was this you?" context. */
  requestedFromIp?: string;
  /** Link to the account's data & privacy settings page. */
  manageDataUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Neutral palette tokens. Email clients don't resolve CSS custom properties
// (or oklch()), so concrete hex values are inlined here; the brand accent
// colors come from the configured brand inside the component.
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
// Success accent: the @schemavaults/theme `--chart-3` green (#1baf7a), with a
// darker shade for text/contrast and tinted surfaces for the "ready" panel.
const GREEN = "#1baf7a";
const GREEN_DARK = "#0f7a55";
const GREEN_BG = "#ecfdf5";
const GREEN_BORDER = "#a7f3d0";
const GREEN_FOREGROUND = "#06543c";
// Expiry accent: the @schemavaults/theme `--chart-4` amber (#eda100), matched
// to the amber callout surfaces the other warning templates in this directory use.
const AMBER = "#eda100";
const AMBER_DARK = "#b45309";
const AMBER_BG = "#fffbeb";
const AMBER_BORDER = "#fde68a";
const AMBER_FOREGROUND = "#78350f";

function formatRecordCount(count: number): string {
  return `${count.toLocaleString("en-US")} record${count === 1 ? "" : "s"}`;
}

export default function DataExportReadyEmail(
  props: DataExportReadyEmailProps,
): ReactElement {
  if (
    typeof props.exportId !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'exportId' in props for DataExportReadyEmail template!",
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
    typeof props.recipientName === "string" && props.recipientName.length > 0
      ? props.recipientName
      : "there";
  const scopeSummary: string | undefined =
    typeof props.scopeSummary === "string" && props.scopeSummary.length > 0
      ? props.scopeSummary
      : undefined;
  const totalSize: string | undefined =
    typeof props.totalSize === "string" && props.totalSize.length > 0
      ? props.totalSize
      : undefined;
  const expiresAt: string | undefined =
    typeof props.expiresAt === "string" && props.expiresAt.length > 0
      ? props.expiresAt
      : undefined;
  const manageDataUrl: string | undefined =
    typeof props.manageDataUrl === "string" && props.manageDataUrl.length > 0
      ? props.manageDataUrl
      : undefined;
  const files: DataExportFile[] = Array.isArray(props.files) ? props.files : [];

  const previewText = expiresAt
    ? `Your ${productName} data export is ready to download — the link expires ${expiresAt}.`
    : `Your ${productName} data export is ready to download.`;

  const metaRows: Array<[string, string]> = [["Export ID", props.exportId]];
  if (typeof props.requestedAt === "string" && props.requestedAt.length > 0) {
    metaRows.push(["Requested", props.requestedAt]);
  }
  if (typeof props.readyAt === "string" && props.readyAt.length > 0) {
    metaRows.push(["Completed", props.readyAt]);
  }
  if (
    typeof props.requestedByEmail === "string" &&
    props.requestedByEmail.length > 0
  ) {
    metaRows.push(["Requested by", props.requestedByEmail]);
  }
  if (
    typeof props.requestedFromIp === "string" &&
    props.requestedFromIp.length > 0
  ) {
    metaRows.push(["Request IP", props.requestedFromIp]);
  }
  if (files.length > 0) {
    metaRows.push(["Files", `${files.length}`]);
  }
  if (totalSize) {
    metaRows.push(["Archive size", totalSize]);
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
              We finished packaging the {productName} data you asked for. Use
              the button below to download the archive — it&apos;s yours to
              keep, and you can request another export at any time.
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: GREEN_BG,
                border: `1px solid ${GREEN_BORDER}`,
                borderLeft: `4px solid ${GREEN}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: GREEN_DARK,
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                ✓ Export complete
              </Text>
              <Text
                style={{
                  color: GREEN_FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                {scopeSummary
                  ? scopeSummary
                  : "Your archive contains every record we hold for your account."}
                {totalSize ? (
                  <>
                    {" "}
                    <strong>
                      {files.length > 0
                        ? `${files.length} file${files.length === 1 ? "" : "s"} · ${totalSize}`
                        : totalSize}
                    </strong>
                  </>
                ) : null}
              </Text>
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

          {expiresAt ? (
            <Section style={{ padding: "12px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: AMBER_BG,
                  border: `1px solid ${AMBER_BORDER}`,
                  borderLeft: `4px solid ${AMBER}`,
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <Text
                  style={{
                    color: AMBER_DARK,
                    fontSize: "12px",
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
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  After that the archive is deleted from our servers and the
                  download link stops working. Request a fresh export if you
                  need it again.
                </Text>
              </div>
            </Section>
          ) : null}

          {files.length > 0 ? (
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
                What&apos;s in the archive
              </Text>
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{
                  border: `1px solid ${BORDER}`,
                  borderCollapse: "collapse",
                  borderRadius: "8px",
                  width: "100%",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        backgroundColor: PANEL_BG,
                        borderBottom: `1px solid ${BORDER}`,
                        color: MUTED_FOREGROUND,
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        padding: "8px 12px",
                        textAlign: "left",
                        textTransform: "uppercase",
                      }}
                    >
                      File
                    </th>
                    <th
                      style={{
                        backgroundColor: PANEL_BG,
                        borderBottom: `1px solid ${BORDER}`,
                        color: MUTED_FOREGROUND,
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        padding: "8px 12px",
                        textAlign: "right",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Size
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file, idx) => {
                    const detailParts: string[] = [];
                    if (
                      typeof file.format === "string" &&
                      file.format.length > 0
                    ) {
                      detailParts.push(file.format);
                    }
                    if (typeof file.recordCount === "number") {
                      detailParts.push(formatRecordCount(file.recordCount));
                    }
                    return (
                      <tr key={`${file.name}-${idx}`}>
                        <td
                          style={{
                            borderBottom:
                              idx === files.length - 1
                                ? "none"
                                : `1px solid ${BORDER}`,
                            color: FOREGROUND,
                            fontSize: "13px",
                            lineHeight: "1.5",
                            padding: "10px 12px",
                            verticalAlign: "top",
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{file.name}</span>
                          {detailParts.length > 0 ? (
                            <>
                              <br />
                              <span
                                style={{
                                  color: MUTED_FOREGROUND,
                                  fontSize: "12px",
                                }}
                              >
                                {detailParts.join(" · ")}
                              </span>
                            </>
                          ) : null}
                        </td>
                        <td
                          style={{
                            borderBottom:
                              idx === files.length - 1
                                ? "none"
                                : `1px solid ${BORDER}`,
                            color: FOREGROUND,
                            fontSize: "13px",
                            lineHeight: "1.5",
                            padding: "10px 12px",
                            textAlign: "right",
                            verticalAlign: "top",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {typeof file.size === "string" && file.size.length > 0
                            ? file.size
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
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
                        wordBreak: "break-word",
                      }}
                    >
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section style={{ padding: "12px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: PANEL_BG,
                border: `1px solid ${BORDER}`,
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
                Keep this link private
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                Anyone with the download link can read the exported data, so
                don&apos;t forward this email. If you didn&apos;t request this
                export, contact{" "}
                <a
                  href={`mailto:${supportEmail}`}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  {supportEmail}
                </a>{" "}
                right away.
              </Text>
            </div>
          </Section>

          {manageDataUrl ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                Manage your data, request another export, or delete your
                account from{" "}
                <a
                  href={manageDataUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  your data &amp; privacy settings
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
              Questions about what&apos;s in your export? Reply to this email
              or reach us at{" "}
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
  exportId: "exp_8f31c7a94b2e",
  downloadUrl:
    "https://example.com/exports/exp_8f31c7a94b2e/download?token=example-token",
  requestedAt: "Nov 12, 2026 09:14 UTC",
  readyAt: "Nov 12, 2026 09:21 UTC",
  expiresAt: "Nov 19, 2026 09:21 UTC",
  totalSize: "48.6 MB",
  scopeSummary:
    "Everything in the Acme Platform workspace, including schemas, vault records, and audit history.",
  files: [
    {
      name: "schemas.json",
      format: "JSON",
      size: "12.4 MB",
      recordCount: 1842,
    },
    {
      name: "vault-records.csv",
      format: "CSV",
      size: "31.8 MB",
      recordCount: 204913,
    },
    {
      name: "audit-log.csv",
      format: "CSV",
      size: "4.4 MB",
      recordCount: 58210,
    },
    { name: "README.txt", format: "Plain text", size: "2 KB" },
  ],
  requestedByEmail: "jane@acme.co",
  requestedFromIp: "203.0.113.42",
  manageDataUrl: "https://example.com/settings/privacy",
} satisfies DataExportReadyEmailProps;
