import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { UnsubscribeConfirmationEmailProps } from "@/email-templates/unsubscribe-confirmation";

export class UnsubscribeConfirmation extends EmailTemplatesCatalogEntry<UnsubscribeConfirmationEmailProps> {
  public id = "unsubscribe-confirmation" as const satisfies string;

  public description =
    "Mailing list unsubscribe confirmation. Sent after a user is removed from a mailing list (POST /api/mailing-lists/unsubscribe) to confirm the change and offer a one-click resubscribe in case it was a mistake. The inverse of the double opt-in confirmation; GDPR / CAN-SPAM friendly. Uses the SchemaVaults brand gradient header, optional 'About this list' callout, a metadata table (mailing list, email, unsubscribe time), and a Resubscribe CTA with a visible fallback link. Props: { mailingListName: string, resubscribeUrl: string, mailingListDescription?: string, unsubscribedEmail?: string, unsubscribedAt?: string, senderOrganization?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(
    val: unknown,
  ): val is UnsubscribeConfirmationEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof UnsubscribeConfirmationEmailProps)[] =
      ["mailingListName", "resubscribeUrl"];
    for (const key of requiredStringKeys) {
      if (!(key in val)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' is missing required prop '${key}' (expected string).`,
        );
      }
      if (typeof (val as Record<string, unknown>)[key] !== "string") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected prop '${key}' to be a string, but got ${typeof (val as Record<string, unknown>)[key]}.`,
        );
      }
    }
    const optionalStringKeys: readonly (keyof UnsubscribeConfirmationEmailProps)[] =
      [
        "mailingListDescription",
        "unsubscribedEmail",
        "unsubscribedAt",
        "senderOrganization",
        "productName",
        "supportEmail",
      ];
    for (const key of optionalStringKeys) {
      if (
        key in val &&
        typeof (val as Record<string, unknown>)[key] !== "undefined" &&
        typeof (val as Record<string, unknown>)[key] !== "string"
      ) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop '${key}' to be a string when provided, but got ${typeof (val as Record<string, unknown>)[key]}.`,
        );
      }
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<
    FC<UnsubscribeConfirmationEmailProps>
  > {
    const component = await import(
      "@/email-templates/unsubscribe-confirmation"
    ).then((mod) => mod.default);
    return component;
  }

  public async renderPlainTextVersion(
    props: UnsubscribeConfirmationEmailProps,
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
    const unsubscribedLine: string =
      typeof props.unsubscribedEmail === "string" &&
      props.unsubscribedEmail.length > 0
        ? props.unsubscribedEmail
        : "this address";

    const lines: string[] = [
      `You've been unsubscribed from ${props.mailingListName} on ${productName}.`,
      "",
      "Hi there,",
      "",
      `We've removed ${unsubscribedLine} from ${props.mailingListName}. You won't receive any more messages to this list from ${senderOrganization}. No further action is needed.`,
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
      typeof props.unsubscribedEmail === "string" &&
      props.unsubscribedEmail.length > 0
    ) {
      lines.push(`Email: ${props.unsubscribedEmail}`);
    }
    if (
      typeof props.unsubscribedAt === "string" &&
      props.unsubscribedAt.length > 0
    ) {
      lines.push(`Unsubscribed: ${props.unsubscribedAt}`);
    }
    lines.push("");
    lines.push(
      "Unsubscribed by mistake, or changed your mind? You can rejoin at any time.",
    );
    lines.push(`Resubscribe: ${props.resubscribeUrl}`);
    lines.push("");
    lines.push(
      "Didn't request this change? Someone may have entered this address by mistake — use the link above to resubscribe, or reach us for help.",
    );
    lines.push(`Questions? Reach us at ${supportEmail}.`);

    return lines.join("\n");
  }
}

export default UnsubscribeConfirmation;
