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

/** One dataset bundled inside the export archive. */
export interface DataExportIncludedDataset {
  name: string;
  detail?: string;
}

export interface DataExportReadyEmailProps {
  downloadUrl: string;
  recipientName?: string;
  exportTitle?: string;
  summary?: string;
  requestedAt?: string;
  expiresAt?: string;
  fileName?: string;
  fileSizeLabel?: string;
  fileFormat?: string;
  recordCountLabel?: string;
  includedDatasets?: DataExportIncludedDataset[];
  referenceId?: string;
  productName?: string;
  supportEmail?: string;
}

// Neutral palette tokens. Email clients don't resolve CSS custom properties or
// oklch(), so concrete hex values are inlined here; the brand accent colors
// come from the configured brand (see ./brand.ts) inside the component.
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";

// Semantic status palettes, mirroring @schemavaults/theme tokens as hex (the
// theme ships them as oklch/HSL custom properties, which email clients cannot
// resolve). Green mirrors the theme's --chart-3 "ready/complete" hue; amber
// mirrors --warning and is used for the download-link expiry callout.
const GREEN = "#1baf7a";
const GREEN_BG = "#ecfdf5";
const GREEN_BORDER = "#a7f3d0";
const GREEN_FOREGROUND = "#065f46";
const AMBER = "#f59e0b";
const AMBER_BG = "#fffbeb";
const AMBER_BORDER = "#fde68a";
const AMBER_FOREGROUND = "#78350f";

/** Default copy used when the caller does not supply its own. Exported so the
 * catalog entry's plain-text renderer defaults the same props to the same
 * values. */
export const DATA_EXPORT_READY_DEFAULT_TITLE =
  "Your data export is ready to download" as const;

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

  const productName: string =
    typeof props.productName === "string" && props.productName.length > 0
      ? props.productName
      : brand.productName;
  const supportEmail: string =
    typeof props.supportEmail === "string" && props.supportEmail.length > 0
      ? props.supportEmail
      : brand.supportEmail;
  const recipientName: string =
    typeof props.recipientName === "string" && props.recipientName.length > 0
      ? props.recipientName
      : "there";
  const exportTitle: string =
    typeof props.exportTitle === "string" && props.exportTitle.length > 0
      ? props.exportTitle
      : DATA_EXPORT_READY_DEFAULT_TITLE;
  const summary: string =
    typeof props.summary === "string" && props.summary.length > 0
      ? props.summary
      : `We finished packaging the data export you requested from ${productName}. Use the button below to download the archive — the link is private to you.`;

  const fileRows: Array<[string, string]> = [];
  if (typeof props.fileName === "string" && props.fileName.length > 0) {
    fileRows.push(["File", props.fileName]);
  }
  if (typeof props.fileFormat === "string" && props.fileFormat.length > 0) {
    fileRows.push(["Format", props.fileFormat]);
  }
  if (
    typeof props.fileSizeLabel === "string" &&
    props.fileSizeLabel.length > 0
  ) {
    fileRows.push(["Size", props.fileSizeLabel]);
  }
  if (
    typeof props.recordCountLabel === "string" &&
    props.recordCountLabel.length > 0
  ) {
    fileRows.push(["Records", props.recordCountLabel]);
  }
  if (typeof props.requestedAt === "string" && props.requestedAt.length > 0) {
    fileRows.push(["Requested", props.requestedAt]);
  }
  if (typeof props.referenceId === "string" && props.referenceId.length > 0) {
    fileRows.push(["Reference", props.referenceId]);
  }

  const expiresAt: string | undefined =
    typeof props.expiresAt === "string" && props.expiresAt.length > 0
      ? props.expiresAt
      : undefined;

  const includedDatasets: DataExportIncludedDataset[] = Array.isArray(
    props.includedDatasets,
  )
    ? props.includedDatasets
    : [];

  const previewText = expiresAt
    ? `${exportTitle} — the download link expires ${expiresAt}.`
    : `${exportTitle}.`;

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
              {exportTitle}
            </Heading>
          </Section>

          <Section style={{ padding: "28px 32px 8px 32px" }}>
            <div
              style={{
                backgroundColor: GREEN_BG,
                border: `1px solid ${GREEN_BORDER}`,
                borderRadius: "999px",
                color: GREEN_FOREGROUND,
                display: "inline-block",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.04em",
                padding: "5px 12px",
                textTransform: "uppercase",
              }}
            >
              Export complete
            </div>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "16px",
                lineHeight: "1.6",
                margin: "16px 0 8px 0",
              }}
            >
              Hi {recipientName},
            </Text>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "15px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              {summary}
            </Text>
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

          {expiresAt ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
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
                    color: AMBER_FOREGROUND,
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    margin: "0 0 6px 0",
                    textTransform: "uppercase",
                  }}
                >
                  Link expires {expiresAt}
                </Text>
                <Text
                  style={{
                    color: AMBER_FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.6",
                    margin: 0,
                  }}
                >
                  After that the archive is permanently deleted from our
                  servers and you will need to request a new export.
                </Text>
              </div>
            </Section>
          ) : null}

          {fileRows.length > 0 ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
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
                    margin: "0 0 8px 0",
                    textTransform: "uppercase",
                  }}
                >
                  Archive details
                </Text>
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{ borderCollapse: "collapse", width: "100%" }}
                >
                  <tbody>
                    {fileRows.map(([label, value]) => (
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
          ) : null}

          {includedDatasets.length > 0 ? (
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
                What's inside
              </Text>
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{ borderCollapse: "collapse", width: "100%" }}
              >
                <tbody>
                  {includedDatasets.map((dataset) => (
                    <tr key={dataset.name}>
                      <td
                        style={{
                          borderBottom: `1px solid ${BORDER}`,
                          color: FOREGROUND,
                          fontSize: "13px",
                          fontWeight: 600,
                          lineHeight: "1.6",
                          padding: "8px 12px 8px 0",
                          verticalAlign: "top",
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: GREEN,
                            borderRadius: "2px",
                            display: "inline-block",
                            height: "8px",
                            marginRight: "8px",
                            width: "8px",
                          }}
                        />
                        {dataset.name}
                      </td>
                      <td
                        style={{
                          borderBottom: `1px solid ${BORDER}`,
                          color: MUTED_FOREGROUND,
                          fontSize: "13px",
                          lineHeight: "1.6",
                          padding: "8px 0",
                          textAlign: "right",
                          verticalAlign: "top",
                        }}
                      >
                        {typeof dataset.detail === "string" &&
                        dataset.detail.length > 0
                          ? dataset.detail
                          : "Included"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          ) : null}

          <Hr style={{ borderColor: BORDER, margin: "20px 32px 0 32px" }} />

          <Section style={{ padding: "16px 32px 28px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: "0 0 10px 0",
              }}
            >
              This download link is tied to your account and grants access to
              your data — please don't forward this email or share the link.
            </Text>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Didn't request an export? Contact us right away at{" "}
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
            © {new Date().getFullYear()} {productName}. This export was
            generated because it was requested from your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

DataExportReadyEmail.PreviewProps = {
  downloadUrl:
    "https://app.example.com/exports/download?token=example-export-download-token-please-replace",
  recipientName: "Jane",
  exportTitle: "Your data export is ready to download",
  requestedAt: "Oct 22, 2026 14:02 UTC",
  expiresAt: "Oct 29, 2026 14:02 UTC",
  fileName: "acme-co-export-2026-10-22.zip",
  fileFormat: "ZIP archive (CSV + JSON)",
  fileSizeLabel: "48.2 MB",
  recordCountLabel: "1,284,903 rows across 7 datasets",
  referenceId: "exp_8f2c41d9",
  includedDatasets: [
    { name: "Vaults", detail: "12 vaults" },
    { name: "Schemas", detail: "148 schemas" },
    { name: "Records", detail: "1,284,512 rows" },
    { name: "Team members", detail: "9 members" },
    { name: "Audit log", detail: "Last 24 months" },
  ],
} satisfies DataExportReadyEmailProps;
