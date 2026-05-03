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
    "Payment receipt / invoice email sent after a successful charge. Uses SchemaVaults brand gradient header, a 'Paid in full' callout with the total, an itemized order summary table (description, qty, amount) with subtotal/discount/tax/total rows, an optional payment-method + billing-period panel, and CTAs to view the invoice and manage billing. Props: { customerName: string, invoiceNumber: string, paymentDate: string, amountPaid: string, lineItems: { description: string, quantity?: number, amount: string }[], subtotal?: string, tax?: string, discount?: string, paymentMethod?: string, billingPeriod?: string, invoiceUrl?: string, manageBillingUrl?: string, productName?: string, supportEmail?: string, companyAddress?: string }" as const satisfies string;

  public validateProps(val: unknown): val is PaymentReceiptEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof PaymentReceiptEmailProps)[] = [
      "customerName",
      "invoiceNumber",
      "paymentDate",
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
    if (!("lineItems" in val)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' is missing required prop 'lineItems' (expected array).`,
      );
    }
    const rawLineItems = (val as Record<string, unknown>)["lineItems"];
    if (!Array.isArray(rawLineItems)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'lineItems' to be an array, but got ${typeof rawLineItems}.`,
      );
    }
    if (rawLineItems.length === 0) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'lineItems' to contain at least one line item.`,
      );
    }
    for (let i = 0; i < rawLineItems.length; i++) {
      const item = rawLineItems[i];
      if (typeof item !== "object" || !item) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected prop 'lineItems[${i}]' to be an object, but got ${item === null ? "null" : typeof item}.`,
        );
      }
      const itemRecord = item as Record<string, unknown>;
      if (typeof itemRecord["description"] !== "string") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected prop 'lineItems[${i}].description' to be a string, but got ${typeof itemRecord["description"]}.`,
        );
      }
      if (typeof itemRecord["amount"] !== "string") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected prop 'lineItems[${i}].amount' to be a string, but got ${typeof itemRecord["amount"]}.`,
        );
      }
      if (
        "quantity" in itemRecord &&
        typeof itemRecord["quantity"] !== "undefined" &&
        typeof itemRecord["quantity"] !== "number"
      ) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'lineItems[${i}].quantity' to be a number when provided, but got ${typeof itemRecord["quantity"]}.`,
        );
      }
    }
    const optionalStringKeys: readonly (keyof PaymentReceiptEmailProps)[] = [
      "subtotal",
      "tax",
      "discount",
      "paymentMethod",
      "billingPeriod",
      "invoiceUrl",
      "manageBillingUrl",
      "productName",
      "supportEmail",
      "companyAddress",
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

    const lines: string[] = [
      `Payment received — ${productName}`,
      "",
      `Hi ${props.customerName},`,
      "",
      `Thanks for your payment. We received ${props.amountPaid} on ${props.paymentDate}.`,
      "",
      `Invoice: ${props.invoiceNumber}`,
    ];

    if (
      typeof props.billingPeriod === "string" &&
      props.billingPeriod.length > 0
    ) {
      lines.push(`Billing period: ${props.billingPeriod}`);
    }
    if (
      typeof props.paymentMethod === "string" &&
      props.paymentMethod.length > 0
    ) {
      lines.push(`Payment method: ${props.paymentMethod}`);
    }

    lines.push("");
    lines.push("Order summary:");
    for (const item of props.lineItems) {
      const qty: number =
        typeof item.quantity === "number" ? item.quantity : 1;
      lines.push(`  - ${item.description} (x${qty}) — ${item.amount}`);
    }
    lines.push("");

    if (typeof props.subtotal === "string" && props.subtotal.length > 0) {
      lines.push(`Subtotal: ${props.subtotal}`);
    }
    if (typeof props.discount === "string" && props.discount.length > 0) {
      lines.push(`Discount: ${props.discount}`);
    }
    if (typeof props.tax === "string" && props.tax.length > 0) {
      lines.push(`Tax: ${props.tax}`);
    }
    lines.push(`Total paid: ${props.amountPaid}`);
    lines.push("");

    if (typeof props.invoiceUrl === "string" && props.invoiceUrl.length > 0) {
      lines.push(`View invoice: ${props.invoiceUrl}`);
    }
    if (
      typeof props.manageBillingUrl === "string" &&
      props.manageBillingUrl.length > 0
    ) {
      lines.push(`Manage billing: ${props.manageBillingUrl}`);
    }

    lines.push("");
    lines.push(`Questions about this charge? Reach us at ${supportEmail}.`);

    if (
      typeof props.companyAddress === "string" &&
      props.companyAddress.length > 0
    ) {
      lines.push("");
      lines.push(props.companyAddress);
    }

    return lines.join("\n");
  }
}

export default PaymentReceipt;

export type { PaymentReceiptLineItem };
