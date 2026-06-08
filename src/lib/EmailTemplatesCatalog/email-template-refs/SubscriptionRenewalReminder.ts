import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { SubscriptionRenewalReminderEmailProps } from "@/email-templates/subscription-renewal-reminder";

export class SubscriptionRenewalReminder extends EmailTemplatesCatalogEntry<SubscriptionRenewalReminderEmailProps> {
  public id = "subscription-renewal-reminder" as const satisfies string;

  public description =
    "Advance-notice email sent before a paid subscription auto-renews. Communicates the upcoming charge amount, renewal date, plan, payment method (brand + last 4), and next billing period so the customer can review, update payment, or cancel before being charged. Uses the SchemaVaults brand-blue gradient header (informational), a countdown badge derived from `daysUntilRenewal`, a metadata panel, a primary 'Manage subscription' CTA, and an optional 'update payment / cancel' callout. Required props: { planName: string, amount: string, renewsAt: string, manageSubscriptionUrl: string }. Optional props: { recipientName?: string, daysUntilRenewal?: number, billingPeriodStart?: string, billingPeriodEnd?: string, paymentMethodBrand?: string, paymentMethodLast4?: string, updatePaymentUrl?: string, cancelUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(
    val: unknown,
  ): val is SubscriptionRenewalReminderEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof SubscriptionRenewalReminderEmailProps)[] =
      ["planName", "amount", "renewsAt", "manageSubscriptionUrl"];
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
        "billingPeriodStart",
        "billingPeriodEnd",
        "paymentMethodBrand",
        "paymentMethodLast4",
        "updatePaymentUrl",
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
      typeof (val as Record<string, unknown>)["daysUntilRenewal"] !==
        "undefined"
    ) {
      const daysUntilRenewal = (val as Record<string, unknown>)[
        "daysUntilRenewal"
      ];
      if (
        typeof daysUntilRenewal !== "number" ||
        !Number.isFinite(daysUntilRenewal)
      ) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'daysUntilRenewal' to be a finite number when provided, but got ${typeof daysUntilRenewal}.`,
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
    const greetingName: string =
      typeof props.recipientName === "string" &&
      props.recipientName.length > 0
        ? props.recipientName
        : "there";
    const paymentMethodBrand: string | undefined =
      typeof props.paymentMethodBrand === "string" &&
      props.paymentMethodBrand.length > 0
        ? props.paymentMethodBrand
        : undefined;
    const paymentMethodLast4: string | undefined =
      typeof props.paymentMethodLast4 === "string" &&
      props.paymentMethodLast4.length > 0
        ? props.paymentMethodLast4
        : undefined;
    const paymentMethodDisplay: string | undefined =
      paymentMethodBrand && paymentMethodLast4
        ? `${paymentMethodBrand} ending in ${paymentMethodLast4}`
        : paymentMethodBrand
          ? paymentMethodBrand
          : paymentMethodLast4
            ? `card ending in ${paymentMethodLast4}`
            : undefined;
    const safeDaysUntilRenewal: number | undefined =
      typeof props.daysUntilRenewal === "number" &&
      Number.isFinite(props.daysUntilRenewal)
        ? Math.max(0, Math.floor(props.daysUntilRenewal))
        : undefined;

    const headline: string =
      typeof safeDaysUntilRenewal === "number"
        ? safeDaysUntilRenewal === 0
          ? `Your ${props.planName} subscription on ${productName} renews today (${props.renewsAt}).`
          : safeDaysUntilRenewal === 1
            ? `Your ${props.planName} subscription on ${productName} renews tomorrow (${props.renewsAt}).`
            : `Your ${props.planName} subscription on ${productName} renews in ${safeDaysUntilRenewal} days (${props.renewsAt}).`
        : `Your ${props.planName} subscription on ${productName} renews on ${props.renewsAt}.`;

    const lines: string[] = [
      headline,
      "",
      `Hi ${greetingName},`,
      "",
      `This is a heads-up that your ${props.planName} subscription will auto-renew on ${props.renewsAt}. We'll charge ${props.amount}${paymentMethodDisplay ? ` to your ${paymentMethodDisplay}` : ""} on that date. No action is needed if you'd like to continue.`,
      "",
      "Renewal details:",
      `  Plan: ${props.planName}`,
      `  Amount: ${props.amount}`,
      `  Renewal date: ${props.renewsAt}`,
    ];

    if (
      typeof props.billingPeriodStart === "string" &&
      props.billingPeriodStart.length > 0 &&
      typeof props.billingPeriodEnd === "string" &&
      props.billingPeriodEnd.length > 0
    ) {
      lines.push(
        `  Next billing period: ${props.billingPeriodStart} – ${props.billingPeriodEnd}`,
      );
    } else if (
      typeof props.billingPeriodEnd === "string" &&
      props.billingPeriodEnd.length > 0
    ) {
      lines.push(`  Through: ${props.billingPeriodEnd}`);
    }
    if (paymentMethodDisplay) {
      lines.push(`  Payment method: ${paymentMethodDisplay}`);
    }

    lines.push("");
    lines.push(`Manage subscription: ${props.manageSubscriptionUrl}`);

    if (
      typeof props.updatePaymentUrl === "string" &&
      props.updatePaymentUrl.length > 0
    ) {
      lines.push(`Update payment method: ${props.updatePaymentUrl}`);
    }
    if (typeof props.cancelUrl === "string" && props.cancelUrl.length > 0) {
      lines.push(`Cancel before renewal: ${props.cancelUrl}`);
    }

    lines.push("");
    lines.push(
      `You're receiving this advance notice so there are no surprise charges. Questions? Reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default SubscriptionRenewalReminder;
