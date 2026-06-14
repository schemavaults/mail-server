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
  recipientName?: string;
  downloadUrl: string;
  expiresAt: string;
  exportScope?: string;
  fileFormat?: string;
  fileSizeHumanReadable?: string;
  recordCount?: string;
  requestedAt?: string;
  exportId?: string;
  manageExportsUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties or oklch(), so the token values are inlined as hex.
// EMERALD palette signals "ready / completed" (parallels payment-receipt's success styling),
// layered over the SchemaVaults blue brand gradient header.
const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const EMERALD_DARK = "#047857";
const EMERALD_BG = "#ecfdf5";
const EMERALD_BORDER = "#a7f3d0";
const EMERALD_FOREGROUND = "#064e3b";
const AMBER_BG = "#fffbeb";
const AMBER_BORDER = "#fcd34d";
const AMBER_FOREGROUND = "#92400e";

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
    typeof props.recipientName === "string" && props.recipientName.length > 0
      ? props.recipientName
      : "there";
  const exportScope: string =
    typeof props.exportScope === "string" && props.exportScope.length > 0
      ? props.exportScope
      : "your account data";
  const fileFormat: string | undefined =
    typeof props.fileFormat === "string" && props.fileFormat.length > 0
      ? props.fileFormat
      : undefined;
  const fileSize: string | undefined =
    typeof props.fileSizeHumanReadable === "string" &&
    props.fileSizeHumanReadable.length > 0
      ? props.fileSizeHumanReadable
      : undefined;
  const recordCount: string | undefined =
    typeof props.recordCount === "string" && props.recordCount.length > 0
      ? props.recordCount
      : undefined;
  const requestedAt: string | undefined =
    typeof props.requestedAt === "string" && props.requestedAt.length > 0
      ? props.requestedAt
      : undefined;
  const exportId: string | undefined =
    typeof props.exportId === "string" && props.exportId.length > 0
      ? props.exportId
      : undefined;
  const manageExportsUrl: string | undefined =
    typeof props.manageExportsUrl === "string" &&
    props.manageExportsUrl.length > 0
      ? props.manageExportsUrl
      : undefined;

  const previewText = `Your ${productName} data export is ready to download — link expires ${props.expiresAt}.`;

  const metaRows: Array<[string, string]> = [];
  metaRows.push(["Export scope", exportScope]);
  if (fileFormat) {
    metaRows.push(["File format", fileFormat]);
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
              We've finished preparing the export of <strong>{exportScope}</strong>{" "}
              that you requested from {productName}. The archive is ready and
              waiting for you to download.
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
                  color: EMERALD_DARK,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                Ready to download
              </Text>
              <Text
                style={{
                  color: EMERALD_FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                Click the button below to download your archive. This link is
                personal to you — please don't share it.
              </Text>
            </div>
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
                backgroundColor: AMBER_BG,
                border: `1px solid ${AMBER_BORDER}`,
                borderRadius: "8px",
                padding: "12px 14px",
              }}
            >
              <Text
                style={{
                  color: AMBER_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                <strong>This link expires on {props.expiresAt}.</strong> After
                that, you'll need to request a new export. We expire download
                links to protect your data in case this email is forwarded or
                your inbox is compromised.
              </Text>
            </div>
          </Section>

          {manageExportsUrl ? (
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
                    color: FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  Manage past exports and request new ones any time at{" "}
                  <a
                    href={manageExportsUrl}
                    style={{
                      color: BRAND_BLUE_DARK,
                      textDecoration: "none",
                    }}
                  >
                    your exports dashboard
                  </a>
                  .
                </Text>
              </div>
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
              Didn't request this export? Someone with access to your account
              may have started it. Reach out to{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>{" "}
              right away so we can help you secure things.
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
            email because a data export was completed on your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

DataExportReadyEmail.PreviewProps = {
  recipientName: "Alex Kim",
  downloadUrl:
    "https://schemavaults.com/exports/download?token=example-export-token&id=exp_01HQXYZ",
  expiresAt: "Jun 21, 2026 17:00 UTC",
  exportScope: "All schemas, vaults, and audit logs in your workspace",
  fileFormat: "ZIP (JSON + CSV)",
  fileSizeHumanReadable: "48.2 MB",
  recordCount: "12,431 records across 8 vaults",
  requestedAt: "Jun 14, 2026 09:12 UTC",
  exportId: "exp_01HQXYZABCDEF1234567890",
  manageExportsUrl: "https://schemavaults.com/settings/exports",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies DataExportReadyEmailProps;
