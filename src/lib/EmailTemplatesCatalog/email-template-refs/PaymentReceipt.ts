import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type {
  PaymentReceiptEmailProps,
  PaymentReceiptLineItem,
} from "@/email-templates/payment-receipt";

export class PaymentReceipt extends EmailTemplatesCatalogEntry<PaymentReceiptEmailProps> {
  public id = "payment-receipt" as const satisfies string;

  public description =
    "Payment receipt / invoice email sent after a successful subscription or one-time charge. Uses an emerald success gradient header, a 'Paid' badge with the amount, a metadata table (receipt #, date, plan, billing period, payment method), an itemized line-item table with subtotal/tax/total, optional billing address callout, and a primary CTA to download the invoice PDF. Props: { receiptNumber: string, paidAt: string, amountPaid: string, recipientName?: string, planName?: string, billingPeriodStart?: string, billingPeriodEnd?: string, paymentMethodBrand?: string, paymentMethodLast4?: string, lineItems?: Array<{ description: string, amount: string, quantity?: number, unitPrice?: string }>, subtotal?: string, tax?: string, invoiceUrl?: string, manageBillingUrl?: string, billingAddress?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is PaymentReceiptEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof PaymentReceiptEmailProps)[] = [
      "receiptNumber",
      "paidAt",
      "amountPaid",
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
    const optionalStringKeys: readonly (keyof PaymentReceiptEmailProps)[] = [
      "recipientName",
      "planName",
      "billingPeriodStart",
      "billingPeriodEnd",
      "paymentMethodBrand",
      "paymentMethodLast4",
      "subtotal",
      "tax",
      "invoiceUrl",
      "manageBillingUrl",
      "billingAddress",
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
      "lineItems" in val &&
      typeof (val as Record<string, unknown>).lineItems !== "undefined"
    ) {
      const items = (val as Record<string, unknown>).lineItems;
      if (!Array.isArray(items)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'lineItems' to be an array when provided, but got ${typeof items}.`,
        );
      }
      items.forEach((item, idx) => {
        if (typeof item !== "object" || item === null) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'lineItems[${idx}]' to be an object, but got ${item === null ? "null" : typeof item}.`,
          );
        }
        const lineItem = item as Record<string, unknown>;
        for (const k of ["description", "amount"] as const) {
          if (typeof lineItem[k] !== "string") {
            throw new BadEmailTemplatePropsError(
              `Template '${this.id}' expected 'lineItems[${idx}].${k}' to be a string, but got ${typeof lineItem[k]}.`,
            );
          }
        }
        if (
          typeof lineItem.quantity !== "undefined" &&
          typeof lineItem.quantity !== "number"
        ) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected optional 'lineItems[${idx}].quantity' to be a number when provided, but got ${typeof lineItem.quantity}.`,
          );
        }
        if (
          typeof lineItem.unitPrice !== "undefined" &&
          typeof lineItem.unitPrice !== "string"
        ) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected optional 'lineItems[${idx}].unitPrice' to be a string when provided, but got ${typeof lineItem.unitPrice}.`,
          );
        }
      });
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<
    FC<PaymentReceiptEmailProps>
  > {
    const component = await import("@/email-templates/payment-receipt").then(
      (mod) => mod.default,
    );
    return component;
  }

  public async renderPlainTextVersion(
    props: PaymentReceiptEmailProps,
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

    const lines: string[] = [
      `Payment received — ${props.amountPaid}.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We've received your payment of ${props.amountPaid}${
        typeof props.planName === "string" && props.planName.length > 0
          ? ` for ${props.planName}`
          : ""
      }. This email is your receipt — keep it for your records.`,
      "",
      `Receipt #: ${props.receiptNumber}`,
      `Date paid: ${props.paidAt}`,
    ];

    if (typeof props.planName === "string" && props.planName.length > 0) {
      lines.push(`Plan: ${props.planName}`);
    }
    const periodStart =
      typeof props.billingPeriodStart === "string" &&
      props.billingPeriodStart.length > 0
        ? props.billingPeriodStart
        : undefined;
    const periodEnd =
      typeof props.billingPeriodEnd === "string" &&
      props.billingPeriodEnd.length > 0
        ? props.billingPeriodEnd
        : undefined;
    if (periodStart && periodEnd) {
      lines.push(`Billing period: ${periodStart} – ${periodEnd}`);
    } else if (periodStart) {
      lines.push(`Billing period: ${periodStart}`);
    } else if (periodEnd) {
      lines.push(`Billing period: ${periodEnd}`);
    }
    const brand =
      typeof props.paymentMethodBrand === "string" &&
      props.paymentMethodBrand.length > 0
        ? props.paymentMethodBrand
        : undefined;
    const last4 =
      typeof props.paymentMethodLast4 === "string" &&
      props.paymentMethodLast4.length > 0
        ? props.paymentMethodLast4
        : undefined;
    if (brand && last4) {
      lines.push(`Payment method: ${brand} ending in ${last4}`);
    } else if (brand) {
      lines.push(`Payment method: ${brand}`);
    } else if (last4) {
      lines.push(`Payment method: Card ending in ${last4}`);
    }

    const items: PaymentReceiptLineItem[] = Array.isArray(props.lineItems)
      ? props.lineItems
      : [];
    if (items.length > 0) {
      lines.push("");
      lines.push("Items:");
      for (const item of items) {
        const detailParts: string[] = [];
        if (
          typeof item.quantity === "number" &&
          Number.isFinite(item.quantity) &&
          item.quantity !== 1
        ) {
          detailParts.push(`Qty ${item.quantity}`);
        }
        if (
          typeof item.unitPrice === "string" &&
          item.unitPrice.length > 0
        ) {
          detailParts.push(`${item.unitPrice} each`);
        }
        const detail =
          detailParts.length > 0 ? ` (${detailParts.join(" · ")})` : "";
        lines.push(`  - ${item.description}${detail}: ${item.amount}`);
      }
    }

    if (typeof props.subtotal === "string" && props.subtotal.length > 0) {
      lines.push("");
      lines.push(`Subtotal: ${props.subtotal}`);
    }
    if (typeof props.tax === "string" && props.tax.length > 0) {
      lines.push(`Tax: ${props.tax}`);
    }
    lines.push(`Total paid: ${props.amountPaid}`);

    if (
      typeof props.billingAddress === "string" &&
      props.billingAddress.length > 0
    ) {
      lines.push("");
      lines.push("Billed to:");
      for (const addrLine of props.billingAddress.split("\n")) {
        lines.push(`  ${addrLine}`);
      }
    }

    if (typeof props.invoiceUrl === "string" && props.invoiceUrl.length > 0) {
      lines.push("");
      lines.push(`Download invoice: ${props.invoiceUrl}`);
    }
    if (
      typeof props.manageBillingUrl === "string" &&
      props.manageBillingUrl.length > 0
    ) {
      lines.push(
        `Manage billing, change plan, or view past receipts: ${props.manageBillingUrl}`,
      );
    }

    lines.push("");
    lines.push(
      `Questions about this charge or your subscription? Reply to this email or reach us at ${supportEmail}.`,
    );
    lines.push("");
    lines.push(
      `© ${new Date().getFullYear()} ${productName}. You are receiving this email because a payment was processed on your account.`,
    );

    return lines.join("\n");
  }
}

export default PaymentReceipt;
