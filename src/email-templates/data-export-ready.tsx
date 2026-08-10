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
  recipientName?: string;
  downloadUrl: string;
  requestedAt?: string;
  expiresAt?: string;
  fileFormat?: string;
  fileSize?: string;
  datasetSummary?: string;
  didNotRequestUrl?: string;
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
// Amber warning tokens used for the expiration callout, aligned with the
// `--warning` token defined in @schemavaults/theme.
const WARNING_BG = "#fffbeb";
const WARNING_BORDER = "#fcd34d";
const WARNING_FOREGROUND = "#78350f";

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
  const requestedAt: string | undefined =
    typeof props.requestedAt === "string" && props.requestedAt.length > 0
      ? props.requestedAt
      : undefined;
  const expiresAt: string | undefined =
    typeof props.expiresAt === "string" && props.expiresAt.length > 0
      ? props.expiresAt
      : undefined;
  const fileFormat: string | undefined =
    typeof props.fileFormat === "string" && props.fileFormat.length > 0
      ? props.fileFormat
      : undefined;
  const fileSize: string | undefined =
    typeof props.fileSize === "string" && props.fileSize.length > 0
      ? props.fileSize
      : undefined;
  const datasetSummary: string | undefined =
    typeof props.datasetSummary === "string" && props.datasetSummary.length > 0
      ? props.datasetSummary
      : undefined;
  const didNotRequestUrl: string | undefined =
    typeof props.didNotRequestUrl === "string" &&
    props.didNotRequestUrl.length > 0
      ? props.didNotRequestUrl
      : undefined;

  const previewText = `Your ${productName} data export is ready to download.`;

  const metaRows: Array<[string, string]> = [];
  if (fileFormat) {
    metaRows.push(["Format", fileFormat]);
  }
  if (fileSize) {
    metaRows.push(["Size", fileSize]);
  }
  if (requestedAt) {
    metaRows.push(["Requested", requestedAt]);
  }
  if (expiresAt) {
    metaRows.push(["Link expires", expiresAt]);
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
              The archive you requested from {productName} has finished
              generating and is now available to download.
            </Text>
          </Section>

          {datasetSummary ? (
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
                  What's inside
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  {datasetSummary}
                </Text>
              </div>
            </Section>
          ) : null}

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
              Download my data
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
                    color: WARNING_FOREGROUND,
                    fontSize: "13px",
                    fontWeight: 600,
                    lineHeight: "1.5",
                    margin: "0 0 2px 0",
                  }}
                >
                  This link expires on {expiresAt}.
                </Text>
                <Text
                  style={{
                    color: WARNING_FOREGROUND,
                    fontSize: "12px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  After that, you'll need to request a new export from your
                  account settings.
                </Text>
              </div>
            </Section>
          ) : null}

          <Hr style={{ borderColor: BORDER, margin: "0 32px" }} />

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "13px",
                fontWeight: 600,
                lineHeight: "1.5",
                margin: "0 0 6px 0",
              }}
            >
              Keep this archive private
            </Text>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              This download link grants access to a full copy of your account
              data. Anyone with the link can open it, so don't share the URL
              and save the file somewhere only you can reach.
            </Text>
          </Section>

          <Section style={{ padding: "12px 32px 28px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Didn't request this export?{" "}
              {didNotRequestUrl ? (
                <>
                  <a
                    href={didNotRequestUrl}
                    style={{
                      color: BRAND_BLUE_DARK,
                      textDecoration: "none",
                    }}
                  >
                    Secure your account
                  </a>{" "}
                  and let us know at{" "}
                </>
              ) : (
                "Contact us right away at "
              )}
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
            email because a data export was generated for your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

DataExportReadyEmail.PreviewProps = {
  recipientName: "Jane Doe",
  downloadUrl:
    "https://example.com/exports/download?token=example-token&id=exp_01HZ0X",
  requestedAt: "Aug 9, 2026 14:22 UTC",
  expiresAt: "Aug 16, 2026 14:22 UTC",
  fileFormat: "ZIP (JSON + CSV)",
  fileSize: "48.2 MB",
  datasetSummary:
    "3 workspaces, 42 projects, 1,284 documents, 6 months of activity logs, and account profile settings.",
  didNotRequestUrl: "https://example.com/account/security",
} satisfies DataExportReadyEmailProps;
