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
  exportName?: string;
  downloadUrl: string;
  fileFormat?: string;
  fileSize?: string;
  recordCount?: string;
  generatedAt?: string;
  expiresAt?: string;
  requestedFromIp?: string;
  requestedFromLocation?: string;
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
const SUCCESS_BG = "#ecfdf5";
const SUCCESS_BORDER = "#a7f3d0";
const SUCCESS_FG = "#065f46";
const WARNING_BG = "#fffbeb";
const WARNING_BORDER = "#fde68a";
const WARNING_FG = "#92400e";

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
  const exportName: string =
    typeof props.exportName === "string" && props.exportName.length > 0
      ? props.exportName
      : "Your data export";
  const fileFormat: string | undefined =
    typeof props.fileFormat === "string" && props.fileFormat.length > 0
      ? props.fileFormat
      : undefined;
  const fileSize: string | undefined =
    typeof props.fileSize === "string" && props.fileSize.length > 0
      ? props.fileSize
      : undefined;
  const recordCount: string | undefined =
    typeof props.recordCount === "string" && props.recordCount.length > 0
      ? props.recordCount
      : undefined;
  const generatedAt: string | undefined =
    typeof props.generatedAt === "string" && props.generatedAt.length > 0
      ? props.generatedAt
      : undefined;
  const expiresAt: string | undefined =
    typeof props.expiresAt === "string" && props.expiresAt.length > 0
      ? props.expiresAt
      : undefined;
  const requestedFromIp: string | undefined =
    typeof props.requestedFromIp === "string" &&
    props.requestedFromIp.length > 0
      ? props.requestedFromIp
      : undefined;
  const requestedFromLocation: string | undefined =
    typeof props.requestedFromLocation === "string" &&
    props.requestedFromLocation.length > 0
      ? props.requestedFromLocation
      : undefined;

  const previewText = `${exportName} is ready to download from ${productName}.`;

  const metaRows: Array<[string, string]> = [];
  if (fileFormat) {
    metaRows.push(["Format", fileFormat]);
  }
  if (fileSize) {
    metaRows.push(["File size", fileSize]);
  }
  if (recordCount) {
    metaRows.push(["Records", recordCount]);
  }
  if (generatedAt) {
    metaRows.push(["Generated", generatedAt]);
  }
  if (requestedFromIp || requestedFromLocation) {
    const loc = [requestedFromIp, requestedFromLocation]
      .filter((v): v is string => typeof v === "string" && v.length > 0)
      .join(" · ");
    metaRows.push(["Requested from", loc]);
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
              <strong>{exportName}</strong> finished generating and is ready to
              download. The link below is signed to your account — keep it
              private.
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 0 32px" }}>
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
                  letterSpacing: "0.04em",
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                Export complete
              </Text>
              <Text
                style={{
                  color: SUCCESS_FG,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                {exportName}
                {recordCount ? ` · ${recordCount} records` : ""}
                {fileSize ? ` · ${fileSize}` : ""}
              </Text>
            </div>
          </Section>

          {metaRows.length > 0 ? (
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
            <Section style={{ padding: "0 32px 16px 32px" }}>
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
                    color: WARNING_FG,
                    fontSize: "13px",
                    lineHeight: "1.5",
                    margin: 0,
                  }}
                >
                  <strong>This link expires {expiresAt}.</strong> After that
                  you'll need to start a new export from your dashboard.
                </Text>
              </div>
            </Section>
          ) : null}

          <Hr style={{ borderColor: BORDER, margin: "0 32px" }} />

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Heading
              as="h2"
              style={{
                color: FOREGROUND,
                fontSize: "14px",
                fontWeight: 600,
                margin: "0 0 8px 0",
              }}
            >
              Didn't request this?
            </Heading>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              If you didn't start this export, someone else may have access to
              your account. Rotate your password and review active sessions
              from the dashboard, then contact us at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>
              .
            </Text>
          </Section>

          <Section style={{ padding: "12px 32px 28px 32px" }}>
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
                  fontSize: "12px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                For your security, this download link is single-use per
                session and tied to the account that requested it. We never
                attach exports directly to email.
              </Text>
            </div>
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
            © {new Date().getFullYear()} {productName}. You requested a data
            export from your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

DataExportReadyEmail.PreviewProps = {
  userName: "Jane Doe",
  exportName: "Schemas full export — May 2026",
  downloadUrl:
    "https://schemavaults.com/exports/download?token=example-token-abc123",
  fileFormat: "ZIP (JSON Schema)",
  fileSize: "8.4 MB",
  recordCount: "1,284",
  generatedAt: "May 27, 2026 14:21 UTC",
  expiresAt: "in 48 hours (May 29, 2026 14:21 UTC)",
  requestedFromIp: "203.0.113.42",
  requestedFromLocation: "San Francisco, CA, US",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies DataExportReadyEmailProps;
