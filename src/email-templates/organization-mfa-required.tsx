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

export interface OrganizationMfaRequiredEmailProps {
  organizationName: string;
  /** ISO 8601 timestamp at which the grace period ends (the member is removed after it). */
  gracePeriodEndsAt: string;
  /** Where the recipient enables multi-factor authentication. */
  enableMfaUrl: string;
  /** Why the email is sent. Defaults to `"requirement_enabled"`. */
  reason?: "requirement_enabled" | "mfa_removed";
  recipientName?: string;
  organizationUrl?: string;
  productName?: string;
  supportEmail?: string;
}

/**
 * Why the recipient must (re-)enable MFA: the organization just turned on its
 * MFA requirement, or MFA was removed from the account of a member of an
 * organization that requires it.
 */
export type OrganizationMfaRequiredReason = NonNullable<
  OrganizationMfaRequiredEmailProps["reason"]
>;

export const ORGANIZATION_MFA_REQUIRED_REASONS: readonly OrganizationMfaRequiredReason[] =
  ["requirement_enabled", "mfa_removed"];

export const DEFAULT_ORGANIZATION_MFA_REQUIRED_REASON: OrganizationMfaRequiredReason =
  "requirement_enabled";

export function isOrganizationMfaRequiredReason(
  val: unknown,
): val is OrganizationMfaRequiredReason {
  return (
    typeof val === "string" &&
    ORGANIZATION_MFA_REQUIRED_REASONS.includes(
      val as OrganizationMfaRequiredReason,
    )
  );
}

const DEADLINE_PARTS_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/**
 * Formats the grace period deadline in UTC, e.g.
 * "Friday, November 13, 2026 at 5:00 PM UTC". The string is assembled from
 * the formatter's parts rather than taken from `format()`, because the
 * separators `format()` inserts (", " vs. " at ", a regular vs. a narrow
 * no-break space before "PM") vary between ICU versions, and the HTML and
 * plain-text versions must read the same on every runtime. A value that does
 * not parse as a date is returned unchanged.
 */
export function formatOrganizationMfaDeadline(
  gracePeriodEndsAt: string,
): string {
  const timestamp = Date.parse(gracePeriodEndsAt);
  if (Number.isNaN(timestamp)) {
    return gracePeriodEndsAt;
  }
  const parts: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {};
  for (const part of DEADLINE_PARTS_FORMAT.formatToParts(timestamp)) {
    parts[part.type] = part.value;
  }
  return `${parts.weekday}, ${parts.month} ${parts.day}, ${parts.year} at ${parts.hour}:${parts.minute} ${parts.dayPeriod} UTC`;
}

export interface OrganizationMfaRequiredCopy {
  heading: string;
  lede: string;
}

/**
 * Reason-specific heading and lede. Exported so the catalog entry's
 * plain-text renderer uses exactly the same copy as the HTML version.
 */
export function getOrganizationMfaRequiredCopy(
  reason: OrganizationMfaRequiredReason,
  organizationName: string,
  productName: string,
): OrganizationMfaRequiredCopy {
  switch (reason) {
    case "mfa_removed":
      return {
        heading: `Multi-factor authentication is required to stay in ${organizationName}.`,
        lede: `Multi-factor authentication (MFA) was removed from your ${productName} account, but ${organizationName} requires it of every member.`,
      };
    case "requirement_enabled":
    default:
      return {
        heading: `${organizationName} now requires multi-factor authentication.`,
        lede: `${organizationName} now requires every member to protect their ${productName} account with multi-factor authentication (MFA). Your account doesn't have MFA set up yet.`,
      };
  }
}

/**
 * What happens if MFA is not enabled in time. Follows the "enable MFA before
 * the deadline to keep your membership" sentence in both versions.
 */
export function organizationMfaRemovalNotice(organizationName: string): string {
  return `Otherwise, you will be removed from ${organizationName} automatically and will need a new invitation to rejoin.`;
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

// Semantic warning palette for the deadline callout, mirroring the
// @schemavaults/theme --warning token as hex (the theme ships it as an oklch
// custom property, which email clients cannot resolve).
const AMBER_DARK = "#b45309";
const AMBER_BG = "#fffbeb";
const AMBER_BORDER = "#fde68a";
const AMBER_FOREGROUND = "#78350f";

export default function OrganizationMfaRequiredEmail(
  props: OrganizationMfaRequiredEmailProps,
): ReactElement {
  if (
    typeof props.organizationName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'organizationName' in props for OrganizationMfaRequiredEmail template!",
    );
  }
  if (
    typeof props.gracePeriodEndsAt !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'gracePeriodEndsAt' in props for OrganizationMfaRequiredEmail template!",
    );
  }
  if (
    typeof props.enableMfaUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'enableMfaUrl' in props for OrganizationMfaRequiredEmail template!",
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
  const reason: OrganizationMfaRequiredReason = isOrganizationMfaRequiredReason(
    props.reason,
  )
    ? props.reason
    : DEFAULT_ORGANIZATION_MFA_REQUIRED_REASON;
  const organizationUrl: string | undefined =
    typeof props.organizationUrl === "string" &&
    props.organizationUrl.length > 0
      ? props.organizationUrl
      : undefined;

  const deadline = formatOrganizationMfaDeadline(props.gracePeriodEndsAt);
  const copy = getOrganizationMfaRequiredCopy(
    reason,
    props.organizationName,
    productName,
  );

  const previewText = `Enable multi-factor authentication before ${deadline} to stay in ${props.organizationName}.`;

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
              {productName} · Organization security
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
              {copy.heading}
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
              {copy.lede}
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px 0 32px" }}>
            <div
              style={{
                backgroundColor: AMBER_BG,
                border: `1px solid ${AMBER_BORDER}`,
                borderLeft: `4px solid ${AMBER_DARK}`,
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <Text
                style={{
                  color: AMBER_FOREGROUND,
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  margin: "0 0 4px 0",
                  textTransform: "uppercase",
                }}
              >
                Enable MFA before
              </Text>
              <Text
                style={{
                  color: AMBER_FOREGROUND,
                  fontSize: "16px",
                  fontWeight: 700,
                  lineHeight: "1.4",
                  margin: "0 0 8px 0",
                }}
              >
                {deadline}
              </Text>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "14px",
                  lineHeight: "1.55",
                  margin: 0,
                }}
              >
                Enable multi-factor authentication before then to keep your
                membership in <strong>{props.organizationName}</strong>.{" "}
                {organizationMfaRemovalNotice(props.organizationName)}
              </Text>
            </div>
          </Section>

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={props.enableMfaUrl}
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
              Enable multi-factor authentication
            </Button>
          </Section>

          <Section
            style={{
              padding: organizationUrl
                ? "8px 32px 8px 32px"
                : "8px 32px 24px 32px",
            }}
          >
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
                href={props.enableMfaUrl}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {props.enableMfaUrl}
              </a>
            </Text>
          </Section>

          {organizationUrl ? (
            <Section style={{ padding: "12px 32px 24px 32px" }}>
              <div
                style={{
                  backgroundColor: PANEL_BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "8px",
                  padding: "12px 16px",
                }}
              >
                <Text
                  style={{
                    color: FOREGROUND,
                    fontSize: "13px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  You can review your membership on the{" "}
                  <a
                    href={organizationUrl}
                    style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
                  >
                    {props.organizationName} organization page
                  </a>
                  .
                </Text>
              </div>
            </Section>
          ) : null}

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
              If you have questions about this requirement, contact{" "}
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
            email because you are a member of {props.organizationName}, which
            requires multi-factor authentication.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

OrganizationMfaRequiredEmail.PreviewProps = {
  organizationName: "Acme Platform",
  gracePeriodEndsAt: "2026-11-13T17:00:00.000Z",
  enableMfaUrl: "https://example.com/mfa",
  reason: "requirement_enabled",
  recipientName: "Jane Doe",
  organizationUrl: "https://example.com/orgs/acme-platform",
} satisfies OrganizationMfaRequiredEmailProps;
