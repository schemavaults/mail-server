import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import type { MailingListConfirmationEmailProps } from "@/email-templates/mailing-list-confirmation";

export class MailingListConfirmation extends EmailTemplatesCatalogEntry<MailingListConfirmationEmailProps> {
  public id = "mailing-list-confirmation" as const satisfies string;

  public description =
    "Double opt-in mailing list subscription confirmation. Sent after a user requests to join a mailing list (POST /api/mailing-lists/join) so they can verify their address before any list traffic is delivered. GDPR / CAN-SPAM friendly. Uses SchemaVaults brand gradient header, optional 'About this list' callout, a metadata table (mailing list, email, expiration), and a primary CTA to confirm with a visible fallback link. Props: { mailingListName: string, confirmationUrl: string, mailingListDescription?: string, subscriberEmail?: string, expiresAt?: string, senderOrganization?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(
    val: unknown,
  ): val is MailingListConfirmationEmailProps {
    if (typeof val !== "object" || !val) {
      return false;
    }
    if (
      !("mailingListName" in val) ||
      typeof val.mailingListName !== "string"
    ) {
      return false;
    }
    if (
      !("confirmationUrl" in val) ||
      typeof val.confirmationUrl !== "string"
    ) {
      return false;
    }
    if (
      "mailingListDescription" in val &&
      typeof val.mailingListDescription !== "undefined" &&
      typeof val.mailingListDescription !== "string"
    ) {
      return false;
    }
    if (
      "subscriberEmail" in val &&
      typeof val.subscriberEmail !== "undefined" &&
      typeof val.subscriberEmail !== "string"
    ) {
      return false;
    }
    if (
      "expiresAt" in val &&
      typeof val.expiresAt !== "undefined" &&
      typeof val.expiresAt !== "string"
    ) {
      return false;
    }
    if (
      "senderOrganization" in val &&
      typeof val.senderOrganization !== "undefined" &&
      typeof val.senderOrganization !== "string"
    ) {
      return false;
    }
    if (
      "productName" in val &&
      typeof val.productName !== "undefined" &&
      typeof val.productName !== "string"
    ) {
      return false;
    }
    if (
      "supportEmail" in val &&
      typeof val.supportEmail !== "undefined" &&
      typeof val.supportEmail !== "string"
    ) {
      return false;
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<
    FC<MailingListConfirmationEmailProps>
  > {
    const component = await import(
      "@/email-templates/mailing-list-confirmation"
    ).then((mod) => mod.default);
    return component;
  }

  public async renderPlainTextVersion(
    props: MailingListConfirmationEmailProps,
  ): Promise<string> {
    const productName: string =
      typeof props.productName === "string" && props.productName.length > 0
        ? props.productName
        : "SchemaVaults";
    const supportEmail: string =
      typeof props.supportEmail === "string" && props.supportEmail.length > 0
        ? props.supportEmail
        : "support@schemavaults.com";
    const senderOrganization: string =
      typeof props.senderOrganization === "string" &&
      props.senderOrganization.length > 0
        ? props.senderOrganization
        : productName;
    const subscriberLine: string =
      typeof props.subscriberEmail === "string" &&
      props.subscriberEmail.length > 0
        ? props.subscriberEmail
        : "this address";

    const lines: string[] = [
      `Confirm your subscription to ${props.mailingListName} on ${productName}.`,
      "",
      "Hi there,",
      "",
      `Someone — hopefully you — asked to subscribe ${subscriberLine} to ${props.mailingListName} from ${senderOrganization}. Confirm below to start receiving messages. We won't send you anything until you do.`,
      "",
    ];

    if (
      typeof props.mailingListDescription === "string" &&
      props.mailingListDescription.length > 0
    ) {
      lines.push("About this list:");
      lines.push(`  ${props.mailingListDescription}`);
      lines.push("");
    }

    lines.push(`Mailing list: ${props.mailingListName}`);
    if (
      typeof props.subscriberEmail === "string" &&
      props.subscriberEmail.length > 0
    ) {
      lines.push(`Email: ${props.subscriberEmail}`);
    }
    if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
      lines.push(`Link expires: ${props.expiresAt}`);
    }
    lines.push("");
    lines.push(`Confirm subscription: ${props.confirmationUrl}`);
    lines.push("");
    lines.push(
      "Didn't request this? You can safely ignore this email — your address will not be added unless you confirm.",
    );
    lines.push(`Questions? Reach us at ${supportEmail}.`);

    return lines.join("\n");
  }
}

export default MailingListConfirmation;
