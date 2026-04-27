import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import type { SubscriptionConfirmationEmailProps } from "@/email-templates/subscription-confirmation";

export class SubscriptionConfirmation extends EmailTemplatesCatalogEntry<SubscriptionConfirmationEmailProps> {
  public id = "subscription-confirmation" as const satisfies string;

  public description =
    "Confirmation email sent when a user subscribes to a mailing list (POST /api/mailing-lists/join). Uses the SchemaVaults brand gradient header, an 'About this list' callout, a 'What to expect' bullet list, an optional manage-subscriptions CTA, and a prominent CAN-SPAM/GDPR-compliant one-click unsubscribe link styled with the brand red accent. Props: { email: string, mailingListName: string, unsubscribeUrl: string, mailingListDescription?: string, manageSubscriptionsUrl?: string, expectations?: string[], cadence?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(
    val: unknown,
  ): val is SubscriptionConfirmationEmailProps {
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
    if (!("unsubscribeUrl" in val) || typeof val.unsubscribeUrl !== "string") {
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
      "manageSubscriptionsUrl" in val &&
      typeof val.manageSubscriptionsUrl !== "undefined" &&
      typeof val.manageSubscriptionsUrl !== "string"
    ) {
      return false;
    }
    if ("expectations" in val && typeof val.expectations !== "undefined") {
      if (!Array.isArray(val.expectations)) {
        return false;
      }
      if (!val.expectations.every((e) => typeof e === "string")) {
        return false;
      }
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
    const expectations: readonly string[] =
      Array.isArray(props.expectations) && props.expectations.length > 0
        ? props.expectations
        : [
            "Curated updates from the SchemaVaults team",
            "Release notes and product changelogs",
            "Occasional deep-dives on schema design and data infrastructure",
          ];

    const lines: string[] = [
      `You're subscribed to ${props.mailingListName} on ${productName}.`,
      "",
      `We confirmed your subscription for ${props.email}${
        typeof props.cadence === "string" && props.cadence.length > 0
          ? ` — expect emails roughly ${props.cadence}`
          : ""
      }.`,
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

    lines.push("What to expect:");
    for (const e of expectations) {
      lines.push(`  - ${e}`);
    }
    lines.push("");

    if (
      typeof props.manageSubscriptionsUrl === "string" &&
      props.manageSubscriptionsUrl.length > 0
    ) {
      lines.push(`Manage your subscriptions: ${props.manageSubscriptionsUrl}`);
      lines.push("");
    }

    lines.push(
      "Didn't sign up, or changed your mind? You can unsubscribe at any time:",
    );
    lines.push(`  ${props.unsubscribeUrl}`);
    lines.push("");
    lines.push(`Questions? Reach us at ${supportEmail}.`);

    return lines.join("\n");
  }
}

export default SubscriptionConfirmation;
