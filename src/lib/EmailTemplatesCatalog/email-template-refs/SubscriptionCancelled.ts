import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { SubscriptionCancelledEmailProps } from "@/email-templates/subscription-cancelled";

export class SubscriptionCancelled extends EmailTemplatesCatalogEntry<SubscriptionCancelledEmailProps> {
  public id = "subscription-cancelled" as const satisfies string;

  public description =
    "Subscription cancellation confirmation email sent after a customer cancels a paid plan. Reassures the customer that no further charges will occur, surfaces the date premium access ends, lists optional refund/reason metadata, and offers a primary CTA to reactivate plus a secondary link to manage billing. Uses the SchemaVaults brand gradient header and an amber 'What happens next' callout. Props: { planName: string, effectiveEndDate: string, reactivateUrl: string, customerName?: string, cancellationDate?: string, amountRefunded?: string, manageBillingUrl?: string, cancellationReason?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(
    val: unknown,
  ): val is SubscriptionCancelledEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof SubscriptionCancelledEmailProps)[] =
      ["planName", "effectiveEndDate", "reactivateUrl"];
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
    const optionalStringKeys: readonly (keyof SubscriptionCancelledEmailProps)[] =
      [
        "customerName",
        "cancellationDate",
        "amountRefunded",
        "manageBillingUrl",
        "cancellationReason",
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
    FC<SubscriptionCancelledEmailProps>
  > {
    const component = await import(
      "@/email-templates/subscription-cancelled"
    ).then((mod) => mod.default);
    return component;
  }

  public async renderPlainTextVersion(
    props: SubscriptionCancelledEmailProps,
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
      typeof props.customerName === "string" && props.customerName.length > 0
        ? props.customerName
        : "there";

    const lines: string[] = [
      `Your ${props.planName} subscription has been cancelled.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We've processed your cancellation request — no further charges will be made. You'll keep full access to your ${props.planName} features until ${props.effectiveEndDate}, after which your account will switch to the free tier.`,
      "",
      "What happens next:",
      `  Your data, vaults, and schemas will be preserved. After ${props.effectiveEndDate}, premium features (private vaults, team seats, higher API limits) become unavailable until you resubscribe. You can reactivate at any time and pick up exactly where you left off.`,
      "",
      `Plan: ${props.planName}`,
    ];

    if (
      typeof props.cancellationDate === "string" &&
      props.cancellationDate.length > 0
    ) {
      lines.push(`Cancelled on: ${props.cancellationDate}`);
    }
    lines.push(`Access ends: ${props.effectiveEndDate}`);
    if (
      typeof props.amountRefunded === "string" &&
      props.amountRefunded.length > 0
    ) {
      lines.push(`Refunded: ${props.amountRefunded}`);
    }
    if (
      typeof props.cancellationReason === "string" &&
      props.cancellationReason.length > 0
    ) {
      lines.push(`Reason: ${props.cancellationReason}`);
    }
    lines.push("");
    lines.push(`Reactivate subscription: ${props.reactivateUrl}`);

    if (
      typeof props.manageBillingUrl === "string" &&
      props.manageBillingUrl.length > 0
    ) {
      lines.push(`Manage billing: ${props.manageBillingUrl}`);
    }
    lines.push("");
    lines.push(`Thanks for trying ${productName} — we're sorry to see you go.`);
    lines.push(
      `If this cancellation wasn't intentional, or if there's anything we could have done better, reply to this email or reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default SubscriptionCancelled;
