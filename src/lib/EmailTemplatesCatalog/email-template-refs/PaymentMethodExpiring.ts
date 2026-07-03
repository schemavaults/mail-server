import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { PaymentMethodExpiringEmailProps } from "@/email-templates/payment-method-expiring";

export class PaymentMethodExpiring extends EmailTemplatesCatalogEntry<PaymentMethodExpiringEmailProps> {
  public id = "payment-method-expiring" as const satisfies string;

  public description =
    "Payment-method-expiring warning email sent when a customer's card on file will expire before the next billing cycle. Uses the theme's amber warning palette (mirroring the `--warning` token) rather than destructive red so it reads as action-needed, not error. Highlights the card brand + last-4 + expiry in a callout, previews the next charge, and drives a single primary CTA to update the payment method. Props: { paymentMethodLast4: string, expiresAt: string, updatePaymentMethodUrl: string, recipientName?: string, paymentMethodBrand?: string, expiryMonth?: string, expiryYear?: string, daysUntilExpiry?: string, planName?: string, nextChargeDate?: string, nextChargeAmount?: string, manageBillingUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is PaymentMethodExpiringEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof PaymentMethodExpiringEmailProps)[] =
      ["paymentMethodLast4", "expiresAt", "updatePaymentMethodUrl"];
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
    const optionalStringKeys: readonly (keyof PaymentMethodExpiringEmailProps)[] =
      [
        "recipientName",
        "paymentMethodBrand",
        "expiryMonth",
        "expiryYear",
        "daysUntilExpiry",
        "planName",
        "nextChargeDate",
        "nextChargeAmount",
        "manageBillingUrl",
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
    FC<PaymentMethodExpiringEmailProps>
  > {
    const component = await import(
      "@/email-templates/payment-method-expiring"
    ).then((mod) => mod.default);
    return component;
  }

  public async renderPlainTextVersion(
    props: PaymentMethodExpiringEmailProps,
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
      typeof props.recipientName === "string" && props.recipientName.length > 0
        ? props.recipientName
        : "there";
    const paymentMethodBrand: string =
      typeof props.paymentMethodBrand === "string" &&
      props.paymentMethodBrand.length > 0
        ? props.paymentMethodBrand
        : "Card";

    const lines: string[] = [
      `Your payment method is expiring soon — action needed.`,
      "",
      `Hi ${greetingName},`,
      "",
      `The ${paymentMethodBrand} card ending in ${props.paymentMethodLast4} on your ${productName} account expires on ${props.expiresAt}. Update it before then so your subscription doesn't lapse and we can keep your service running without interruption.`,
      "",
      `Card on file: ${paymentMethodBrand} ending in ${props.paymentMethodLast4}`,
    ];

    if (
      typeof props.expiryMonth === "string" &&
      props.expiryMonth.length > 0 &&
      typeof props.expiryYear === "string" &&
      props.expiryYear.length > 0
    ) {
      lines.push(`Card expiry: ${props.expiryMonth}/${props.expiryYear}`);
    }
    lines.push(`Expires: ${props.expiresAt}`);

    if (typeof props.planName === "string" && props.planName.length > 0) {
      lines.push(`Plan: ${props.planName}`);
    }
    if (
      typeof props.nextChargeDate === "string" &&
      props.nextChargeDate.length > 0 &&
      typeof props.nextChargeAmount === "string" &&
      props.nextChargeAmount.length > 0
    ) {
      lines.push(
        `Next charge: ${props.nextChargeAmount} on ${props.nextChargeDate}`,
      );
    } else if (
      typeof props.nextChargeDate === "string" &&
      props.nextChargeDate.length > 0
    ) {
      lines.push(`Next charge: ${props.nextChargeDate}`);
    } else if (
      typeof props.nextChargeAmount === "string" &&
      props.nextChargeAmount.length > 0
    ) {
      lines.push(`Next charge: ${props.nextChargeAmount}`);
    }

    lines.push("");
    lines.push(`Update payment method: ${props.updatePaymentMethodUrl}`);

    if (
      typeof props.manageBillingUrl === "string" &&
      props.manageBillingUrl.length > 0
    ) {
      lines.push("");
      lines.push(
        `Want to review invoices or change plans while you're at it? Visit your billing settings: ${props.manageBillingUrl}`,
      );
    }

    lines.push("");
    lines.push(
      "If you've already updated this card, you can safely ignore this email — we'll only bill the most recent payment method on file.",
    );
    lines.push(`Questions? Reach us at ${supportEmail}.`);

    return lines.join("\n");
  }
}

export default PaymentMethodExpiring;
