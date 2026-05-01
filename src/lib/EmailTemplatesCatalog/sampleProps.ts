import type { EmailTemplateId } from "./EmailTemplatesCatalog";

/**
 * Realistic sample props for every template in the catalog. Used by the
 * admin preview route to render template previews without requiring the
 * caller to supply props, and by the validateProps unit test to assert
 * each template's runtime validator accepts a known-good payload.
 *
 * Keep this in lockstep with the catalog: every `EmailTemplateId` MUST
 * have an entry, and every entry MUST satisfy that template's
 * `validateProps`.
 */
export const sampleEmailTemplateProps: Record<
  EmailTemplateId,
  Record<string, unknown>
> = {
  "magic-link-sign-in": {
    magicLinkUrl:
      "https://schemavaults.com/auth/magic-link?token=example-magic-link-token-please-replace-in-production",
    recipientEmail: "jane@acme.co",
    recipientName: "Jane",
    oneTimeCode: "742-918",
    expiresInMinutes: 15,
    device: "MacBook Pro",
    browser: "Chrome 134",
    location: "San Francisco, CA",
    ipAddress: "203.0.113.42",
    requestedAt: "Apr 28, 2026 09:14 UTC",
    productName: "SchemaVaults",
    supportEmail: "support@schemavaults.com",
  },
  "mailing-list-confirmation": {
    mailingListName: "SchemaVaults Product Updates",
    confirmationUrl:
      "https://schemavaults.com/mailing-lists/confirm?token=example-token",
    mailingListDescription:
      "Monthly product updates, new schema releases, and ecosystem highlights from the SchemaVaults team.",
    subscriberEmail: "jane@acme.co",
    expiresAt: "May 4, 2026 17:00 UTC",
    senderOrganization: "SchemaVaults",
    productName: "SchemaVaults",
    supportEmail: "support@schemavaults.com",
  },
  "my-test-email": { name: "Jane Doe" },
  "password-reset": {
    resetLink: "https://example.com/reset?token=sample-token",
    expiresInMinutes: 30,
  },
  "verify-email": {
    url: "https://example.com/verify?token=sample-token",
    welcomeMessage: "Welcome to SchemaVaults!",
  },
  welcome: {
    name: "Jane Doe",
    productName: "SchemaVaults",
    ctaUrl: "https://schemavaults.com/dashboard",
    ctaLabel: "Open your dashboard",
    highlights: [
      "Browse curated schemas in the SchemaVaults library",
      "Vault your own schemas to share with your team",
      "Plug the schemas into your pipeline via the SchemaVaults SDK",
    ],
    supportEmail: "support@schemavaults.com",
  },
  "security-alert": {
    name: "Jane Doe",
    eventType: "new-sign-in",
    device: "MacBook Pro",
    browser: "Chrome 126",
    location: "San Francisco, CA",
    ipAddress: "203.0.113.42",
    eventTime: "Apr 19, 2026 10:30 UTC",
    secureAccountUrl: "https://schemavaults.com/account/security",
    productName: "SchemaVaults",
    supportEmail: "support@schemavaults.com",
  },
  "team-invitation": {
    inviteeName: "Jane Doe",
    inviterName: "Alex Kim",
    inviterEmail: "alex@acme.co",
    teamName: "Acme Platform",
    teamDescription:
      "The data platform team at Acme — we publish and curate schemas for the event pipeline.",
    role: "Editor",
    acceptInviteUrl:
      "https://schemavaults.com/invitations/accept?token=example-token",
    expiresAt: "Apr 27, 2026 17:00 UTC",
    productName: "SchemaVaults",
    supportEmail: "support@schemavaults.com",
  },
  "team-invitation-accepted": {
    inviterName: "Alex Kim",
    accepterName: "Jane Doe",
    accepterEmail: "jane@acme.co",
    teamName: "Acme Platform",
    teamDescription:
      "The data platform team at Acme — we publish and curate schemas for the event pipeline.",
    role: "Editor",
    acceptedAt: "Apr 20, 2026 14:32 UTC",
    teamUrl: "https://schemavaults.com/teams/acme-platform",
    productName: "SchemaVaults",
    supportEmail: "support@schemavaults.com",
  },
  "trial-ending": {
    recipientName: "Jane Doe",
    daysRemaining: 3,
    trialEndsAt: "May 2, 2026 23:59 UTC",
    currentPlan: "Pro trial",
    upgradePlanName: "Pro",
    upgradePlanPrice: "$29 / month",
    upgradeUrl: "https://schemavaults.com/billing/upgrade?plan=pro",
    manageBillingUrl: "https://schemavaults.com/account/billing",
    featuresAtRisk: [
      "Private vaults beyond the free-tier limit",
      "Schema-evolution diff history older than 7 days",
      "Team seats above 3 collaborators",
      "API request quota above 1,000 requests/day",
    ],
    productName: "SchemaVaults",
    supportEmail: "support@schemavaults.com",
  },
};

export default sampleEmailTemplateProps;
