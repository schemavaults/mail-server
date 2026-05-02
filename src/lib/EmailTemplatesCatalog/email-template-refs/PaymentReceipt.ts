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
    "Payment receipt / invoice confirmation email sent after a successful charge (one-off payment, subscription renewal, or top-up). Uses the SchemaVaults brand gradient header, an emerald 'Paid' status panel showing the total amount, a metadata table (receipt #, payment date, method, billed-to, plan, currency), an optional itemized line-items table with subtotal/discount/tax/total summary, an optional 'next billing date' callout for subscription renewals, and primary 'View invoice' / 'Manage billing' CTAs. Props: { customerName: string, receiptNumber: string, amountTotal: string, paymentDate: string, paymentMethod: string, customerEmail?: string, lineItems?: { description: string, amount: string }[], subtotal?: string, discount?: string, tax?: string, currency?: string, planName?: string, nextBillingDate?: string, invoiceUrl?: string, manageBillingUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is PaymentReceiptEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof PaymentReceiptEmailProps)[] = [
      "customerName",
      "receiptNumber",
      "amountTotal",
      "paymentDate",
      "paymentMethod",
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
      "customerEmail",
      "subtotal",
      "discount",
      "tax",
      "currency",
      "planName",
      "nextBillingDate",
      "invoiceUrl",
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
    if ("lineItems" in val && typeof val.lineItems !== "undefined") {
      if (!Array.isArray(val.lineItems)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'lineItems' to be an array of { description: string, amount: string } objects when provided, but got ${typeof val.lineItems}.`,
        );
      }
      for (let i = 0; i < val.lineItems.length; i++) {
        const item: unknown = val.lineItems[i];
        if (typeof item !== "object" || item === null) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected every entry of prop 'lineItems' to be an object, but entry at index ${i} is ${item === null ? "null" : typeof item}.`,
          );
        }
        const description = (item as Record<string, unknown>).description;
        const amount = (item as Record<string, unknown>).amount;
        if (typeof description !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'lineItems[${i}].description' to be a string, but got ${typeof description}.`,
          );
        }
        if (typeof amount !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'lineItems[${i}].amount' to be a string, but got ${typeof amount}.`,
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

    const lines: string[] = [
      `Payment received: ${props.amountTotal} for ${productName}.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We've recorded your payment for ${productName}. Keep this email for your records — it serves as your official receipt.`,
      "",
      `Amount paid: ${props.amountTotal}${typeof props.currency === "string" && props.currency.length > 0 ? ` (${props.currency})` : ""}`,
      `Receipt #: ${props.receiptNumber}`,
      `Payment date: ${props.paymentDate}`,
      `Payment method: ${props.paymentMethod}`,
    ];

    if (
      typeof props.customerEmail === "string" &&
      props.customerEmail.length > 0
    ) {
      lines.push(`Billed to: ${props.customerEmail}`);
    }
    if (typeof props.planName === "string" && props.planName.length > 0) {
      lines.push(`Plan: ${props.planName}`);
    }
    lines.push("");

    const lineItems: PaymentReceiptLineItem[] = Array.isArray(props.lineItems)
      ? props.lineItems.filter(
          (item): item is PaymentReceiptLineItem =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as PaymentReceiptLineItem).description === "string" &&
            typeof (item as PaymentReceiptLineItem).amount === "string",
        )
      : [];

    if (lineItems.length > 0) {
      lines.push("Line items:");
      for (const item of lineItems) {
        lines.push(`  - ${item.description}: ${item.amount}`);
      }
      lines.push("");
    }

    if (typeof props.subtotal === "string" && props.subtotal.length > 0) {
      lines.push(`Subtotal: ${props.subtotal}`);
    }
    if (typeof props.discount === "string" && props.discount.length > 0) {
      lines.push(`Discount: ${props.discount}`);
    }
    if (typeof props.tax === "string" && props.tax.length > 0) {
      lines.push(`Tax: ${props.tax}`);
    }
    lines.push(`Total paid: ${props.amountTotal}`);
    lines.push("");

    if (
      typeof props.nextBillingDate === "string" &&
      props.nextBillingDate.length > 0
    ) {
      lines.push(
        `Your subscription renews on ${props.nextBillingDate}. We'll send another receipt at that time.`,
      );
      lines.push("");
    }

    if (typeof props.invoiceUrl === "string" && props.invoiceUrl.length > 0) {
      lines.push(`View invoice: ${props.invoiceUrl}`);
    }
    if (
      typeof props.manageBillingUrl === "string" &&
      props.manageBillingUrl.length > 0
    ) {
      lines.push(
        `Need to update your payment method or change plans? Manage billing: ${props.manageBillingUrl}`,
      );
    }
    if (props.invoiceUrl || props.manageBillingUrl) {
      lines.push("");
    }

    lines.push(
      `Don't recognize this charge? Contact us right away at ${supportEmail} and reference receipt ${props.receiptNumber}.`,
    );

    return lines.join("\n");
  }
}

export default PaymentReceipt;
