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
  expiresAt: string;
  format?: string;
  fileSize?: string;
  itemCount?: string;
  requestedAt?: string;
  passwordProtected?: boolean;
  supportEmail?: string;
  productName?: string;
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
  const exportName: string | undefined =
    typeof props.exportName === "string" && props.exportName.length > 0
      ? props.exportName
      : undefined;
  const format: string | undefined =
    typeof props.format === "string" && props.format.length > 0
      ? props.format
      : undefined;
  const fileSize: string | undefined =
    typeof props.fileSize === "string" && props.fileSize.length > 0
      ? props.fileSize
      : undefined;
  const itemCount: string | undefined =
    typeof props.itemCount === "string" && props.itemCount.length > 0
      ? props.itemCount
      : undefined;
  const requestedAt: string | undefined =
    typeof props.requestedAt === "string" && props.requestedAt.length > 0
      ? props.requestedAt
      : undefined;
  const passwordProtected: boolean = props.passwordProtected === true;

  const previewText = exportName
    ? `Your ${exportName} export is ready to download.`
    : `Your data export is ready to download from ${productName}.`;

  const metaRows: Array<[string, string]> = [];
  if (exportName) {
    metaRows.push(["Export", exportName]);
  }
  if (format) {
    metaRows.push(["Format", format]);
  }
  if (fileSize) {
    metaRows.push(["File size", fileSize]);
  }
  if (itemCount) {
    metaRows.push(["Records", itemCount]);
  }
  if (requestedAt) {
    metaRows.push(["Requested", requestedAt]);
  }
  metaRows.push(["Link expires", props.expiresAt]);

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
              We've finished preparing the data export you requested from{" "}
              {productName}. Download it using the button below — the link is
              tied to your account and expires on{" "}
              <strong>{props.expiresAt}</strong>.
            </Text>
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

          {passwordProtected ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: NOTICE_BG,
                  border: `1px solid ${NOTICE_BORDER}`,
                  borderLeft: `4px solid ${NOTICE_BORDER}`,
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
                  Password protected
                </Text>
                <Text
                  style={{
                    color: NOTICE_FG,
                    fontSize: "13px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  This archive is encrypted. Use the password shown in your
                  account's Data & privacy page to unpack it — we never send
                  passwords by email.
                </Text>
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "16px 32px 0 32px" }}>
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
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                Keep this link private
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                Anyone with this link can download the archive until it
                expires. Do not forward this email or share the URL. Once
                you've downloaded and stored the file, we recommend deleting
                this message.
              </Text>
            </div>
          </Section>

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
              Didn't request an export? Please contact us at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>{" "}
              so we can investigate.
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
  userName: "Alex Kim",
  exportName: "Full account archive",
  downloadUrl:
    "https://schemavaults.com/exports/download?token=example-token-abc123",
  expiresAt: "Jul 12, 2026 17:00 UTC",
  format: "ZIP (JSON + CSV)",
  fileSize: "14.2 MB",
  itemCount: "1,284 schemas · 27 vaults",
  requestedAt: "Jul 5, 2026 09:14 UTC",
  passwordProtected: true,
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies DataExportReadyEmailProps;
