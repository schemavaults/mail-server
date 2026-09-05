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

/**
 * The four subscription lifecycle transitions this template covers. Each one
 * selects its own semantic accent palette, eyebrow, headline, and body copy.
 */
export const SUBSCRIPTION_CHANGE_KINDS = [
  "upgrade",
  "downgrade",
  "cancellation",
  "reactivation",
] as const;

export type SubscriptionChangeKind = (typeof SUBSCRIPTION_CHANGE_KINDS)[number];

export interface SubscriptionChangedEmailProps {
  changeKind: SubscriptionChangeKind;
  previousPlanName: string;
  newPlanName: string;
  effectiveDate: string;
  customerName?: string;
  previousPlanPrice?: string;
  newPlanPrice?: string;
  nextBillingDate?: string;
  nextChargeAmount?: string;
  accessEndsAt?: string;
  prorationNote?: string;
  planHighlights?: string[];
  manageSubscriptionUrl?: string;
  productName?: string;
  supportEmail?: string;
}

// Neutral palette and semantic status colors for this template. Email clients
// don't resolve CSS custom properties or oklch(), so the values are inlined as
// hex; the brand accent (used for the "reactivation" variant and every link)
// comes from the configured brand inside the component.
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";

// Upgrade → emerald (matches the payment-receipt success palette).
const EMERALD = "#10b981";
const EMERALD_DARK = "#047857";
const EMERALD_BG = "#ecfdf5";
const EMERALD_BORDER = "#a7f3d0";
const EMERALD_FOREGROUND = "#064e3b";

// Downgrade → amber (matches the trial-ending / usage-limit-warning palette).
const AMBER = "#f59e0b";
const AMBER_DARK = "#b45309";
const AMBER_BG = "#fffbeb";
const AMBER_BORDER = "#fde68a";
const AMBER_FOREGROUND = "#78350f";

// Cancellation → red (matches the security-alert / payment-failed palette).
const RED = "#ef4444";
const RED_DARK = "#b91c1c";
const RED_BG = "#fef2f2";
const RED_BORDER = "#fecaca";
const RED_FOREGROUND = "#7f1d1d";

interface ChangeKindTheme {
  accent: string;
  accentDark: string;
  panelBg: string;
  panelBorder: string;
  panelForeground: string;
  eyebrow: string;
  highlightsLabel: string;
  ctaLabel: string;
}

export default function SubscriptionChangedEmail(
  props: SubscriptionChangedEmailProps,
): ReactElement {
  if (
    typeof props.changeKind !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'changeKind' in props for SubscriptionChangedEmail template!",
    );
  }
  if (
    typeof props.previousPlanName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'previousPlanName' in props for SubscriptionChangedEmail template!",
    );
  }
  if (
    typeof props.newPlanName !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'newPlanName' in props for SubscriptionChangedEmail template!",
    );
  }
  if (
    typeof props.effectiveDate !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'effectiveDate' in props for SubscriptionChangedEmail template!",
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
    typeof props.customerName === "string" && props.customerName.length > 0
      ? props.customerName
      : "there";
  const manageSubscriptionUrl: string =
    typeof props.manageSubscriptionUrl === "string" &&
    props.manageSubscriptionUrl.length > 0
      ? props.manageSubscriptionUrl
      : brand.url;

  // Unknown/absent kinds fall back to the neutral "downgrade"-style treatment
  // rather than throwing, so a preview with partial data still renders.
  const changeKind: SubscriptionChangeKind = SUBSCRIPTION_CHANGE_KINDS.includes(
    props.changeKind,
  )
    ? props.changeKind
    : "downgrade";

  const themes: Record<SubscriptionChangeKind, ChangeKindTheme> = {
    upgrade: {
      accent: EMERALD,
      accentDark: EMERALD_DARK,
      panelBg: EMERALD_BG,
      panelBorder: EMERALD_BORDER,
      panelForeground: EMERALD_FOREGROUND,
      eyebrow: "Plan upgraded",
      highlightsLabel: "What you just unlocked",
      ctaLabel: "Manage subscription",
    },
    downgrade: {
      accent: AMBER,
      accentDark: AMBER_DARK,
      panelBg: AMBER_BG,
      panelBorder: AMBER_BORDER,
      panelForeground: AMBER_FOREGROUND,
      eyebrow: "Plan changed",
      highlightsLabel: "What changes on your account",
      ctaLabel: "Manage subscription",
    },
    cancellation: {
      accent: RED,
      accentDark: RED_DARK,
      panelBg: RED_BG,
      panelBorder: RED_BORDER,
      panelForeground: RED_FOREGROUND,
      eyebrow: "Subscription cancelled",
      highlightsLabel: "What you'll lose access to",
      ctaLabel: "Reactivate subscription",
    },
    reactivation: {
      // Reactivation is a "welcome back" moment, so it keeps the configured
      // brand gradient and stays fully white-labellable.
      accent: BRAND_BLUE,
      accentDark: BRAND_BLUE_DARK,
      panelBg: PANEL_BG,
      panelBorder: BORDER,
      panelForeground: FOREGROUND,
      eyebrow: "Subscription reactivated",
      highlightsLabel: "What's included again",
      ctaLabel: "Manage subscription",
    },
  };
  const theme: ChangeKindTheme = themes[changeKind];

  const headlines: Record<SubscriptionChangeKind, string> = {
    upgrade: `You're now on the ${props.newPlanName} plan.`,
    downgrade: `Your plan changes to ${props.newPlanName}.`,
    cancellation: `Your ${props.previousPlanName} subscription has been cancelled.`,
    reactivation: `Welcome back to ${props.newPlanName}.`,
  };
  const intros: Record<SubscriptionChangeKind, ReactElement> = {
    upgrade: (
      <>
        Your {productName} subscription was upgraded from{" "}
        <strong>{props.previousPlanName}</strong> to{" "}
        <strong>{props.newPlanName}</strong>. The new limits and features are
        already active on your account.
      </>
    ),
    downgrade: (
      <>
        Your {productName} subscription is moving from{" "}
        <strong>{props.previousPlanName}</strong> down to{" "}
        <strong>{props.newPlanName}</strong>. Nothing changes until the switch
        takes effect, so you keep your current plan until then.
      </>
    ),
    cancellation: (
      <>
        We've cancelled your <strong>{props.previousPlanName}</strong>{" "}
        subscription on {productName}. You won't be billed again, and you can
        reactivate at any time without losing your account.
      </>
    ),
    reactivation: (
      <>
        Your {productName} subscription is active again on the{" "}
        <strong>{props.newPlanName}</strong> plan. Everything picks up right
        where you left off.
      </>
    ),
  };
  const previewTexts: Record<SubscriptionChangeKind, string> = {
    upgrade: `Your ${productName} plan is now ${props.newPlanName}, effective ${props.effectiveDate}.`,
    downgrade: `Your ${productName} plan changes to ${props.newPlanName} on ${props.effectiveDate}.`,
    cancellation: `Your ${productName} ${props.previousPlanName} subscription was cancelled on ${props.effectiveDate}.`,
    reactivation: `Your ${productName} ${props.newPlanName} subscription is active again as of ${props.effectiveDate}.`,
  };

  const previousPlanPrice: string | undefined =
    typeof props.previousPlanPrice === "string" &&
    props.previousPlanPrice.length > 0
      ? props.previousPlanPrice
      : undefined;
  const newPlanPrice: string | undefined =
    typeof props.newPlanPrice === "string" && props.newPlanPrice.length > 0
      ? props.newPlanPrice
      : undefined;
  const prorationNote: string | undefined =
    typeof props.prorationNote === "string" && props.prorationNote.length > 0
      ? props.prorationNote
      : undefined;
  const planHighlights: string[] = Array.isArray(props.planHighlights)
    ? props.planHighlights.filter(
        (highlight): highlight is string =>
          typeof highlight === "string" && highlight.length > 0,
      )
    : [];

  const effectiveLabel: string =
    changeKind === "cancellation" ? "Cancelled on" : "Effective";
  const metaRows: Array<[string, string]> = [
    [effectiveLabel, props.effectiveDate],
  ];
  if (
    typeof props.accessEndsAt === "string" &&
    props.accessEndsAt.length > 0
  ) {
    metaRows.push(["Access ends", props.accessEndsAt]);
  }
  if (
    typeof props.nextBillingDate === "string" &&
    props.nextBillingDate.length > 0
  ) {
    metaRows.push(["Next billing date", props.nextBillingDate]);
  }
  if (
    typeof props.nextChargeAmount === "string" &&
    props.nextChargeAmount.length > 0
  ) {
    metaRows.push(["Next charge", props.nextChargeAmount]);
  }

  return (
    <Html>
      <Head />
      <Preview>{previewTexts[changeKind]}</Preview>
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
              background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentDark} 100%)`,
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
              {productName} · {theme.eyebrow}
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
              {headlines[changeKind]}
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
              {intros[changeKind]}
            </Text>
          </Section>

          {/* Plan transition card: previous plan → new plan, side by side. */}
          <Section style={{ padding: "20px 32px 0 32px" }}>
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              style={{
                backgroundColor: PANEL_BG,
                border: `1px solid ${BORDER}`,
                borderCollapse: "separate",
                borderRadius: "10px",
                width: "100%",
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: "16px 12px 16px 18px",
                      verticalAlign: "middle",
                      width: "42%",
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
                      Previous plan
                    </Text>
                    <Text
                      style={{
                        color: MUTED_FOREGROUND,
                        fontSize: "16px",
                        fontWeight: 600,
                        lineHeight: "1.3",
                        margin: 0,
                      }}
                    >
                      {props.previousPlanName}
                    </Text>
                    {previousPlanPrice ? (
                      <Text
                        style={{
                          color: MUTED_FOREGROUND,
                          fontSize: "13px",
                          lineHeight: "1.4",
                          margin: "2px 0 0 0",
                        }}
                      >
                        {previousPlanPrice}
                      </Text>
                    ) : null}
                  </td>
                  <td
                    style={{
                      color: theme.accentDark,
                      fontSize: "20px",
                      fontWeight: 700,
                      padding: "16px 0",
                      textAlign: "center",
                      verticalAlign: "middle",
                      width: "16%",
                    }}
                  >
                    &rarr;
                  </td>
                  <td
                    style={{
                      padding: "16px 18px 16px 12px",
                      verticalAlign: "middle",
                      width: "42%",
                    }}
                  >
                    <Text
                      style={{
                        color: theme.accentDark,
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        margin: "0 0 4px 0",
                        textTransform: "uppercase",
                      }}
                    >
                      {changeKind === "cancellation"
                        ? "After cancellation"
                        : "New plan"}
                    </Text>
                    <Text
                      style={{
                        color: FOREGROUND,
                        fontSize: "16px",
                        fontWeight: 700,
                        lineHeight: "1.3",
                        margin: 0,
                      }}
                    >
                      {props.newPlanName}
                    </Text>
                    {newPlanPrice ? (
                      <Text
                        style={{
                          color: FOREGROUND,
                          fontSize: "13px",
                          lineHeight: "1.4",
                          margin: "2px 0 0 0",
                        }}
                      >
                        {newPlanPrice}
                      </Text>
                    ) : null}
                  </td>
                </tr>
              </tbody>
            </table>
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

          {prorationNote ? (
            <Section style={{ padding: "12px 32px 0 32px" }}>
              <div
                style={{
                  backgroundColor: theme.panelBg,
                  border: `1px solid ${theme.panelBorder}`,
                  borderLeft: `4px solid ${theme.accentDark}`,
                  borderRadius: "8px",
                  padding: "14px 16px",
                }}
              >
                <Text
                  style={{
                    color: theme.panelForeground,
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    margin: "0 0 4px 0",
                    textTransform: "uppercase",
                  }}
                >
                  Billing note
                </Text>
                <Text
                  style={{
                    color: theme.panelForeground,
                    fontSize: "14px",
                    lineHeight: "1.55",
                    margin: 0,
                  }}
                >
                  {prorationNote}
                </Text>
              </div>
            </Section>
          ) : null}

          {planHighlights.length > 0 ? (
            <Section style={{ padding: "20px 32px 0 32px" }}>
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
                {theme.highlightsLabel}
              </Text>
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{ borderCollapse: "collapse", width: "100%" }}
              >
                <tbody>
                  {planHighlights.map((highlight) => (
                    <tr key={highlight}>
                      <td
                        style={{
                          color: theme.accentDark,
                          fontSize: "14px",
                          fontWeight: 700,
                          lineHeight: "1.55",
                          padding: "3px 10px 3px 0",
                          verticalAlign: "top",
                          width: "16px",
                        }}
                      >
                        {changeKind === "cancellation" ||
                        changeKind === "downgrade"
                          ? "−"
                          : "✓"}
                      </td>
                      <td
                        style={{
                          color: FOREGROUND,
                          fontSize: "14px",
                          lineHeight: "1.55",
                          padding: "3px 0",
                          verticalAlign: "top",
                        }}
                      >
                        {highlight}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          ) : null}

          <Section style={{ padding: "22px 32px 8px 32px" }}>
            <Button
              href={manageSubscriptionUrl}
              style={{
                backgroundColor: theme.accentDark,
                borderRadius: "8px",
                color: "#ffffff",
                display: "inline-block",
                fontSize: "15px",
                fontWeight: 600,
                padding: "12px 22px",
                textDecoration: "none",
              }}
            >
              {theme.ctaLabel}
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
                href={manageSubscriptionUrl}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {manageSubscriptionUrl}
              </a>
            </Text>
          </Section>

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
              Didn't make this change? Contact us right away at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>{" "}
              and we'll sort it out.
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
            email because your subscription changed.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

SubscriptionChangedEmail.PreviewProps = {
  changeKind: "upgrade",
  customerName: "Jane",
  previousPlanName: "Starter",
  newPlanName: "Team",
  previousPlanPrice: "$19.00 / month",
  newPlanPrice: "$99.00 / month",
  effectiveDate: "May 2, 2026",
  nextBillingDate: "Jun 2, 2026",
  nextChargeAmount: "$99.00",
  prorationNote:
    "You were charged a prorated $63.34 today for the remainder of the current billing period. Your next full charge is $99.00.",
  planHighlights: [
    "Up to 25 seats on your workspace",
    "500,000 schema validations per month",
    "Priority support with a 4-hour response target",
    "Audit log export and SSO",
  ],
  manageSubscriptionUrl: "https://example.com/account/billing",
} satisfies SubscriptionChangedEmailProps;
