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
  name: string;
  downloadUrl: string;
  expiresAt: string;
  requestedAt?: string;
  fileSize?: string;
  fileFormat?: string;
  itemsIncluded?: string[];
  productName?: string;
  supportEmail?: string;
  securityContactEmail?: string;
}

// Mirrors @schemavaults/theme brand tokens (see node_modules/@schemavaults/theme/globals.css).
// Email clients don't resolve CSS custom properties, so the token hex values are inlined here.
const BRAND_BLUE = "#60a5fa";
const BRAND_BLUE_DARK = "#2563eb";
const BRAND_RED = "#dc2626";
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
const WARNING_BG = "#fef3c7";
const WARNING_BORDER = "#fcd34d";
const WARNING_FG = "#78350f";

const DEFAULT_ITEMS: readonly string[] = [
  "Account profile and settings",
  "Activity history and audit logs",
  "Schemas and vault contents you own",
];

export default function DataExportReadyEmail(
  props: DataExportReadyEmailProps,
): ReactElement {
  if (typeof props.name !== "string" && process.env.NODE_ENV !== "development") {
    throw new Error(
      "Missing 'name' in props for DataExportReadyEmail template!",
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
  const securityContactEmail: string =
    typeof props.securityContactEmail === "string" &&
    props.securityContactEmail.length > 0
      ? props.securityContactEmail
      : "security@schemavaults.com";
  const fileSize: string | undefined =
    typeof props.fileSize === "string" && props.fileSize.length > 0
      ? props.fileSize
      : undefined;
  const fileFormat: string | undefined =
    typeof props.fileFormat === "string" && props.fileFormat.length > 0
      ? props.fileFormat
      : undefined;
  const requestedAt: string | undefined =
    typeof props.requestedAt === "string" && props.requestedAt.length > 0
      ? props.requestedAt
      : undefined;
  const itemsIncluded: readonly string[] =
    Array.isArray(props.itemsIncluded) && props.itemsIncluded.length > 0
      ? props.itemsIncluded
      : DEFAULT_ITEMS;

  const previewText = `Your ${productName} data export is ready — the download link expires ${props.expiresAt}.`;

  const metaRows: Array<[string, string]> = [];
  if (requestedAt) {
    metaRows.push(["Requested", requestedAt]);
  }
  if (fileFormat) {
    metaRows.push(["Format", fileFormat]);
  }
  if (fileSize) {
    metaRows.push(["Size", fileSize]);
  }
  metaRows.push(["Expires", props.expiresAt]);

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
              Hi {props.name},
            </Text>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "15px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              The export you requested from {productName} has finished
              processing and is ready to download. The archive is encrypted in
              transit and tied to your account.
            </Text>
          </Section>

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
                  margin: "0 0 6px 0",
                  textTransform: "uppercase",
                }}
              >
                What's included
              </Text>
              {itemsIncluded.map((item, idx) => (
                <Text
                  key={idx}
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: "0 0 4px 0",
                    paddingLeft: "18px",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      color: BRAND_BLUE_DARK,
                      fontWeight: 700,
                      left: 0,
                      position: "absolute",
                    }}
                  >
                    ·
                  </span>
                  {item}
                </Text>
              ))}
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
              Download your data
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

          <Section style={{ padding: "8px 32px 0 32px" }}>
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
                  fontWeight: 600,
                  lineHeight: "1.5",
                  margin: "0 0 2px 0",
                }}
              >
                This link expires {props.expiresAt}.
              </Text>
              <Text
                style={{
                  color: WARNING_FG,
                  fontSize: "13px",
                  lineHeight: "1.5",
                  margin: 0,
                }}
              >
                After it expires the archive is permanently deleted from our
                servers. Save a copy somewhere safe before then.
              </Text>
            </div>
          </Section>

          <Hr style={{ borderColor: BORDER, margin: "20px 32px 0 32px" }} />

          <Section style={{ padding: "16px 32px 28px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: "0 0 8px 0",
              }}
            >
              Didn't request this export? Your account may be compromised.
              Contact our security team immediately at{" "}
              <a
                href={`mailto:${securityContactEmail}`}
                style={{ color: BRAND_RED, fontWeight: 600, textDecoration: "none" }}
              >
                {securityContactEmail}
              </a>
              .
            </Text>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              For anything else, reach us at{" "}
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
            email because you requested a copy of your account data.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

DataExportReadyEmail.PreviewProps = {
  name: "Jane Doe",
  downloadUrl:
    "https://schemavaults.com/exports/download?token=example-export-token",
  expiresAt: "Jun 27, 2026 17:00 UTC",
  requestedAt: "Jun 20, 2026 09:14 UTC",
  fileSize: "247 MB",
  fileFormat: "ZIP archive (JSON + CSV)",
  itemsIncluded: [
    "Account profile and settings",
    "Activity history and audit logs",
    "Schemas and vault contents you own",
    "API keys metadata (keys themselves are not exported)",
  ],
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
  securityContactEmail: "security@schemavaults.com",
} satisfies DataExportReadyEmailProps;
