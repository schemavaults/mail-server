import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import type { PaymentFailedEmailProps } from "@/email-templates/payment-failed";

export class PaymentFailed extends EmailTemplatesCatalogEntry<PaymentFailedEmailProps> {
  public id = "payment-failed" as const satisfies string;

  public description =
    "Payment failure / dunning email sent when a recurring or one-off charge against the customer's saved payment method is declined. Uses a red alert gradient header, a 'Reason' callout panel showing the decline reason, a metadata table (amount, attempted at, plan, payment method, invoice, decline code), an optional 'What happens next' panel with retry and grace-period dates, and a primary CTA to update the payment method. Props: { amountDue: string, attemptedAt: string, updatePaymentMethodUrl: string, recipientName?: string, planName?: string, paymentMethodBrand?: string, paymentMethodLast4?: string, failureReason?: string, failureCode?: string, nextRetryAt?: string, gracePeriodEndsAt?: string, invoiceNumber?: string, invoiceUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is PaymentFailedEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof PaymentFailedEmailProps)[] = [
      "amountDue",
      "attemptedAt",
      "updatePaymentMethodUrl",
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
    const optionalStringKeys: readonly (keyof PaymentFailedEmailProps)[] = [
      "recipientName",
      "planName",
      "paymentMethodBrand",
      "paymentMethodLast4",
      "failureReason",
      "failureCode",
      "nextRetryAt",
      "gracePeriodEndsAt",
      "invoiceNumber",
      "invoiceUrl",
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
    FC<PaymentFailedEmailProps>
  > {
    const component = await import("@/email-templates/payment-failed").then(
      (mod) => mod.default,
    );
    return component;
  }

  public async renderPlainTextVersion(
    props: PaymentFailedEmailProps,
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
      typeof props.recipientName === "string" &&
      props.recipientName.length > 0
        ? props.recipientName
        : "there";
    const failureReason: string =
      typeof props.failureReason === "string" &&
      props.failureReason.length > 0
        ? props.failureReason
        : "Your card issuer declined the charge.";

    const lines: string[] = [
      `Action required: we couldn't process your ${productName} payment.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We tried to charge your payment method for your ${productName} subscription, but the charge didn't go through. Your account is still active — please update your billing details so we can complete the payment and avoid any interruption to your service.`,
      "",
      "Reason:",
      `  ${failureReason}`,
      "",
      `Amount due: ${props.amountDue}`,
      `Attempted: ${props.attemptedAt}`,
    ];

    if (typeof props.planName === "string" && props.planName.length > 0) {
      lines.push(`Plan: ${props.planName}`);
    }
    if (
      typeof props.paymentMethodBrand === "string" &&
      props.paymentMethodBrand.length > 0 &&
      typeof props.paymentMethodLast4 === "string" &&
      props.paymentMethodLast4.length > 0
    ) {
      lines.push(
        `Payment method: ${props.paymentMethodBrand} ending in ${props.paymentMethodLast4}`,
      );
    }
    if (
      typeof props.invoiceNumber === "string" &&
      props.invoiceNumber.length > 0
    ) {
      lines.push(`Invoice: ${props.invoiceNumber}`);
    }
    if (
      typeof props.failureCode === "string" &&
      props.failureCode.length > 0
    ) {
      lines.push(`Decline code: ${props.failureCode}`);
    }

    if (
      (typeof props.nextRetryAt === "string" &&
        props.nextRetryAt.length > 0) ||
      (typeof props.gracePeriodEndsAt === "string" &&
        props.gracePeriodEndsAt.length > 0)
    ) {
      lines.push("");
      lines.push("What happens next:");
      if (
        typeof props.nextRetryAt === "string" &&
        props.nextRetryAt.length > 0
      ) {
        lines.push(
          `  We'll automatically retry the payment on ${props.nextRetryAt}.`,
        );
      }
      if (
        typeof props.gracePeriodEndsAt === "string" &&
        props.gracePeriodEndsAt.length > 0
      ) {
        lines.push(
          `  If we still can't collect payment by ${props.gracePeriodEndsAt}, your subscription will be paused.`,
        );
      }
    }

    lines.push("");
    lines.push(`Update payment method: ${props.updatePaymentMethodUrl}`);

    if (
      typeof props.invoiceUrl === "string" &&
      props.invoiceUrl.length > 0
    ) {
      lines.push(`View invoice: ${props.invoiceUrl}`);
    }

    lines.push("");
    lines.push(
      "Common reasons for a failed charge include an expired card, insufficient funds, or your bank flagging the transaction. If everything looks correct on your end, please contact us and we'll help sort it out.",
    );
    lines.push(`Questions? Reach us at ${supportEmail}.`);

    return lines.join("\n");
  }
}

export default PaymentFailed;
