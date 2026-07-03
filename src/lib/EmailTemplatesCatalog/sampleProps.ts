import ApiKeyCreatedEmail from "@/email-templates/api-key-created";
import MagicLinkSignInEmail from "@/email-templates/magic-link-sign-in";
import MailingListConfirmationEmail from "@/email-templates/mailing-list-confirmation";
import TestEmail from "@/email-templates/my-test-email";
import PasswordResetEmail from "@/email-templates/password-reset";
import PaymentFailedEmail from "@/email-templates/payment-failed";
import PaymentMethodExpiringEmail from "@/email-templates/payment-method-expiring";
import PaymentReceiptEmail from "@/email-templates/payment-receipt";
import SecurityAlertEmail from "@/email-templates/security-alert";
import TeamInvitationEmail from "@/email-templates/team-invitation";
import TeamInvitationAcceptedEmail from "@/email-templates/team-invitation-accepted";
import TrialEndingEmail from "@/email-templates/trial-ending";
import VerifyEmail from "@/email-templates/verify-email";
import WelcomeEmail from "@/email-templates/welcome";
import type { EmailTemplateId } from "./EmailTemplatesCatalog";

/**
 * Sample props for every template in the catalog, sourced directly from
 * each template component's static `.PreviewProps` (the same fixture
 * `bun run dev:mail` uses to render react-email previews). Used by the
 * admin preview route to render previews without requiring the caller
 * to supply props, and by the validateProps unit test to assert each
 * template's runtime validator accepts a known-good payload.
 *
 * The `satisfies` clause forces every catalog entry to have a sample —
 * adding a new template id to the catalog without setting `.PreviewProps`
 * on its component (or omitting the entry here) is a type error.
 */
export const sampleEmailTemplateProps = {
  "api-key-created": ApiKeyCreatedEmail.PreviewProps,
  "magic-link-sign-in": MagicLinkSignInEmail.PreviewProps,
  "mailing-list-confirmation": MailingListConfirmationEmail.PreviewProps,
  "my-test-email": TestEmail.PreviewProps,
  "password-reset": PasswordResetEmail.PreviewProps,
  "payment-failed": PaymentFailedEmail.PreviewProps,
  "payment-method-expiring": PaymentMethodExpiringEmail.PreviewProps,
  "payment-receipt": PaymentReceiptEmail.PreviewProps,
  "security-alert": SecurityAlertEmail.PreviewProps,
  "team-invitation": TeamInvitationEmail.PreviewProps,
  "team-invitation-accepted": TeamInvitationAcceptedEmail.PreviewProps,
  "trial-ending": TrialEndingEmail.PreviewProps,
  "verify-email": VerifyEmail.PreviewProps,
  welcome: WelcomeEmail.PreviewProps,
} satisfies Record<EmailTemplateId, Record<string, unknown>>;

export default sampleEmailTemplateProps;
