import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { SubscriptionCancelledEmailProps } from "@/email-templates/subscription-cancelled";

export class SubscriptionCancelled extends EmailTemplatesCatalogEntry<SubscriptionCancelledEmailProps> {
  public id = "subscription-cancelled" as const satisfies string;

  public description =
    "Subscription cancellation confirmation email. Sent when a customer's paid plan is cancelled — confirms the cancellation, shows the date paid access ends (with a neutral slate-toned summary panel), surfaces any refund issued, and offers a one-click reactivation CTA plus links to manage billing and the final invoice. Includes an optional feedback prompt. Props: { planName: string, cancelledAt: string, accessEndsAt: string, customerName?: string, reactivateUrl?: string, manageBillingUrl?: string, refundAmount?: string, refundReceiptUrl?: string, finalInvoiceUrl?: string, feedbackUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(
    val: unknown,
  ): val is SubscriptionCancelledEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof SubscriptionCancelledEmailProps)[] =
      ["planName", "cancelledAt", "accessEndsAt"];
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
        "reactivateUrl",
        "manageBillingUrl",
        "refundAmount",
        "refundReceiptUrl",
        "finalInvoiceUrl",
        "feedbackUrl",
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
      `Your ${props.planName} subscription on ${productName} has been cancelled.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We've cancelled your ${props.planName} subscription on ${productName}. Your paid features will remain active until ${props.accessEndsAt}. After that date, your account will revert to the free tier — your data and schemas stay safe and accessible.`,
      "",
      "Cancellation summary:",
      `  Plan: ${props.planName}`,
      `  Cancelled on: ${props.cancelledAt}`,
      `  Access ends: ${props.accessEndsAt}`,
    ];

    if (
      typeof props.refundAmount === "string" &&
      props.refundAmount.length > 0
    ) {
      lines.push(`  Refund: ${props.refundAmount}`);
      lines.push("");
      lines.push(
        `A refund of ${props.refundAmount} has been issued to your original payment method. It typically takes 5-10 business days to appear on your statement.`,
      );
      if (
        typeof props.refundReceiptUrl === "string" &&
        props.refundReceiptUrl.length > 0
      ) {
        lines.push(`Refund receipt: ${props.refundReceiptUrl}`);
      }
    }

    lines.push("");

    if (
      typeof props.reactivateUrl === "string" &&
      props.reactivateUrl.length > 0
    ) {
      lines.push(
        `Changed your mind? You can reactivate any time before ${props.accessEndsAt} without losing your settings.`,
      );
      lines.push(`Reactivate ${props.planName}: ${props.reactivateUrl}`);
      lines.push("");
    }

    if (
      typeof props.manageBillingUrl === "string" &&
      props.manageBillingUrl.length > 0
    ) {
      lines.push(`Manage billing & invoices: ${props.manageBillingUrl}`);
    }
    if (
      typeof props.finalInvoiceUrl === "string" &&
      props.finalInvoiceUrl.length > 0
    ) {
      lines.push(`Final invoice: ${props.finalInvoiceUrl}`);
    }

    if (
      typeof props.feedbackUrl === "string" &&
      props.feedbackUrl.length > 0
    ) {
      lines.push("");
      lines.push(
        `We're sorry to see you go. If you have a moment, tell us what we could have done better: ${props.feedbackUrl}`,
      );
    }

    lines.push("");
    lines.push(
      `Didn't request this cancellation? Reach us at ${supportEmail} and we'll look into it right away.`,
    );

    return lines.join("\n");
  }
}

export default SubscriptionCancelled;
