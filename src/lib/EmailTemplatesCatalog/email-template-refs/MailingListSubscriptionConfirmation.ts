import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import type { MailingListSubscriptionConfirmationEmailProps } from "@/email-templates/mailing-list-subscription-confirmation";

export class MailingListSubscriptionConfirmation extends EmailTemplatesCatalogEntry<MailingListSubscriptionConfirmationEmailProps> {
  public id = "mailing-list-subscription-confirmation" as const satisfies string;

  public description =
    "Double opt-in confirmation email sent to a new subscriber to verify they asked to join a mailing list. Uses the SchemaVaults brand gradient header, an 'About this list' callout, a metadata table (list, address, cadence, link expiration), a primary 'Confirm subscription' CTA with a visible fallback link, and an optional unsubscribe escape hatch for people who didn't actually sign up. Props: { email: string, mailingListName: string, confirmUrl: string, mailingListDescription?: string, expiresAt?: string, cadence?: string, productName?: string, supportEmail?: string, unsubscribeUrl?: string }" as const satisfies string;

  public validateProps(
    val: unknown,
  ): val is MailingListSubscriptionConfirmationEmailProps {
    if (typeof val !== "object" || !val) {
      return false;
    }
    if (!("email" in val) || typeof val.email !== "string") {
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
      "mailingListDescription" in val &&
      typeof val.mailingListDescription !== "undefined" &&
      typeof val.mailingListDescription !== "string"
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
      "cadence" in val &&
      typeof val.cadence !== "undefined" &&
      typeof val.cadence !== "string"
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
    FC<MailingListSubscriptionConfirmationEmailProps>
  > {
    const component = await import(
      "@/email-templates/mailing-list-subscription-confirmation"
    ).then((mod) => mod.default);
    return component;
  }

  public async renderPlainTextVersion(
    props: MailingListSubscriptionConfirmationEmailProps,
  ): Promise<string> {
    const productName: string =
      typeof props.productName === "string" && props.productName.length > 0
        ? props.productName
        : "SchemaVaults";
    const supportEmail: string =
      typeof props.supportEmail === "string" && props.supportEmail.length > 0
        ? props.supportEmail
        : "support@schemavaults.com";

    const lines: string[] = [
      `Confirm your subscription to ${props.mailingListName}.`,
      "",
      "Hi there,",
      "",
      `Someone — hopefully you — asked to subscribe ${props.email} to the ${props.mailingListName} mailing list on ${productName}. Confirm below and you're on the list.`,
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

    lines.push(`List: ${props.mailingListName}`);
    lines.push(`Address: ${props.email}`);
    if (typeof props.cadence === "string" && props.cadence.length > 0) {
      lines.push(`Cadence: ${props.cadence}`);
    }
    if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
      lines.push(`Link expires: ${props.expiresAt}`);
    }
    lines.push("");
    lines.push(`Confirm subscription: ${props.confirmUrl}`);
    lines.push("");

    let didntSubscribeLine =
      "Didn't subscribe? You can safely ignore this email — we won't add you to the list unless you click the confirmation link above.";
    if (
      typeof props.unsubscribeUrl === "string" &&
      props.unsubscribeUrl.length > 0
    ) {
      didntSubscribeLine += ` To make sure you're off the list for good, use: ${props.unsubscribeUrl}`;
    }
    lines.push(didntSubscribeLine);
    lines.push(`Questions? Reach us at ${supportEmail}.`);
    lines.push("");
    lines.push(
      "We'll never share your address. You can unsubscribe any time.",
    );

    return lines.join("\n");
  }
}

export default MailingListSubscriptionConfirmation;
