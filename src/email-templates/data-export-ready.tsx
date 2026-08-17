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
  /** Time-limited URL where the recipient can download their export. */
  downloadUrl: string;
  recipientName?: string;
  /** Human-friendly name for the export (e.g. "Account data export"). */
  exportName?: string;
  /** Short description of what the export contains. */
  exportDescription?: string;
  /** File format label (e.g. "ZIP", "CSV", "JSON"). */
  fileFormat?: string;
  /** Human file size (e.g. "12.4 MB"). */
  fileSize?: string;
  /** Human item count (e.g. "3,241 records"). */
  itemCount?: string;
  /** Absolute or human-formatted timestamp the download link expires at. */
  expiresAt?: string;
  /** Human duration until link expires (e.g. "7 days"). */
  expiresInLabel?: string;
  /** Human-formatted timestamp when the export was originally requested. */
  requestedAt?: string;
  /** Label of the primary call-to-action button. */
  ctaLabel?: string;
  /** Overrides the inbox preview text. */
  previewText?: string;
  productName?: string;
  supportEmail?: string;
}

// Neutral palette tokens. Email clients don't resolve CSS custom properties,
// so concrete hex values are inlined here; the brand accent colors come from
// the configured brand inside the component.
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
// Semantic accent for the expiration warning callout — amber reads as
// "time-sensitive" without escalating to error red.
const WARNING_BG = "#fef3c7";
const WARNING_BORDER = "#fcd34d";
const WARNING_FOREGROUND = "#78350f";
// Success accent for the "ready" chip.
const SUCCESS_BG = "#dcfce7";
const SUCCESS_BORDER = "#86efac";
const SUCCESS_FOREGROUND = "#166534";

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
  const exportDescription: string | undefined =
    typeof props.exportDescription === "string" &&
    props.exportDescription.length > 0
      ? props.exportDescription
      : undefined;
  const fileFormat: string | undefined =
    typeof props.fileFormat === "string" && props.fileFormat.length > 0
      ? props.fileFormat
      : undefined;
  const fileSize: string | undefined =
    typeof props.fileSize === "string" && props.fileSize.length > 0
      ? props.fileSize
      : undefined;
  const itemCount: string | undefined =
    typeof props.itemCount === "string" && props.itemCount.length > 0
      ? props.itemCount
      : undefined;
  const expiresAt: string | undefined =
    typeof props.expiresAt === "string" && props.expiresAt.length > 0
      ? props.expiresAt
      : undefined;
  const expiresInLabel: string | undefined =
    typeof props.expiresInLabel === "string" && props.expiresInLabel.length > 0
      ? props.expiresInLabel
      : undefined;
  const requestedAt: string | undefined =
    typeof props.requestedAt === "string" && props.requestedAt.length > 0
      ? props.requestedAt
      : undefined;
  const ctaLabel: string =
    typeof props.ctaLabel === "string" && props.ctaLabel.length > 0
      ? props.ctaLabel
      : "Download export";
  const previewText: string =
    typeof props.previewText === "string" && props.previewText.length > 0
      ? props.previewText
      : `${exportName} is ready to download.`;

  const detailRows: { label: string; value: string }[] = [];
  if (fileFormat) detailRows.push({ label: "Format", value: fileFormat });
  if (fileSize) detailRows.push({ label: "Size", value: fileSize });
  if (itemCount) detailRows.push({ label: "Contents", value: itemCount });
  if (requestedAt)
    detailRows.push({ label: "Requested", value: requestedAt });

  const expirationSentence: string | undefined = expiresAt
    ? `For your security, this download link expires on ${expiresAt}.`
    : expiresInLabel
      ? `For your security, this download link expires in ${expiresInLabel}.`
      : undefined;

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
              {exportName} is ready
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
              {exportDescription
                ? exportDescription
                : `We've finished preparing your data export. You can download the archive using the button below.`}
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 4px 32px" }}>
            <div
              style={{
                backgroundColor: PANEL_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: "8px",
                padding: "18px 20px",
              }}
            >
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{ borderCollapse: "collapse", width: "100%" }}
              >
                <tbody>
                  <tr>
                    <td style={{ padding: 0, verticalAlign: "middle" }}>
                      <Text
                        style={{
                          color: FOREGROUND,
                          fontSize: "15px",
                          fontWeight: 600,
                          lineHeight: "1.4",
                          margin: 0,
                        }}
                      >
                        {exportName}
                      </Text>
                    </td>
                    <td
                      style={{
                        padding: 0,
                        textAlign: "right",
                        verticalAlign: "middle",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: SUCCESS_BG,
                          border: `1px solid ${SUCCESS_BORDER}`,
                          borderRadius: "999px",
                          color: SUCCESS_FOREGROUND,
                          display: "inline-block",
                          fontSize: "11px",
                          fontWeight: 600,
                          letterSpacing: "0.06em",
                          lineHeight: "1",
                          padding: "5px 10px",
                          textTransform: "uppercase",
                        }}
                      >
                        Ready
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              {detailRows.length > 0 ? (
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    borderCollapse: "collapse",
                    marginTop: "12px",
                    width: "100%",
                  }}
                >
                  <tbody>
                    {detailRows.map((row, index) => (
                      <tr key={row.label}>
                        <td
                          style={{
                            borderTop:
                              index === 0 ? "none" : `1px solid ${BORDER}`,
                            color: MUTED_FOREGROUND,
                            fontSize: "13px",
                            lineHeight: "1.5",
                            padding: "8px 0",
                            verticalAlign: "top",
                            width: "35%",
                          }}
                        >
                          {row.label}
                        </td>
                        <td
                          style={{
                            borderTop:
                              index === 0 ? "none" : `1px solid ${BORDER}`,
                            color: FOREGROUND,
                            fontSize: "13px",
                            lineHeight: "1.5",
                            padding: "8px 0",
                            textAlign: "right",
                            verticalAlign: "top",
                          }}
                        >
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
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
              {ctaLabel}
            </Button>
          </Section>

          {expirationSentence ? (
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
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  {expirationSentence}
                </Text>
              </div>
            </Section>
          ) : null}

          <Section style={{ padding: "12px 32px 0 32px" }}>
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

          <Hr style={{ borderColor: BORDER, margin: "20px 32px 0 32px" }} />

          <Section style={{ padding: "16px 32px 8px 32px" }}>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "13px",
                fontWeight: 600,
                lineHeight: "1.55",
                margin: "0 0 4px 0",
              }}
            >
              Keep this link private
            </Text>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Anyone with this link can download the archive. Do not forward
              this email or share the link with people who should not have
              access to your data.
            </Text>
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
              Didn&apos;t request this export? Please contact us right away at{" "}
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
            email because you requested a data export from your {productName}{" "}
            account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

DataExportReadyEmail.PreviewProps = {
  recipientName: "Jane Doe",
  exportName: "Account data export",
  exportDescription:
    "Your export contains every record we hold for your account, including profile data, billing history, and audit logs.",
  downloadUrl:
    "https://example.com/exports/download/exp_9f2a1b8c4d?token=example-signed-token",
  fileFormat: "ZIP",
  fileSize: "12.4 MB",
  itemCount: "3,241 records across 7 files",
  requestedAt: "August 15, 2026 at 9:14 AM UTC",
  expiresAt: "August 24, 2026 at 5:00 PM UTC",
  expiresInLabel: "7 days",
} satisfies DataExportReadyEmailProps;
