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
  /** Download URL for the finished archive. Required. */
  downloadUrl: string;
  /** Recipient's display name; falls back to a neutral greeting. */
  name?: string;
  /** Account / workspace the export covers. */
  accountName?: string;
  /** Address that requested the export, shown so the recipient can spot an unexpected request. */
  requestedByEmail?: string;
  /** Human-readable time the export was requested. */
  requestedAt?: string;
  /** Human-readable time the download link stops working. */
  expiresAt?: string;
  /** Short relative phrase for the expiry callout, e.g. "7 days". */
  expiresIn?: string;
  /** Archive format, e.g. "ZIP archive (JSON + CSV)". */
  exportFormat?: string;
  /** Human-readable archive size, e.g. "48.2 MB". */
  fileSize?: string;
  /** Number of files inside the archive, as a display string. */
  fileCount?: string;
  /** Data categories bundled into the export, rendered as a checklist. */
  includedData?: string[];
  /** Where the recipient manages their exports / privacy settings. */
  manageDataUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Neutral palette for this template. Email clients don't resolve CSS custom
// properties, so the @schemavaults/theme token values are inlined as hex.
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";

// Amber conveys the time-limited nature of the download link, matching the
// semantic warning palette used by trial-ending and usage-limit-warning.
const AMBER = "#f59e0b";
const AMBER_DARK = "#b45309";
const AMBER_BG = "#fffbeb";
const AMBER_BORDER = "#fde68a";
const AMBER_FOREGROUND = "#78350f";

// Emerald marks the export as complete and ready, matching payment-receipt's
// success palette.
const EMERALD_DARK = "#047857";
const EMERALD_BG = "#ecfdf5";
const EMERALD_BORDER = "#a7f3d0";

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
  const manageDataUrl: string =
    typeof props.manageDataUrl === "string" && props.manageDataUrl.length > 0
      ? props.manageDataUrl
      : `${brand.url}/account/data`;
  const greetingName: string =
    typeof props.name === "string" && props.name.length > 0
      ? props.name
      : "there";
  const subjectLabel: string =
    typeof props.accountName === "string" && props.accountName.length > 0
      ? props.accountName
      : productName;
  const includedData: string[] = Array.isArray(props.includedData)
    ? props.includedData.filter(
        (entry): entry is string =>
          typeof entry === "string" && entry.length > 0,
      )
    : [];

  const metaRows: Array<[string, string]> = [];
  if (typeof props.exportFormat === "string" && props.exportFormat.length > 0) {
    metaRows.push(["Format", props.exportFormat]);
  }
  if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
    metaRows.push(["Size", props.fileSize]);
  }
  if (typeof props.fileCount === "string" && props.fileCount.length > 0) {
    metaRows.push(["Files", props.fileCount]);
  }
  if (typeof props.accountName === "string" && props.accountName.length > 0) {
    metaRows.push(["Account", props.accountName]);
  }
  if (typeof props.requestedAt === "string" && props.requestedAt.length > 0) {
    metaRows.push(["Requested", props.requestedAt]);
  }
  if (
    typeof props.requestedByEmail === "string" &&
    props.requestedByEmail.length > 0
  ) {
    metaRows.push(["Requested by", props.requestedByEmail]);
  }
  if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
    metaRows.push(["Link expires", props.expiresAt]);
  }

  const expiryCopy: string =
    typeof props.expiresIn === "string" && props.expiresIn.length > 0
      ? `This download link works for the next ${props.expiresIn}.`
      : typeof props.expiresAt === "string" && props.expiresAt.length > 0
        ? `This download link stops working on ${props.expiresAt}.`
        : "This download link is only available for a limited time.";

  return (
    <Html>
      <Head />
      <Preview>
        {`Your ${subjectLabel} data export is ready to download.`}
      </Preview>
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
                fontSize: "24px",
                fontWeight: 700,
                lineHeight: "1.25",
                margin: "8px 0 0 0",
              }}
            >
              Your export is ready
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
              We finished packaging the data you requested from {subjectLabel}.
              Download the archive below to keep a copy of your information.
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: PANEL_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: "10px",
                padding: "18px 20px",
              }}
            >
              <Text
                style={{
                  backgroundColor: EMERALD_BG,
                  border: `1px solid ${EMERALD_BORDER}`,
                  borderRadius: "999px",
                  color: EMERALD_DARK,
                  display: "inline-block",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  margin: "0 0 12px 0",
                  padding: "4px 10px",
                  textTransform: "uppercase",
                }}
              >
                Export complete
              </Text>

              {metaRows.length > 0 ? (
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
              ) : (
                <Text
                  style={{
                    color: MUTED_FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.6",
                    margin: 0,
                  }}
                >
                  Your archive is waiting at the link below.
                </Text>
              )}
            </div>
          </Section>

          <Section style={{ padding: "20px 32px 4px 32px" }}>
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

          <Section style={{ padding: "4px 32px 8px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "12px",
                lineHeight: "1.6",
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

          <Section style={{ padding: "12px 32px 8px 32px" }}>
            <div
              style={{
                backgroundColor: AMBER_BG,
                border: `1px solid ${AMBER_BORDER}`,
                borderLeft: `4px solid ${AMBER}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: AMBER_DARK,
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                Link expires
              </Text>
              <Text
                style={{
                  color: AMBER_FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                {expiryCopy} After that you'll need to request a new export.
              </Text>
            </div>
          </Section>

          {includedData.length > 0 ? (
            <Section style={{ padding: "12px 32px 0 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
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
                  {includedData.map((entry) => (
                    <tr key={entry}>
                      <td
                        style={{
                          color: BRAND_BLUE_DARK,
                          fontSize: "14px",
                          fontWeight: 700,
                          lineHeight: "1.6",
                          padding: "3px 10px 3px 0",
                          verticalAlign: "top",
                          width: "16px",
                        }}
                      >
                        &#10003;
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
                        {entry}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          ) : null}

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "14px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Treat this archive like a password — it contains your personal
              data. Anyone with the link can download it, so don't forward this
              email.
            </Text>
          </Section>

          <Hr style={{ borderColor: BORDER, margin: "16px 32px 0 32px" }} />

          <Section style={{ padding: "20px 32px 28px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: "0 0 8px 0",
              }}
            >
              Didn't request this export? Review your account's data and
              privacy settings at{" "}
              <a
                href={manageDataUrl}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {manageDataUrl}
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
              Questions? Reach us at{" "}
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
            © {new Date().getFullYear()} {productName}. This email was sent
            because a data export was requested for your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

DataExportReadyEmail.PreviewProps = {
  name: "Jane Doe",
  downloadUrl: "https://example.com/exports/9f2c41d8/download",
  accountName: "Acme Analytics",
  requestedByEmail: "jane@example.com",
  requestedAt: "Apr 19, 2026 10:30 UTC",
  expiresAt: "Apr 26, 2026 10:30 UTC",
  expiresIn: "7 days",
  exportFormat: "ZIP archive (JSON + CSV)",
  fileSize: "48.2 MB",
  fileCount: "1,284 files",
  includedData: [
    "Profile and account settings",
    "Projects, schemas, and version history",
    "Team members and role assignments",
    "Sign-in and audit activity",
    "Billing history and invoices",
  ],
  manageDataUrl: "https://example.com/account/data",
} satisfies DataExportReadyEmailProps;
