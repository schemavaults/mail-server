import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { SubscriptionRenewalReminderEmailProps } from "@/email-templates/subscription-renewal-reminder";

export class SubscriptionRenewalReminder extends EmailTemplatesCatalogEntry<SubscriptionRenewalReminderEmailProps> {
  public id = "subscription-renewal-reminder" as const satisfies string;

  public description =
    "Heads-up email sent N days before an auto-renewing subscription is charged. Uses the SchemaVaults brand gradient header, a 'Subscription summary' callout listing plan, billing interval, renewal date, amount, and (optionally) the payment method, a primary CTA to manage the subscription with a visible fallback link, and a soft secondary link to view the upcoming invoice. Props: { customerName: string, planName: string, renewalDate: string, renewalAmount: string, manageSubscriptionUrl: string, billingInterval?: string, paymentMethodBrand?: string, paymentMethodLast4?: string, nextInvoiceUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(
    val: unknown,
  ): val is SubscriptionRenewalReminderEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof SubscriptionRenewalReminderEmailProps)[] =
      [
        "customerName",
        "planName",
        "renewalDate",
        "renewalAmount",
        "manageSubscriptionUrl",
      ];
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
    const optionalStringKeys: readonly (keyof SubscriptionRenewalReminderEmailProps)[] =
      [
        "billingInterval",
        "paymentMethodBrand",
        "paymentMethodLast4",
        "nextInvoiceUrl",
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
    FC<SubscriptionRenewalReminderEmailProps>
  > {
    const component = await import(
      "@/email-templates/subscription-renewal-reminder"
    ).then((mod) => mod.default);
    return component;
  }

  public async renderPlainTextVersion(
    props: SubscriptionRenewalReminderEmailProps,
  ): Promise<string> {
    const productName: string =
      typeof props.productName === "string" && props.productName.length > 0
        ? props.productName
        : "SchemaVaults";
    const supportEmail: string =
      typeof props.supportEmail === "string" && props.supportEmail.length > 0
        ? props.supportEmail
        : "support@schemavaults.com";
    const billingInterval: string | undefined =
      typeof props.billingInterval === "string" &&
      props.billingInterval.length > 0
        ? props.billingInterval
        : undefined;
    const paymentMethodLast4: string | undefined =
      typeof props.paymentMethodLast4 === "string" &&
      props.paymentMethodLast4.length > 0
        ? props.paymentMethodLast4
        : undefined;
    const paymentMethodBrand: string | undefined =
      typeof props.paymentMethodBrand === "string" &&
      props.paymentMethodBrand.length > 0
        ? props.paymentMethodBrand
        : undefined;
    const nextInvoiceUrl: string | undefined =
      typeof props.nextInvoiceUrl === "string" &&
      props.nextInvoiceUrl.length > 0
        ? props.nextInvoiceUrl
        : undefined;
    const paymentMethodLabel: string | undefined = paymentMethodLast4
      ? paymentMethodBrand
        ? `${paymentMethodBrand} ending in ${paymentMethodLast4}`
        : `Card ending in ${paymentMethodLast4}`
      : undefined;

    const lines: string[] = [
      `Your ${productName} subscription renews on ${props.renewalDate}.`,
      "",
      `Hi ${props.customerName},`,
      "",
      `This is a heads-up that your ${props.planName} plan on ${productName} will renew automatically on ${props.renewalDate} for ${props.renewalAmount}. No action is required if you'd like to keep your subscription active.`,
      "",
      "Subscription summary:",
      `  Plan: ${props.planName}`,
    ];
    if (billingInterval) {
      lines.push(`  Billing: ${billingInterval}`);
    }
    lines.push(`  Renews on: ${props.renewalDate}`);
    lines.push(`  Amount: ${props.renewalAmount}`);
    if (paymentMethodLabel) {
      lines.push(`  Payment method: ${paymentMethodLabel}`);
    }
    lines.push("");
    lines.push(`Manage subscription: ${props.manageSubscriptionUrl}`);
    if (nextInvoiceUrl) {
      lines.push(`View upcoming invoice: ${nextInvoiceUrl}`);
    }
    lines.push("");
    lines.push(
      `Want to change your plan or cancel? Visit billing settings before ${props.renewalDate} and the change will apply to this renewal.`,
    );
    lines.push(`Questions? Reach us at ${supportEmail}.`);

    return lines.join("\n");
  }
}

export default SubscriptionRenewalReminder;
