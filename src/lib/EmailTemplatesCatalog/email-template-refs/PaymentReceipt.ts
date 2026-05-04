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
    "Payment receipt / invoice email sent after a successful charge. Uses the SchemaVaults brand gradient header with a 'paid' status badge, a green payment-status callout, a billing metadata table (receipt #, date, billing period, billed-to, payment method), an itemized line-items panel, a totals breakdown (subtotal/tax/discount/total), and a primary CTA to view the invoice. Props: { receiptNumber: string, paymentDate: string, amountTotal: string, paymentMethodLabel: string, customerName?: string, customerEmail?: string, lineItems?: Array<{ description: string, quantity?: number, amount: string }>, subtotal?: string, tax?: string, discount?: string, currency?: string, invoiceUrl?: string, manageBillingUrl?: string, billingPeriodLabel?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is PaymentReceiptEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof PaymentReceiptEmailProps)[] = [
      "receiptNumber",
      "paymentDate",
      "amountTotal",
      "paymentMethodLabel",
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
      "customerName",
      "customerEmail",
      "subtotal",
      "tax",
      "discount",
      "currency",
      "invoiceUrl",
      "manageBillingUrl",
      "billingPeriodLabel",
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
    if ("lineItems" in val && typeof val.lineItems !== "undefined") {
      const items = (val as Record<string, unknown>).lineItems;
      if (!Array.isArray(items)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'lineItems' to be an array when provided, but got ${typeof items}.`,
        );
      }
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (typeof item !== "object" || item === null) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected each entry of 'lineItems' to be an object, but item at index ${i} was ${item === null ? "null" : typeof item}.`,
          );
        }
        const itemRecord = item as Record<string, unknown>;
        if (typeof itemRecord.description !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'lineItems[${i}].description' to be a string, but got ${typeof itemRecord.description}.`,
          );
        }
        if (typeof itemRecord.amount !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'lineItems[${i}].amount' to be a string, but got ${typeof itemRecord.amount}.`,
          );
        }
        if (
          "quantity" in itemRecord &&
          typeof itemRecord.quantity !== "undefined" &&
          typeof itemRecord.quantity !== "number"
        ) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'lineItems[${i}].quantity' to be a number when provided, but got ${typeof itemRecord.quantity}.`,
          );
        }
      }
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
      typeof props.customerName === "string" && props.customerName.length > 0
        ? props.customerName
        : "there";
    const currency: string =
      typeof props.currency === "string" && props.currency.length > 0
        ? props.currency
        : "USD";
    const customerLine: string | undefined =
      typeof props.customerEmail === "string" && props.customerEmail.length > 0
        ? typeof props.customerName === "string" && props.customerName.length > 0
          ? `${props.customerName} (${props.customerEmail})`
          : props.customerEmail
        : typeof props.customerName === "string" && props.customerName.length > 0
          ? props.customerName
          : undefined;

    const lineItems: PaymentReceiptLineItem[] = Array.isArray(props.lineItems)
      ? props.lineItems.filter(
          (item): item is PaymentReceiptLineItem =>
            typeof item === "object" &&
            item !== null &&
            typeof item.description === "string" &&
            item.description.length > 0 &&
            typeof item.amount === "string" &&
            item.amount.length > 0,
        )
      : [];

    const lines: string[] = [
      `Receipt from ${productName}`,
      "",
      `Hi ${greetingName},`,
      "",
      `Thanks for your payment. We received ${props.amountTotal} on ${props.paymentDate}. This email is your receipt; keep it for your records.`,
      "",
      `Payment status: Successful — charged to ${props.paymentMethodLabel}.`,
      "",
      `Receipt: ${props.receiptNumber}`,
      `Date paid: ${props.paymentDate}`,
    ];

    if (
      typeof props.billingPeriodLabel === "string" &&
      props.billingPeriodLabel.length > 0
    ) {
      lines.push(`Billing period: ${props.billingPeriodLabel}`);
    }
    if (customerLine) {
      lines.push(`Billed to: ${customerLine}`);
    }
    lines.push(`Payment method: ${props.paymentMethodLabel}`);

    if (lineItems.length > 0) {
      lines.push("");
      lines.push("Items:");
      for (const item of lineItems) {
        const qty: number | undefined =
          typeof item.quantity === "number" &&
          Number.isFinite(item.quantity) &&
          item.quantity > 1
            ? Math.floor(item.quantity)
            : undefined;
        const qtyLabel = qty ? ` × ${qty}` : "";
        lines.push(`  - ${item.description}${qtyLabel} — ${item.amount}`);
      }
    }

    lines.push("");
    if (typeof props.subtotal === "string" && props.subtotal.length > 0) {
      lines.push(`Subtotal: ${props.subtotal}`);
    }
    if (typeof props.discount === "string" && props.discount.length > 0) {
      lines.push(`Discount: -${props.discount}`);
    }
    if (typeof props.tax === "string" && props.tax.length > 0) {
      lines.push(`Tax: ${props.tax}`);
    }
    lines.push(`Total (${currency}): ${props.amountTotal}`);

    if (typeof props.invoiceUrl === "string" && props.invoiceUrl.length > 0) {
      lines.push("");
      lines.push(`View invoice: ${props.invoiceUrl}`);
    }

    if (
      typeof props.manageBillingUrl === "string" &&
      props.manageBillingUrl.length > 0
    ) {
      lines.push("");
      lines.push(
        `Need to update your payment method or download past invoices? Visit your billing settings: ${props.manageBillingUrl}`,
      );
    }

    lines.push("");
    lines.push(
      `Questions about this charge or your subscription? Reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default PaymentReceipt;
