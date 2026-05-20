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
  exportId?: string;
  format?: string;
  fileSize?: string;
  itemCount?: string;
  requestedAt?: string;
  completedAt?: string;
  expiresAt?: string;
  scope?: string;
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
const NOTICE_BG = "#fffbeb";
const NOTICE_BORDER = "#fde68a";
const NOTICE_ACCENT = "#b45309";

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
  const scope: string | undefined =
    typeof props.scope === "string" && props.scope.length > 0
      ? props.scope
      : undefined;
  const expiresAt: string | undefined =
    typeof props.expiresAt === "string" && props.expiresAt.length > 0
      ? props.expiresAt
      : undefined;

  const previewText = `Your "${props.exportName}" data export is ready to download from ${productName}.`;

  const metaRows: Array<[string, string]> = [["Export", props.exportName]];
  if (typeof props.exportId === "string" && props.exportId.length > 0) {
    metaRows.push(["Export ID", props.exportId]);
  }
  if (typeof props.format === "string" && props.format.length > 0) {
    metaRows.push(["Format", props.format]);
  }
  if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
    metaRows.push(["File size", props.fileSize]);
  }
  if (typeof props.itemCount === "string" && props.itemCount.length > 0) {
    metaRows.push(["Items", props.itemCount]);
  }
  if (
    typeof props.requestedAt === "string" &&
    props.requestedAt.length > 0
  ) {
    metaRows.push(["Requested", props.requestedAt]);
  }
  if (
    typeof props.completedAt === "string" &&
    props.completedAt.length > 0
  ) {
    metaRows.push(["Completed", props.completedAt]);
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
              Your <strong>{props.exportName}</strong> export has finished
              processing and is ready to download. Use the secure link below to
              retrieve your archive — only you can access it while signed in to{" "}
              {productName}.
            </Text>
          </Section>

          {scope ? (
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
                  Included in this export
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  {scope}
                </Text>
              </div>
            </Section>
          ) : null}

          {typeof props.exportId === "string" && props.exportId.length > 0 ? (
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
                  Export identifier
                </Text>
                <Text
                  style={{
                    color: CODE_FG,
                    fontFamily:
                      "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
                    fontSize: "14px",
                    letterSpacing: "0.02em",
                    margin: 0,
                    wordBreak: "break-all",
                  }}
                >
                  {props.exportId}
                </Text>
              </div>
            </Section>
          ) : null}

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
                        wordBreak: "break-all",
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

          {expiresAt ? (
            <Section style={{ padding: "16px 32px 8px 32px" }}>
              <div
                style={{
                  backgroundColor: NOTICE_BG,
                  border: `1px solid ${NOTICE_BORDER}`,
                  borderLeft: `4px solid ${NOTICE_ACCENT}`,
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <Text
                  style={{
                    color: NOTICE_ACCENT,
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    margin: "0 0 4px 0",
                    textTransform: "uppercase",
                  }}
                >
                  Download window
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  This link expires on <strong>{expiresAt}</strong>. After that
                  the archive is purged from our servers and you'll need to
                  request a fresh export.
                </Text>
              </div>
            </Section>
          ) : null}

          <Hr style={{ borderColor: BORDER, margin: "16px 32px 0 32px" }} />

          <Section style={{ padding: "20px 32px 28px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Didn't request this export? Let us know at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>{" "}
              — the link can be revoked immediately and we'll review your
              account activity.
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
            email because a data export was requested on your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

DataExportReadyEmail.PreviewProps = {
  userName: "Jane Doe",
  exportName: "Full workspace backup",
  downloadUrl:
    "https://schemavaults.com/account/exports/download?token=example-token",
  exportId: "exp_01HFJK4N6XKQH7Z3R8M2P9TVAB",
  format: "ZIP (JSON + SQL)",
  fileSize: "248.6 MB",
  itemCount: "1,284 schemas · 42 vaults",
  requestedAt: "May 19, 2026 09:14 UTC",
  completedAt: "May 19, 2026 09:21 UTC",
  expiresAt: "May 26, 2026 09:21 UTC",
  scope:
    "All schemas, vaults, mailing lists, API keys (metadata only), and audit logs you have access to.",
  productName: "SchemaVaults",
  supportEmail: "support@schemavaults.com",
} satisfies DataExportReadyEmailProps;
