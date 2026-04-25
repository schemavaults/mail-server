import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import type { SubscriptionConfirmationEmailProps } from "@/email-templates/subscription-confirmation";

export class SubscriptionConfirmation extends EmailTemplatesCatalogEntry<SubscriptionConfirmationEmailProps> {
  public id = "subscription-confirmation" as const satisfies string;

  public description =
    "Mailing list subscription confirmation (double opt-in) email. Sent when a user requests to subscribe to a mailing list, asking them to click a confirmation link before their address is added to the list. Uses the SchemaVaults brand gradient header, an 'About this list' callout, a metadata table (mailing list, frequency, link expiration), and a primary CTA to confirm the subscription with a visible fallback link. Helps with CAN-SPAM, GDPR, and CASL compliance. Props: { mailingListName: string, confirmUrl: string, subscriberName?: string, mailingListDescription?: string, frequency?: string, expiresAt?: string, productName?: string, supportEmail?: string, unsubscribeUrl?: string }" as const satisfies string;

  public validateProps(
    val: unknown,
  ): val is SubscriptionConfirmationEmailProps {
    if (typeof val !== "object" || !val) {
      return false;
    }
    if (
      !("mailingListName" in val) ||
      typeof val.mailingListName !== "string"
    ) {
      return false;
    }
    if (!("confirmUrl" in val) || typeof val.confirmUrl !== "string") {
      return false;
    }
    if (
      "subscriberName" in val &&
      typeof val.subscriberName !== "undefined" &&
      typeof val.subscriberName !== "string"
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
      "frequency" in val &&
      typeof val.frequency !== "undefined" &&
      typeof val.frequency !== "string"
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
    if (
      "unsubscribeUrl" in val &&
      typeof val.unsubscribeUrl !== "undefined" &&
      typeof val.unsubscribeUrl !== "string"
    ) {
      return false;
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<
    FC<SubscriptionConfirmationEmailProps>
  > {
    const component = await import(
      "@/email-templates/subscription-confirmation"
    ).then((mod) => mod.default);
    return component;
  }

  public async renderPlainTextVersion(
    props: SubscriptionConfirmationEmailProps,
  ): Promise<string> {
    const productName: string =
      typeof props.productName === "string" && props.productName.length > 0
        ? props.productName
        : "SchemaVaults";
    const supportEmail: string =
      typeof props.supportEmail === "string" && props.supportEmail.length > 0
        ? props.supportEmail
        : "support@schemavaults.com";
    const greetingName: string =
      typeof props.subscriberName === "string" &&
      props.subscriberName.length > 0
        ? props.subscriberName
        : "there";

    const lines: string[] = [
      `Confirm your subscription to ${props.mailingListName} on ${productName}.`,
      "",
      `Hi ${greetingName},`,
      "",
      `Thanks for subscribing to ${props.mailingListName} on ${productName}. To finish signing up and start receiving emails, please confirm your subscription using the link below.`,
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
    if (typeof props.frequency === "string" && props.frequency.length > 0) {
      lines.push(`Frequency: ${props.frequency}`);
    }
    if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
      lines.push(`Link expires: ${props.expiresAt}`);
    }
    lines.push("");
    lines.push(`Confirm subscription: ${props.confirmUrl}`);
    lines.push("");
    lines.push(
      `Didn't sign up? You can safely ignore this email — your address will not be added to ${props.mailingListName} unless you click the confirmation link above.`,
    );
    lines.push(`Questions? Reach us at ${supportEmail}.`);

    if (
      typeof props.unsubscribeUrl === "string" &&
      props.unsubscribeUrl.length > 0
    ) {
      lines.push("");
      lines.push(`Changed your mind? Unsubscribe: ${props.unsubscribeUrl}`);
    }

    return lines.join("\n");
  }
}

export default SubscriptionConfirmation;
