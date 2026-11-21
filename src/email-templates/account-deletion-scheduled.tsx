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

export interface AccountDeletionDataEntry {
  /** Name of a dataset that will be erased, e.g. "Vault documents". */
  label: string;
  /** Optional detail for the dataset, e.g. "1,208 records". */
  detail?: string;
}

export interface AccountDeletionScheduledEmailProps {
  /** Link that cancels the pending deletion and restores the account. */
  cancelDeletionUrl: string;
  recipientName?: string;
  /** Email address of the account being deleted. */
  accountEmail?: string;
  /** Organization/workspace being deleted, when it isn't a personal account. */
  organizationName?: string;
  /** Opaque identifier of the deletion request, shown for support requests. */
  requestId?: string;
  /** Human-readable timestamp the deletion was requested at. */
  requestedAt?: string;
  /** Human-readable timestamp the account is permanently erased at. */
  scheduledDeletionAt?: string;
  /** Length of the cancellation grace period, in days. */
  gracePeriodDays?: number;
  /** Days left before the deletion runs, for the countdown badge. */
  daysRemaining?: number;
  /** Who asked for the deletion, e.g. "Jane Doe (owner)". */
  requestedByName?: string;
  /** Where the request came from, e.g. "Chrome on macOS · Austin, TX". */
  requestedFrom?: string;
  /** Datasets that will be erased when the deletion runs. */
  dataToBeDeleted?: AccountDeletionDataEntry[];
  /** What is kept after deletion for legal/accounting reasons. */
  retainedDataNote?: string;
  /** What happens to a paid plan, e.g. "Your Team plan ends immediately…". */
  subscriptionNote?: string;
  /** Link to download an account data export before the deletion runs. */
  dataExportUrl?: string;
  /** Link to the deployment's privacy policy / data-handling page. */
  privacyPolicyUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Neutral palette tokens. Email clients don't resolve CSS custom properties
// or oklch(), so concrete hex values are inlined here; the brand accent
// colors come from the configured brand inside the component.
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";

// Destructive palette — mirrors the theme's `--destructive`
// (light `0 84.2% 60.2%`, dark `0 62.8% 30.6%`) used for irreversible
// actions. Matches the red hero of the payment-failed template.
const DESTRUCTIVE = "#dc2626";
const DESTRUCTIVE_DARK = "#991b1b";
const DESTRUCTIVE_BG = "#fef2f2";
const DESTRUCTIVE_BORDER = "#fecaca";
const DESTRUCTIVE_FOREGROUND = "#7f1d1d";

// Amber — mirrors theme `--warning: oklch(82% 0.189 84.429)` with its
// `--warning-foreground: oklch(41% 0.112 45.904)`, used for the
// "export your data first" nudge.
const AMBER = "#f59e0b";
const AMBER_DARK = "#b45309";
const AMBER_BG = "#fffbeb";
const AMBER_BORDER = "#fde68a";
const AMBER_FOREGROUND = "#78350f";

// Timeline rail tokens: the already-completed step uses the theme's
// `--chart-3` teal, the pending steps the warning amber and destructive red.
const TEAL = "#1baf7a";

const MONOSPACE_STACK =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

function nonEmpty(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function finiteCount(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : undefined;
}

function pluralizeDays(days: number): string {
  return `${days.toLocaleString("en-US")} ${days === 1 ? "day" : "days"}`;
}

export default function AccountDeletionScheduledEmail(
  props: AccountDeletionScheduledEmailProps,
): ReactElement {
  if (
    typeof props.cancelDeletionUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'cancelDeletionUrl' in props for AccountDeletionScheduledEmail template!",
    );
  }

  const brand = getEmailBrand();
  const BRAND_BLUE_DARK = brand.colors.accentDark;

  const productName: string = nonEmpty(props.productName) ?? brand.productName;
  const supportEmail: string =
    nonEmpty(props.supportEmail) ?? brand.supportEmail;
  const greetingName: string = nonEmpty(props.recipientName) ?? "there";

  const accountEmail: string | undefined = nonEmpty(props.accountEmail);
  const organizationName: string | undefined = nonEmpty(
    props.organizationName,
  );
  const requestId: string | undefined = nonEmpty(props.requestId);
  const requestedAt: string | undefined = nonEmpty(props.requestedAt);
  const scheduledDeletionAt: string | undefined = nonEmpty(
    props.scheduledDeletionAt,
  );
  const requestedByName: string | undefined = nonEmpty(props.requestedByName);
  const requestedFrom: string | undefined = nonEmpty(props.requestedFrom);
  const retainedDataNote: string | undefined = nonEmpty(props.retainedDataNote);
  const subscriptionNote: string | undefined = nonEmpty(props.subscriptionNote);
  const dataExportUrl: string | undefined = nonEmpty(props.dataExportUrl);
  const privacyPolicyUrl: string | undefined = nonEmpty(props.privacyPolicyUrl);
  const gracePeriodDays: number | undefined = finiteCount(
    props.gracePeriodDays,
  );
  const daysRemaining: number | undefined = finiteCount(props.daysRemaining);
  const dataToBeDeleted: AccountDeletionDataEntry[] = Array.isArray(
    props.dataToBeDeleted,
  )
    ? props.dataToBeDeleted
    : [];

  // "your account" / "the Acme Corp workspace" — what is actually going away.
  const subjectPhrase: string = organizationName
    ? `the ${organizationName} workspace`
    : "your account";

  const countdownLabel: string | undefined =
    typeof daysRemaining === "number"
      ? daysRemaining === 0
        ? "Deleting today"
        : `${pluralizeDays(daysRemaining)} left to cancel`
      : typeof gracePeriodDays === "number"
        ? `${pluralizeDays(gracePeriodDays)} left to cancel`
        : undefined;

  const previewText: string = scheduledDeletionAt
    ? `${productName}: ${subjectPhrase} is scheduled for permanent deletion on ${scheduledDeletionAt}. Cancel any time before then.`
    : `${productName}: ${subjectPhrase} is scheduled for permanent deletion. Cancel any time before it runs.`;

  // Requested → grace period → permanent deletion.
  const timeline: Array<{
    color: string;
    title: string;
    detail: string;
    done: boolean;
  }> = [
    {
      color: TEAL,
      title: "Deletion requested",
      detail: requestedAt ?? "Just now",
      done: true,
    },
    {
      color: AMBER,
      title: "Cancellation window open",
      detail:
        typeof gracePeriodDays === "number"
          ? `${pluralizeDays(gracePeriodDays)} to change your mind — sign in to restore ${subjectPhrase}`
          : `You can change your mind — sign in to restore ${subjectPhrase}`,
      done: false,
    },
    {
      color: DESTRUCTIVE,
      title: "Permanent deletion",
      detail: scheduledDeletionAt
        ? `${scheduledDeletionAt} — this cannot be undone`
        : "This cannot be undone",
      done: false,
    },
  ];

  const metaRows: Array<[string, string, boolean]> = [];
  if (requestId) {
    metaRows.push(["Request ID", requestId, true]);
  }
  if (accountEmail) {
    metaRows.push(["Account", accountEmail, false]);
  }
  if (organizationName) {
    metaRows.push(["Workspace", organizationName, false]);
  }
  if (requestedAt) {
    metaRows.push(["Requested", requestedAt, false]);
  }
  if (requestedByName) {
    metaRows.push(["Requested by", requestedByName, false]);
  }
  if (requestedFrom) {
    metaRows.push(["Requested from", requestedFrom, false]);
  }
  if (typeof gracePeriodDays === "number") {
    metaRows.push(["Grace period", pluralizeDays(gracePeriodDays), false]);
  }
  if (scheduledDeletionAt) {
    metaRows.push(["Deletes on", scheduledDeletionAt, false]);
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
              background: `linear-gradient(135deg, ${DESTRUCTIVE} 0%, ${DESTRUCTIVE_DARK} 100%)`,
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
              {productName} · Account deletion
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
              {organizationName
                ? `${organizationName} is scheduled for deletion.`
                : "Your account is scheduled for deletion."}
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
              We received a request to permanently delete {subjectPhrase} on{" "}
              {productName}
              {accountEmail ? ` (${accountEmail})` : ""}. Nothing has been
              erased yet — the deletion is scheduled, and you can cancel it at
              any point before it runs.
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: DESTRUCTIVE_BG,
                border: `1px solid ${DESTRUCTIVE_BORDER}`,
                borderLeft: `4px solid ${DESTRUCTIVE}`,
                borderRadius: "8px",
                padding: "16px 18px",
              }}
            >
              <Text
                style={{
                  color: DESTRUCTIVE_DARK,
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                Scheduled for permanent deletion
              </Text>
              <Text
                style={{
                  color: DESTRUCTIVE_FOREGROUND,
                  fontSize: "20px",
                  fontWeight: 700,
                  lineHeight: "1.35",
                  margin: "6px 0 0 0",
                }}
              >
                {scheduledDeletionAt ?? "Date to be confirmed"}
              </Text>
              {countdownLabel ? (
                <Text
                  style={{
                    color: DESTRUCTIVE_DARK,
                    fontSize: "13px",
                    fontWeight: 600,
                    lineHeight: "1.5",
                    margin: "4px 0 0 0",
                  }}
                >
                  {countdownLabel}
                </Text>
              ) : null}
            </div>
          </Section>

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={props.cancelDeletionUrl}
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
              {organizationName ? "Keep this workspace" : "Keep my account"}
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
                href={props.cancelDeletionUrl}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {props.cancelDeletionUrl}
              </a>
            </Text>
          </Section>

          <Section style={{ padding: "0 32px 0 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                margin: "0 0 10px 0",
                textTransform: "uppercase",
              }}
            >
              What happens next
            </Text>
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              style={{ borderCollapse: "collapse", width: "100%" }}
            >
              <tbody>
                {timeline.map((step, index) => (
                  <tr key={step.title}>
                    <td
                      style={{
                        padding: "0 14px 0 0",
                        verticalAlign: "top",
                        width: "14px",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: step.color,
                          border: `2px solid ${step.done ? step.color : CARD_BG}`,
                          borderRadius: "7px",
                          height: "10px",
                          margin: "5px 0 0 0",
                          width: "10px",
                        }}
                      />
                      {index < timeline.length - 1 ? (
                        <div
                          style={{
                            backgroundColor: BORDER,
                            height: "28px",
                            margin: "2px 0 0 6px",
                            width: "2px",
                          }}
                        />
                      ) : null}
                    </td>
                    <td
                      style={{
                        padding:
                          index < timeline.length - 1
                            ? "0 0 12px 0"
                            : "0 0 2px 0",
                        verticalAlign: "top",
                      }}
                    >
                      <Text
                        style={{
                          color: FOREGROUND,
                          fontSize: "14px",
                          fontWeight: 600,
                          lineHeight: "1.5",
                          margin: 0,
                        }}
                      >
                        {step.title}
                      </Text>
                      <Text
                        style={{
                          color: MUTED_FOREGROUND,
                          fontSize: "13px",
                          lineHeight: "1.5",
                          margin: "2px 0 0 0",
                        }}
                      >
                        {step.detail}
                      </Text>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {dataExportUrl ? (
            <Section style={{ padding: "20px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: AMBER_BG,
                  border: `1px solid ${AMBER_BORDER}`,
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <Text
                  style={{
                    color: AMBER_DARK,
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    margin: "0 0 4px 0",
                    textTransform: "uppercase",
                  }}
                >
                  Download your data first
                </Text>
                <Text
                  style={{
                    color: AMBER_FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  Once the deletion runs we can't recover anything, so export
                  anything you want to keep while you still can.{" "}
                  <a
                    href={dataExportUrl}
                    style={{ color: AMBER_DARK, fontWeight: 600 }}
                  >
                    Request a data export
                  </a>
                  .
                </Text>
              </div>
            </Section>
          ) : null}

          {dataToBeDeleted.length > 0 ? (
            <Section style={{ padding: "20px 32px 0 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 8px 0",
                  textTransform: "uppercase",
                }}
              >
                What will be deleted
              </Text>
              <div
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "8px",
                  padding: "6px 16px",
                }}
              >
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{ borderCollapse: "collapse", width: "100%" }}
                >
                  <tbody>
                    {dataToBeDeleted.map((entry, index) => (
                      <tr key={`${entry.label}-${index}`}>
                        <td
                          style={{
                            borderTop:
                              index === 0 ? "none" : `1px solid ${BORDER}`,
                            color: FOREGROUND,
                            fontSize: "14px",
                            fontWeight: 500,
                            lineHeight: "1.6",
                            padding: "10px 12px 10px 0",
                            verticalAlign: "top",
                          }}
                        >
                          {entry.label}
                        </td>
                        <td
                          style={{
                            borderTop:
                              index === 0 ? "none" : `1px solid ${BORDER}`,
                            color: MUTED_FOREGROUND,
                            fontSize: "13px",
                            lineHeight: "1.6",
                            padding: "10px 0",
                            textAlign: "right",
                            verticalAlign: "top",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {nonEmpty(entry.detail) ?? ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          ) : null}

          {subscriptionNote ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
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
                Your plan
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                {subscriptionNote}
              </Text>
            </Section>
          ) : null}

          {metaRows.length > 0 ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
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
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{ borderCollapse: "collapse", width: "100%" }}
              >
                <tbody>
                  {metaRows.map(([label, value, mono]) => (
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
                          fontFamily: mono ? MONOSPACE_STACK : undefined,
                          fontSize: "13px",
                          fontWeight: 500,
                          lineHeight: "1.6",
                          padding: "4px 0",
                          verticalAlign: "top",
                          wordBreak: mono ? "break-all" : undefined,
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

          {retainedDataNote ? (
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
                    color: MUTED_FOREGROUND,
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    margin: "0 0 4px 0",
                    textTransform: "uppercase",
                  }}
                >
                  What we keep
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  {retainedDataNote}
                </Text>
              </div>
            </Section>
          ) : null}

          {privacyPolicyUrl ? (
            <Section style={{ padding: "16px 32px 0 32px" }}>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                <a
                  href={privacyPolicyUrl}
                  style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                >
                  How we handle your data
                </a>
              </Text>
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
              Didn't request this? Someone may have access to{" "}
              {organizationName ? "your workspace" : "your account"}. Use the
              button above to cancel the deletion, then contact us right away at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>
              {requestId ? ` and quote request ID ${requestId}` : ""}.
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
            email because a deletion was requested for your {productName}{" "}
            account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

AccountDeletionScheduledEmail.PreviewProps = {
  recipientName: "Jane Doe",
  cancelDeletionUrl:
    "https://example.com/settings/account/deletion/del_4c91ab7e2f/cancel?token=example-token",
  accountEmail: "jane.doe@example.com",
  organizationName: "Acme Corp",
  requestId: "del_4c91ab7e2f",
  requestedAt: "Nov 21, 2026 14:03 UTC",
  scheduledDeletionAt: "Dec 21, 2026 14:03 UTC",
  gracePeriodDays: 30,
  daysRemaining: 30,
  requestedByName: "Jane Doe (owner)",
  requestedFrom: "Chrome on macOS · Austin, TX",
  dataToBeDeleted: [
    { label: "Schemas", detail: "412 records" },
    { label: "Vault documents", detail: "1,208 records" },
    { label: "API keys", detail: "6 keys revoked" },
    { label: "Team members", detail: "9 memberships" },
    { label: "Audit log", detail: "36,540 rows" },
  ],
  subscriptionNote:
    "Your Team plan is cancelled at the end of the current billing period and will not renew. No further invoices will be issued.",
  retainedDataNote:
    "Invoices and tax records are retained for 7 years as required by law. Everything else is erased permanently.",
  dataExportUrl: "https://example.com/settings/data-exports",
  privacyPolicyUrl: "https://example.com/legal/privacy",
} satisfies AccountDeletionScheduledEmailProps;
