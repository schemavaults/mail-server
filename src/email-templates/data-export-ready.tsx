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
  /** Signed, expiring URL the recipient uses to download the archive. */
  downloadUrl: string;
  recipientName?: string;
  /** Human label for the export job, e.g. "Full account export". */
  exportName?: string;
  requestedAt?: string;
  completedAt?: string;
  /** When the download link stops working, e.g. "Oct 3, 2026 09:00 UTC". */
  expiresAt?: string;
  /** Archive format, e.g. "ZIP (JSON + CSV)". */
  fileFormat?: string;
  /** Human-readable archive size, e.g. "48.2 MB". */
  fileSize?: string;
  /** Human-readable record total, e.g. "1,284,902 records". */
  recordCount?: string;
  /** What the archive contains, rendered as a checklist. */
  includedDatasets?: string[];
  /** Link to the privacy / data controls page in the product. */
  manageDataUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Neutral palette and semantic status colors for this template. Email clients
// don't resolve CSS custom properties or oklch(), so the values are inlined as
// hex. The brand accent pair comes from the configured brand (which mirrors the
// @schemavaults/theme brand tokens) inside the component.
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
// EMERALD conveys "your export finished successfully".
const EMERALD = "#10b981";
const EMERALD_DARK = "#047857";
// AMBER carries the time-sensitive "this link expires" warning.
const AMBER_BG = "#fffbeb";
const AMBER_BORDER = "#fcd34d";
const AMBER_DARK = "#92400e";

const DEFAULT_INCLUDED_DATASETS: readonly string[] = [
  "Account profile and settings",
  "Your projects and their contents",
  "Activity and audit history",
];

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
  const greetingName: string =
    typeof props.recipientName === "string" && props.recipientName.length > 0
      ? props.recipientName
      : "there";
  const exportName: string =
    typeof props.exportName === "string" && props.exportName.length > 0
      ? props.exportName
      : "Your data export";
  const expiresAt: string | undefined =
    typeof props.expiresAt === "string" && props.expiresAt.length > 0
      ? props.expiresAt
      : undefined;
  const manageDataUrl: string | undefined =
    typeof props.manageDataUrl === "string" && props.manageDataUrl.length > 0
      ? props.manageDataUrl
      : undefined;
  const includedDatasets: readonly string[] =
    Array.isArray(props.includedDatasets) && props.includedDatasets.length > 0
      ? props.includedDatasets
      : DEFAULT_INCLUDED_DATASETS;

  const previewText = `${exportName} is ready to download from ${productName}.`;

  const metaRows: Array<[string, string]> = [];
  if (typeof props.fileFormat === "string" && props.fileFormat.length > 0) {
    metaRows.push(["Format", props.fileFormat]);
  }
  if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
    metaRows.push(["Size", props.fileSize]);
  }
  if (typeof props.recordCount === "string" && props.recordCount.length > 0) {
    metaRows.push(["Contents", props.recordCount]);
  }
  if (typeof props.requestedAt === "string" && props.requestedAt.length > 0) {
    metaRows.push(["Requested", props.requestedAt]);
  }
  if (typeof props.completedAt === "string" && props.completedAt.length > 0) {
    metaRows.push(["Completed", props.completedAt]);
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
              {exportName} is ready to download.
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
              We finished packaging the data you asked {productName} to export.
              The archive is waiting behind the private link below — it is tied
              to your account and should not be shared with anyone else.
            </Text>
          </Section>

          {metaRows.length > 0 ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
                  borderLeft: `4px solid ${EMERALD}`,
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <Text
                  style={{
                    color: EMERALD_DARK,
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    margin: "0 0 8px 0",
                    textTransform: "uppercase",
                  }}
                >
                  Export summary
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
                            padding: "3px 12px 3px 0",
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
                            padding: "3px 0",
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
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <Text
                  style={{
                    color: AMBER_DARK,
                    fontSize: "13px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  <strong>This link expires {expiresAt}.</strong> After that the
                  archive is deleted from our servers and you'll need to request
                  a new export.
                </Text>
              </div>
            </Section>
          ) : null}

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
                  <tr key={dataset}>
                    <td
                      style={{
                        color: EMERALD_DARK,
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "1.6",
                        padding: "3px 10px 3px 0",
                        verticalAlign: "top",
                        width: "16px",
                      }}
                    >
                      ✓
                    </td>
                    <td
                      style={{
                        color: FOREGROUND,
                        fontSize: "14px",
                        lineHeight: "1.6",
                        padding: "3px 0",
                        verticalAlign: "top",
                      }}
                    >
                      {dataset}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                Manage what {productName} stores about you — including deleting
                your account — from your{" "}
                <a
                  href={manageDataUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  privacy &amp; data settings
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
              Didn't request an export? Don't open the link — contact us right
              away at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>{" "}
              so we can secure your account.
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
  exportName: "Full account export",
  downloadUrl: "https://example.com/exports/download?token=example-token",
  requestedAt: "Sep 24, 2026 14:02 UTC",
  completedAt: "Sep 24, 2026 14:19 UTC",
  expiresAt: "Oct 1, 2026 14:19 UTC",
  fileFormat: "ZIP (JSON + CSV)",
  fileSize: "48.2 MB",
  recordCount: "1,284,902 records across 9 datasets",
  includedDatasets: [
    "Account profile, settings, and API keys metadata",
    "All vaults, schemas, and their version history",
    "Team memberships and permission grants",
    "Sign-in and audit activity for the last 24 months",
  ],
  manageDataUrl: "https://example.com/settings/privacy",
} satisfies DataExportReadyEmailProps;
