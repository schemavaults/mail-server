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

/** Expected impact of the maintenance window on a single service. */
export interface ScheduledMaintenanceService {
  name: string;
  impact?: string;
}

/**
 * Impact level of the whole maintenance window. Drives the hero palette and
 * the status badge: `none` stays on the brand accent (purely informational),
 * `degraded` uses the warning/amber palette, `downtime` the destructive/red one.
 */
export type ScheduledMaintenanceImpactLevel = "none" | "degraded" | "downtime";

export interface ScheduledMaintenanceEmailProps {
  startsAt: string;
  endsAt: string;
  recipientName?: string;
  maintenanceTitle?: string;
  summary?: string;
  durationLabel?: string;
  impactLevel?: ScheduledMaintenanceImpactLevel;
  impactDescription?: string;
  affectedServices?: ScheduledMaintenanceService[];
  actionRequired?: string;
  statusPageUrl?: string;
  referenceId?: string;
  productName?: string;
  supportEmail?: string;
}

// Neutral palette tokens. Email clients don't resolve CSS custom properties or
// oklch(), so concrete hex values are inlined here; the brand accent colors
// come from the configured brand (see ./brand.ts) inside the component.
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";

// Semantic status palettes, mirroring the @schemavaults/theme --warning and
// --destructive tokens as hex (the theme ships them as oklch/HSL custom
// properties, which email clients cannot resolve).
const AMBER = "#f59e0b";
const AMBER_DARK = "#b45309";
const AMBER_BG = "#fffbeb";
const AMBER_BORDER = "#fde68a";
const AMBER_FOREGROUND = "#78350f";
const RED = "#ef4444";
const RED_DARK = "#b91c1c";
const RED_BG = "#fef2f2";
const RED_BORDER = "#fecaca";
const RED_FOREGROUND = "#7f1d1d";

/**
 * Impact levels, the badge copy they render, and the headline/impact copy used
 * when the caller does not supply its own. Exported so the catalog entry's
 * plain-text renderer defaults the same props to the same values.
 */
export const SCHEDULED_MAINTENANCE_IMPACT_LEVELS: readonly ScheduledMaintenanceImpactLevel[] =
  ["none", "degraded", "downtime"];

export const SCHEDULED_MAINTENANCE_IMPACT_BADGES: Record<
  ScheduledMaintenanceImpactLevel,
  string
> = {
  none: "No expected impact",
  degraded: "Degraded performance expected",
  downtime: "Downtime expected",
};

export const SCHEDULED_MAINTENANCE_IMPACT_HEADLINES: Record<
  ScheduledMaintenanceImpactLevel,
  string
> = {
  none: "Scheduled maintenance is coming up.",
  degraded: "Scheduled maintenance is coming up.",
  downtime: "Planned downtime is scheduled.",
};

export const SCHEDULED_MAINTENANCE_IMPACT_DESCRIPTIONS: Record<
  ScheduledMaintenanceImpactLevel,
  string
> = {
  none: "We do not expect any interruption to service during this window.",
  degraded:
    "You may see slower responses or brief, intermittent errors while the work is in progress.",
  downtime:
    "The affected services will be unavailable for the duration of this window.",
};

export function isScheduledMaintenanceImpactLevel(
  val: unknown,
): val is ScheduledMaintenanceImpactLevel {
  return (
    typeof val === "string" &&
    SCHEDULED_MAINTENANCE_IMPACT_LEVELS.includes(
      val as ScheduledMaintenanceImpactLevel,
    )
  );
}

interface ImpactPalette {
  accent: string;
  accentDark: string;
  calloutBg: string;
  calloutBorder: string;
  calloutForeground: string;
  badge: string;
  headline: string;
  defaultDescription: string;
}

function impactPalette(
  level: ScheduledMaintenanceImpactLevel,
  brandAccent: string,
  brandAccentDark: string,
): ImpactPalette {
  const copy = {
    badge: SCHEDULED_MAINTENANCE_IMPACT_BADGES[level],
    headline: SCHEDULED_MAINTENANCE_IMPACT_HEADLINES[level],
    defaultDescription: SCHEDULED_MAINTENANCE_IMPACT_DESCRIPTIONS[level],
  };
  switch (level) {
    case "none":
      // No impact reads as informational, so it stays on the brand accent
      // rather than borrowing a semantic status palette.
      return {
        ...copy,
        accent: brandAccent,
        accentDark: brandAccentDark,
        calloutBg: PANEL_BG,
        calloutBorder: BORDER,
        calloutForeground: FOREGROUND,
      };
    case "downtime":
      return {
        ...copy,
        accent: RED,
        accentDark: RED_DARK,
        calloutBg: RED_BG,
        calloutBorder: RED_BORDER,
        calloutForeground: RED_FOREGROUND,
      };
    case "degraded":
    default:
      return {
        ...copy,
        accent: AMBER,
        accentDark: AMBER_DARK,
        calloutBg: AMBER_BG,
        calloutBorder: AMBER_BORDER,
        calloutForeground: AMBER_FOREGROUND,
      };
  }
}

export default function ScheduledMaintenanceEmail(
  props: ScheduledMaintenanceEmailProps,
): ReactElement {
  if (
    typeof props.startsAt !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'startsAt' in props for ScheduledMaintenanceEmail template!",
    );
  }
  if (
    typeof props.endsAt !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'endsAt' in props for ScheduledMaintenanceEmail template!",
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
  const impactLevel: ScheduledMaintenanceImpactLevel =
    isScheduledMaintenanceImpactLevel(props.impactLevel)
      ? props.impactLevel
      : "degraded";
  const palette = impactPalette(impactLevel, BRAND_BLUE, BRAND_BLUE_DARK);
  const maintenanceTitle: string =
    typeof props.maintenanceTitle === "string" &&
    props.maintenanceTitle.length > 0
      ? props.maintenanceTitle
      : palette.headline;
  const impactDescription: string =
    typeof props.impactDescription === "string" &&
    props.impactDescription.length > 0
      ? props.impactDescription
      : palette.defaultDescription;
  const summary: string | undefined =
    typeof props.summary === "string" && props.summary.length > 0
      ? props.summary
      : undefined;
  const durationLabel: string | undefined =
    typeof props.durationLabel === "string" && props.durationLabel.length > 0
      ? props.durationLabel
      : undefined;
  const actionRequired: string | undefined =
    typeof props.actionRequired === "string" && props.actionRequired.length > 0
      ? props.actionRequired
      : undefined;
  const statusPageUrl: string | undefined =
    typeof props.statusPageUrl === "string" && props.statusPageUrl.length > 0
      ? props.statusPageUrl
      : undefined;
  const referenceId: string | undefined =
    typeof props.referenceId === "string" && props.referenceId.length > 0
      ? props.referenceId
      : undefined;
  const affectedServices: ScheduledMaintenanceService[] = Array.isArray(
    props.affectedServices,
  )
    ? props.affectedServices
    : [];

  const previewText = `${productName} maintenance window: ${props.startsAt} → ${props.endsAt}.`;

  const windowRows: Array<[string, string]> = [
    ["Starts", props.startsAt],
    ["Ends", props.endsAt],
  ];
  if (durationLabel) {
    windowRows.push(["Duration", durationLabel]);
  }
  if (referenceId) {
    windowRows.push(["Reference", referenceId]);
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
              background: `linear-gradient(135deg, ${palette.accent} 0%, ${palette.accentDark} 100%)`,
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
              {productName} · Scheduled maintenance
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
              {maintenanceTitle}
            </Heading>
            <Text
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.18)",
                borderRadius: "999px",
                color: "#ffffff",
                display: "inline-block",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.02em",
                margin: "16px 0 0 0",
                padding: "6px 12px",
              }}
            >
              {palette.badge}
            </Text>
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
              {summary ??
                `We have scheduled a maintenance window for ${productName}. Here is what is happening and when, so you can plan around it.`}
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 0 32px" }}>
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
                  margin: "0 0 8px 0",
                  textTransform: "uppercase",
                }}
              >
                Maintenance window
              </Text>
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{ borderCollapse: "collapse", width: "100%" }}
              >
                <tbody>
                  {windowRows.map(([label, value]) => (
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
            </div>
          </Section>

          <Section style={{ padding: "16px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: palette.calloutBg,
                border: `1px solid ${palette.calloutBorder}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: palette.calloutForeground,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                Expected impact
              </Text>
              <Text
                style={{
                  color: palette.calloutForeground,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                {impactDescription}
              </Text>
            </div>
          </Section>

          {affectedServices.length > 0 ? (
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
                Affected services
              </Text>
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{ borderCollapse: "collapse", width: "100%" }}
              >
                <tbody>
                  {affectedServices.map((service, index) => (
                    <tr key={`${service.name}-${index}`}>
                      <td
                        style={{
                          borderTop:
                            index === 0 ? "none" : `1px solid ${BORDER}`,
                          color: FOREGROUND,
                          fontSize: "14px",
                          fontWeight: 500,
                          lineHeight: "1.6",
                          padding: "8px 12px 8px 0",
                          verticalAlign: "top",
                        }}
                      >
                        {service.name}
                      </td>
                      <td
                        style={{
                          borderTop:
                            index === 0 ? "none" : `1px solid ${BORDER}`,
                          color: MUTED_FOREGROUND,
                          fontSize: "13px",
                          lineHeight: "1.6",
                          padding: "8px 0",
                          textAlign: "right",
                          verticalAlign: "top",
                        }}
                      >
                        {typeof service.impact === "string" &&
                        service.impact.length > 0
                          ? service.impact
                          : palette.badge}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          ) : null}

          {actionRequired ? (
            <Section style={{ padding: "20px 32px 0 32px" }}>
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
                  Action required
                </Text>
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  {actionRequired}
                </Text>
              </div>
            </Section>
          ) : null}

          {statusPageUrl ? (
            <>
              <Section style={{ padding: "20px 32px 8px 32px" }}>
                <Button
                  href={statusPageUrl}
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
                  Follow live status
                </Button>
              </Section>
              <Section style={{ padding: "8px 32px 24px 32px" }}>
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
                    href={statusPageUrl}
                    style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                  >
                    {statusPageUrl}
                  </a>
                </Text>
              </Section>
            </>
          ) : (
            <Section style={{ padding: "20px 32px 4px 32px" }} />
          )}

          <Hr style={{ borderColor: BORDER, margin: "0 32px" }} />

          <Section style={{ padding: "20px 32px 28px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              No action is needed unless stated above — we will send a
              follow-up once the window closes. Questions about this
              maintenance? Reach us at{" "}
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
            email because your account is affected by this maintenance window.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

ScheduledMaintenanceEmail.PreviewProps = {
  recipientName: "Jane Doe",
  startsAt: "Sat, Apr 25, 2026 02:00 UTC",
  endsAt: "Sat, Apr 25, 2026 03:30 UTC",
  durationLabel: "About 90 minutes",
  impactLevel: "degraded",
  summary:
    "We are upgrading the primary Postgres cluster to expand storage headroom and pick up the latest security patches.",
  impactDescription:
    "Reads stay available throughout. Writes may fail for up to two minutes during the failover near the start of the window.",
  affectedServices: [
    { name: "REST API", impact: "Brief write errors" },
    { name: "Dashboard", impact: "Read-only" },
    { name: "Webhooks", impact: "Delayed delivery" },
  ],
  actionRequired:
    "Retry any write that fails with a 503 during the window — queued jobs will drain automatically afterwards.",
  statusPageUrl: "https://example.com/status/maintenance/2026-04-25",
  referenceId: "MW-2026-04-25-01",
} satisfies ScheduledMaintenanceEmailProps;
