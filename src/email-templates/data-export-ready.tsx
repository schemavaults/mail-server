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
  exportId?: string;
  downloadUrl: string;
  expiresAt: string;
  fileFormat?: string;
  fileSizeBytes?: number;
  itemCount?: number;
  scope?: string;
  requestedAt?: string;
  ipAddress?: string;
  location?: string;
  manageDataUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties, so the token hex values are inlined here.
const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const NOTICE_BG = "#fffbeb";
const NOTICE_BORDER = "#fde68a";
const NOTICE_FG = "#78350f";

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return `${bytes} B`;
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[i]}`;
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
  const fileFormat: string =
    typeof props.fileFormat === "string" && props.fileFormat.length > 0
      ? props.fileFormat
      : "ZIP";
  const scope: string | undefined =
    typeof props.scope === "string" && props.scope.length > 0
      ? props.scope
      : undefined;
  const exportId: string | undefined =
    typeof props.exportId === "string" && props.exportId.length > 0
      ? props.exportId
      : undefined;
  const requestedAt: string | undefined =
    typeof props.requestedAt === "string" && props.requestedAt.length > 0
      ? props.requestedAt
      : undefined;
  const ipAddress: string | undefined =
    typeof props.ipAddress === "string" && props.ipAddress.length > 0
      ? props.ipAddress
      : undefined;
  const location: string | undefined =
    typeof props.location === "string" && props.location.length > 0
      ? props.location
      : undefined;
  const manageDataUrl: string | undefined =
    typeof props.manageDataUrl === "string" && props.manageDataUrl.length > 0
      ? props.manageDataUrl
      : undefined;
  const fileSizeLabel: string | undefined =
    typeof props.fileSizeBytes === "number" && Number.isFinite(props.fileSizeBytes)
      ? formatBytes(props.fileSizeBytes)
      : undefined;
  const itemCountLabel: string | undefined =
    typeof props.itemCount === "number" && Number.isFinite(props.itemCount)
      ? `${props.itemCount.toLocaleString("en-US")} item${props.itemCount === 1 ? "" : "s"}`
      : undefined;

  const previewText = `Your ${productName} data export is ready to download. The link expires ${props.expiresAt}.`;

  const metaRows: Array<[string, string]> = [];
  if (scope) {
    metaRows.push(["Scope", scope]);
  }
  metaRows.push(["Format", fileFormat]);
  if (fileSizeLabel) {
    metaRows.push(["Size", fileSizeLabel]);
  }
  if (itemCountLabel) {
    metaRows.push(["Items", itemCountLabel]);
  }
  if (requestedAt) {
    metaRows.push(["Requested", requestedAt]);
  }
  metaRows.push(["Expires", props.expiresAt]);
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
              The data export you requested from {productName} has finished
              processing and is ready to download. For your security, the link
              below is private to you and will expire on{" "}
              <strong>{props.expiresAt}</strong>.
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 0 32px" }}>
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
                backgroundColor: NOTICE_BG,
                border: `1px solid ${NOTICE_BORDER}`,
                borderLeft: `4px solid ${NOTICE_FG}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: NOTICE_FG,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                Treat this file as sensitive
              </Text>
              <Text
                style={{
                  color: NOTICE_FG,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                The archive contains a copy of your account data. Store it
                somewhere private and delete it when you're done. We can't
                recover the file once the link expires.
              </Text>
            </div>
          </Section>

          {ipAddress || location || requestedAt ? (
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
                    margin: "0 0 4px 0",
                    textTransform: "uppercase",
                  }}
                >
                  Request details
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  {requestedAt ? <>Requested {requestedAt}</> : null}
                  {requestedAt && (ipAddress || location) ? " · " : null}
                  {ipAddress ? <>IP {ipAddress}</> : null}
                  {ipAddress && location ? " · " : null}
                  {location ? <>{location}</> : null}
                </Text>
              </div>
            </Section>
          ) : null}

          {manageDataUrl ? (
            <Section style={{ padding: "16px 32px 8px 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                Manage your data and privacy settings at{" "}
                <a
                  href={manageDataUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  {manageDataUrl}
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
              Didn't request this export? Please contact us right away at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>
              {" "}— someone may be attempting to access your account.
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
  userName: "Jane Doe",
  exportId: "exp_01HZX7V8K2M9NQ4P3R5S6T7U8V",
  downloadUrl:
    "https://schemavaults.com/data-exports/download?token=example-download-token",
  expiresAt: "May 30, 2026 17:00 UTC",
  fileFormat: "ZIP (JSON + CSV)",
  fileSizeBytes: 18_452_336,
  itemCount: 1247,
  scope: "Full account export",
  requestedAt: "May 23, 2026 14:12 UTC",
  ipAddress: "203.0.113.42",
  location: "Brooklyn, NY, USA",
  manageDataUrl: "https://schemavaults.com/settings/privacy",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies DataExportReadyEmailProps;
