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
  exportName: string;
  downloadUrl: string;
  exportType?: string;
  fileFormat?: string;
  fileSize?: string;
  recordCount?: string;
  requestedAt?: string;
  requestedByName?: string;
  requestedByEmail?: string;
  expiresAt?: string;
  checksum?: string;
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
const CODE_BG = "#0f172a";
const CODE_FG = "#e2e8f0";
const SUCCESS_BG = "#ecfdf5";
const SUCCESS_BORDER = "#bbf7d0";
const SUCCESS_FG = "#047857";
const NOTICE_BG = "#fffbeb";
const NOTICE_BORDER = "#fde68a";
const NOTICE_FG = "#92400e";

export default function DataExportReadyEmail(
  props: DataExportReadyEmailProps,
): ReactElement {
  if (
    typeof props.exportName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'exportName' in props for DataExportReadyEmail template!",
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
      : "Data export";
  const requestedByLine: string | undefined =
    typeof props.requestedByName === "string" &&
    props.requestedByName.length > 0
      ? typeof props.requestedByEmail === "string" &&
        props.requestedByEmail.length > 0
        ? `${props.requestedByName} (${props.requestedByEmail})`
        : props.requestedByName
      : typeof props.requestedByEmail === "string" &&
          props.requestedByEmail.length > 0
        ? props.requestedByEmail
        : undefined;

  const previewText = `Your ${productName} export "${props.exportName}" is ready to download.`;

  const metaRows: Array<[string, string]> = [
    ["Export", props.exportName],
    ["Type", exportType],
  ];
  if (typeof props.fileFormat === "string" && props.fileFormat.length > 0) {
    metaRows.push(["Format", props.fileFormat]);
  }
  if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
    metaRows.push(["Size", props.fileSize]);
  }
  if (typeof props.recordCount === "string" && props.recordCount.length > 0) {
    metaRows.push(["Records", props.recordCount]);
  }
  if (requestedByLine) {
    metaRows.push(["Requested by", requestedByLine]);
  }
  if (typeof props.requestedAt === "string" && props.requestedAt.length > 0) {
    metaRows.push(["Requested at", props.requestedAt]);
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
              {productName} · Data exports
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
              Your export is ready.
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
              We finished preparing your <strong>{props.exportName}</strong>{" "}
              export from {productName}. It's ready to download using the
              secure link below.
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: SUCCESS_BG,
                border: `1px solid ${SUCCESS_BORDER}`,
                borderLeft: `4px solid ${SUCCESS_FG}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: SUCCESS_FG,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                Export completed
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                The archive has been generated and stored on our servers, ready
                for you to pull down whenever it's convenient.
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

          {typeof props.checksum === "string" && props.checksum.length > 0 ? (
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
                  SHA-256 checksum
                </Text>
                <Text
                  style={{
                    color: CODE_FG,
                    fontFamily:
                      "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
                    fontSize: "12px",
                    letterSpacing: "0.02em",
                    margin: 0,
                    wordBreak: "break-all",
                  }}
                >
                  {props.checksum}
                </Text>
              </div>
            </Section>
          ) : null}

          {typeof props.expiresAt === "string" && props.expiresAt.length > 0 ? (
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
                    letterSpacing: "0.06em",
                    margin: "0 0 4px 0",
                    textTransform: "uppercase",
                  }}
                >
                  Link expires
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  This download link is valid until{" "}
                  <strong>{props.expiresAt}</strong>. After that, request a new
                  export from your account settings.
                </Text>
              </div>
            </Section>
          ) : null}

          <Hr style={{ borderColor: BORDER, margin: "20px 32px 0 32px" }} />

          <Section style={{ padding: "16px 32px 8px 32px" }}>
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
                  margin: "0 0 6px 0",
                  textTransform: "uppercase",
                }}
              >
                Didn't request this export?
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                If you weren't expecting this export, someone else with account
                access may have created it. Review recent activity and reach
                out to us at{" "}
                <a
                  href={`mailto:${supportEmail}`}
                  style={{
                    color: BRAND_BLUE_DARK,
                    textDecoration: "none",
                  }}
                >
                  {supportEmail}
                </a>
                .
              </Text>
            </div>
          </Section>

          <Section style={{ padding: "16px 32px 28px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Treat this archive like any other backup — it contains your
              account data. Store it somewhere safe and delete it when you no
              longer need it.
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
            notification because a data export was requested on your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

DataExportReadyEmail.PreviewProps = {
  userName: "Jane Doe",
  exportName: "full-account-export-2026-07-06",
  downloadUrl:
    "https://schemavaults.com/exports/download?id=exp_9f2a1c&sig=example-signature",
  exportType: "Full account export",
  fileFormat: "ZIP (JSON records)",
  fileSize: "48.2 MB",
  recordCount: "12,483 records across 6 schemas",
  requestedAt: "July 6, 2026 09:14 UTC",
  requestedByName: "Jane Doe",
  requestedByEmail: "jane@acme.co",
  expiresAt: "July 13, 2026 09:14 UTC",
  checksum:
    "9f2a1c8b7e4d3f6a5c2b1e9d8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies DataExportReadyEmailProps;
