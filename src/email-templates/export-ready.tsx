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

export interface ExportReadyEmailProps {
  recipientName?: string;
  exportLabel?: string;
  exportScope?: string;
  requestedAt?: string;
  readyAt?: string;
  expiresAt?: string;
  fileSize?: string;
  fileFormat?: string;
  itemSummary?: string;
  downloadUrl: string;
  manageExportsUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties or oklch(), so the token values are inlined as hex.
// The brand BLUE gradient identifies the product; the EMERALD success palette indicates the export
// completed successfully and is ready to download — consistent with payment-receipt.
const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const EMERALD = "#10b981";
const EMERALD_DARK = "#047857";
const EMERALD_BG = "#ecfdf5";
const EMERALD_BORDER = "#a7f3d0";
const EMERALD_FOREGROUND = "#064e3b";
const WARNING_BG = "#fffbeb";
const WARNING_BORDER = "#fde68a";
const WARNING_FOREGROUND = "#92400e";

export default function ExportReadyEmail(
  props: ExportReadyEmailProps,
): ReactElement {
  if (
    typeof props.downloadUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'downloadUrl' in props for ExportReadyEmail template!",
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
  const exportLabel: string =
    typeof props.exportLabel === "string" && props.exportLabel.length > 0
      ? props.exportLabel
      : "Your data export";
  const exportScope: string | undefined =
    typeof props.exportScope === "string" && props.exportScope.length > 0
      ? props.exportScope
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
  const fileSize: string | undefined =
    typeof props.fileSize === "string" && props.fileSize.length > 0
      ? props.fileSize
      : undefined;
  const fileFormat: string | undefined =
    typeof props.fileFormat === "string" && props.fileFormat.length > 0
      ? props.fileFormat
      : undefined;
  const itemSummary: string | undefined =
    typeof props.itemSummary === "string" && props.itemSummary.length > 0
      ? props.itemSummary
      : undefined;
  const manageExportsUrl: string | undefined =
    typeof props.manageExportsUrl === "string" &&
    props.manageExportsUrl.length > 0
      ? props.manageExportsUrl
      : undefined;

  const previewText: string = expiresAt
    ? `${exportLabel} is ready to download — available until ${expiresAt}.`
    : `${exportLabel} is ready to download.`;

  const metaRows: Array<[string, string]> = [];
  if (exportScope) {
    metaRows.push(["Scope", exportScope]);
  }
  if (itemSummary) {
    metaRows.push(["Contents", itemSummary]);
  }
  if (fileFormat) {
    metaRows.push(["Format", fileFormat]);
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
              {exportLabel} is ready.
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
              Ready to download
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
              The data export you requested from {productName} has finished
              processing and is ready to download.
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: EMERALD_BG,
                border: `1px solid ${EMERALD_BORDER}`,
                borderLeft: `4px solid ${EMERALD_DARK}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: EMERALD_FOREGROUND,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                Export complete
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                Use the download button below to retrieve your archive. The
                link is unique to you — please don't share it.
              </Text>
            </div>
          </Section>

          {metaRows.length > 0 ? (
            <Section style={{ padding: "16px 32px 8px 32px" }}>
              <div
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "8px",
                  padding: "12px 16px",
                }}
              >
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
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 4px 32px" }}>
            <Button
              href={props.downloadUrl}
              style={{
                backgroundColor: EMERALD_DARK,
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
            {manageExportsUrl ? (
              <span style={{ marginLeft: "12px" }}>
                <a
                  href={manageExportsUrl}
                  style={{
                    color: BRAND_BLUE_DARK,
                    fontSize: "14px",
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  View all exports →
                </a>
              </span>
            ) : null}
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
            <Section style={{ padding: "12px 32px 8px 32px" }}>
              <div
                style={{
                  backgroundColor: WARNING_BG,
                  border: `1px solid ${WARNING_BORDER}`,
                  borderRadius: "8px",
                  padding: "12px 14px",
                }}
              >
                <Text
                  style={{
                    color: WARNING_FOREGROUND,
                    fontSize: "13px",
                    fontWeight: 600,
                    lineHeight: "1.55",
                    margin: "0 0 2px 0",
                  }}
                >
                  Link expires {expiresAt}
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  After expiration, your archive will be deleted from our
                  servers. Request a new export any time from your account
                  settings.
                </Text>
              </div>
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
              Didn't request this export? Reach out to{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>{" "}
              right away — someone with access to your account may have
              triggered it.
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
            email because a data export was generated on your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

ExportReadyEmail.PreviewProps = {
  recipientName: "Jane Doe",
  exportLabel: "Account data export",
  exportScope: "All vaults and schemas",
  requestedAt: "May 11, 2026 14:02 UTC",
  readyAt: "May 11, 2026 14:08 UTC",
  expiresAt: "May 18, 2026 14:08 UTC",
  fileSize: "42.3 MB",
  fileFormat: "ZIP archive",
  itemSummary: "127 schemas across 4 vaults",
  downloadUrl:
    "https://schemavaults.com/exports/download?token=example-download-token",
  manageExportsUrl: "https://schemavaults.com/account/exports",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies ExportReadyEmailProps;
