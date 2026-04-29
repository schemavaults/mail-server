import type { IEmailTemplatesCatalogEntry } from "./EmailTemplatesCatalogEntry";
import type EmailTemplatesCatalogEntry from "./EmailTemplatesCatalogEntry";

export const EmailTemplatesCatalog = {
  "magic-link-sign-in": async () =>
    import("./email-template-refs/MagicLinkSignIn").then((m) => m.default),
  "mailing-list-confirmation": async () =>
    import("./email-template-refs/MailingListConfirmation").then(
      (m) => m.default,
    ),
  "my-test-email": async () =>
    import("./email-template-refs/MyTestEmail").then((m) => m.default),
  "password-reset": async () =>
    import("./email-template-refs/PasswordReset").then((m) => m.default),
  "security-alert": async () =>
    import("./email-template-refs/SecurityAlert").then((m) => m.default),
  "team-invitation": async () =>
    import("./email-template-refs/TeamInvitation").then((m) => m.default),
  "team-invitation-accepted": async () =>
    import("./email-template-refs/TeamInvitationAccepted").then(
      (m) => m.default,
    ),
  "trial-ending": async () =>
    import("./email-template-refs/TrialEnding").then((m) => m.default),
  "verify-email": async () =>
    import("./email-template-refs/VerifyEmail").then((m) => m.default),
  welcome: async () =>
    import("./email-template-refs/Welcome").then((m) => m.default),
};

export type EmailTemplateId = keyof typeof EmailTemplatesCatalog;

export type EmailTemplateCatalogEntryType<T extends EmailTemplateId> = Awaited<
  ReturnType<(typeof EmailTemplatesCatalog)[T]>
>;

export type EmailTemplatePropsType<T extends EmailTemplateId> = Parameters<
  InstanceType<EmailTemplateCatalogEntryType<T>>["renderTemplate"]
>[0];

export default EmailTemplatesCatalog;
