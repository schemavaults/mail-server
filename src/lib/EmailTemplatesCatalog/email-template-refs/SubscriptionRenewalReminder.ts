import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import type { SubscriptionRenewalReminderEmailProps } from "@/email-templates/subscription-renewal-reminder";

export class SubscriptionRenewalReminder extends EmailTemplatesCatalogEntry<SubscriptionRenewalReminderEmailProps> {
  public id = "subscription-renewal-reminder" as const satisfies string;

  public description =
    "Upcoming auto-renewal notice sent ahead of a subscription's next billing date (the 'upcoming invoice' email most billing providers expect, and the advance notice auto-renewal disclosure rules ask for). Uses the brand accent gradient header, an optional 'renews in N days' countdown pill, a highlighted amount-due panel tinted with the theme's blue scale, a billing summary table (plan, billing cycle, renewal date, payment method), an optional 'what stays active' list, a manage-subscription CTA, and optional upcoming-invoice and cancel links. Props: { renewalDate: string, renewalAmount: string, manageSubscriptionUrl: string, recipientName?: string, planName?: string, billingInterval?: string, daysUntilRenewal?: number, paymentMethod?: string, invoiceUrl?: string, cancelUrl?: string, includedHighlights?: string[], productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(
    val: unknown,
  ): val is SubscriptionRenewalReminderEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof SubscriptionRenewalReminderEmailProps)[] =
      ["renewalDate", "renewalAmount", "manageSubscriptionUrl"];
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
        "recipientName",
        "planName",
        "billingInterval",
        "paymentMethod",
        "invoiceUrl",
        "cancelUrl",
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
    if (
      "daysUntilRenewal" in val &&
      typeof val.daysUntilRenewal !== "undefined"
    ) {
      if (typeof val.daysUntilRenewal !== "number") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'daysUntilRenewal' to be a number when provided, but got ${typeof val.daysUntilRenewal}.`,
        );
      }
      if (!Number.isFinite(val.daysUntilRenewal)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'daysUntilRenewal' to be a finite number, but got ${val.daysUntilRenewal}.`,
        );
      }
    }
    if (
      "includedHighlights" in val &&
      typeof val.includedHighlights !== "undefined"
    ) {
      if (!Array.isArray(val.includedHighlights)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'includedHighlights' to be an array of strings when provided, but got ${typeof val.includedHighlights}.`,
        );
      }
      for (let i = 0; i < val.includedHighlights.length; i++) {
        if (typeof val.includedHighlights[i] !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected every entry of prop 'includedHighlights' to be a string, but entry at index ${i} is ${typeof val.includedHighlights[i]}.`,
          );
        }
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
    const brand = getEmailBrand();
    const productName: string =
      typeof props.productName === "string" && props.productName.length > 0
        ? props.productName
        : brand.productName;
    const supportEmail: string =
      typeof props.supportEmail === "string" && props.supportEmail.length > 0
        ? props.supportEmail
        : brand.supportEmail;
    const greetingName: string =
      typeof props.recipientName === "string" && props.recipientName.length > 0
        ? props.recipientName
        : "there";
    const planName: string =
      typeof props.planName === "string" && props.planName.length > 0
        ? props.planName
        : "subscription";
    const billingInterval: string | undefined =
      typeof props.billingInterval === "string" &&
      props.billingInterval.length > 0
        ? props.billingInterval
        : undefined;
    const paymentMethod: string | undefined =
      typeof props.paymentMethod === "string" && props.paymentMethod.length > 0
        ? props.paymentMethod
        : undefined;
    const invoiceUrl: string | undefined =
      typeof props.invoiceUrl === "string" && props.invoiceUrl.length > 0
        ? props.invoiceUrl
        : undefined;
    const cancelUrl: string | undefined =
      typeof props.cancelUrl === "string" && props.cancelUrl.length > 0
        ? props.cancelUrl
        : undefined;

    const daysUntilRenewal: number | undefined =
      typeof props.daysUntilRenewal === "number" &&
      Number.isFinite(props.daysUntilRenewal)
        ? Math.max(0, Math.floor(props.daysUntilRenewal))
        : undefined;

    const headingText: string =
      daysUntilRenewal === 0
        ? `Your ${planName} renews today.`
        : daysUntilRenewal === 1
          ? `Your ${planName} renews tomorrow.`
          : daysUntilRenewal === undefined
            ? `Your ${planName} renews on ${props.renewalDate}.`
            : `Your ${planName} renews in ${daysUntilRenewal} days.`;

    const lines: string[] = [
      headingText,
      "",
      `Hi ${greetingName},`,
      "",
      `This is a heads-up that your ${productName} ${planName} renews automatically on ${props.renewalDate}. You don't need to do anything to stay subscribed - we'll charge your saved payment method on that date.`,
      "",
      `Amount due on ${props.renewalDate}: ${props.renewalAmount}`,
      `Plan: ${planName}`,
    ];

    if (billingInterval) {
      lines.push(`Billing cycle: ${billingInterval}`);
    }
    lines.push(`Renews on: ${props.renewalDate}`);
    if (paymentMethod) {
      lines.push(`Payment method: ${paymentMethod}`);
    }
    lines.push("");

    const includedHighlights: string[] = Array.isArray(props.includedHighlights)
      ? props.includedHighlights.filter(
          (item): item is string => typeof item === "string" && item.length > 0,
        )
      : [];

    if (includedHighlights.length > 0) {
      lines.push("What stays active:");
      for (const highlight of includedHighlights) {
        lines.push(`  - ${highlight}`);
      }
      lines.push("");
    }

    lines.push(`Manage your subscription: ${props.manageSubscriptionUrl}`);
    lines.push("");

    if (invoiceUrl) {
      lines.push(`Preview the upcoming invoice: ${invoiceUrl}`);
      lines.push("");
    }

    if (cancelUrl) {
      lines.push(
        `Not planning to continue? You can cancel any time before ${props.renewalDate} and you won't be charged again: ${cancelUrl}`,
      );
      lines.push("");
    }

    lines.push(
      `Questions about your plan, pricing, or an upcoming charge? Reply to this email or reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default SubscriptionRenewalReminder;
