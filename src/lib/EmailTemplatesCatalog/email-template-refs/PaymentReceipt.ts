import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import type {
  PaymentReceiptEmailProps,
  PaymentReceiptLineItem,
} from "@/email-templates/payment-receipt";

function isPaymentReceiptLineItem(val: unknown): val is PaymentReceiptLineItem {
  if (typeof val !== "object" || !val) {
    return false;
  }
  if (!("description" in val) || typeof val.description !== "string") {
    return false;
  }
  if (!("amount" in val) || typeof val.amount !== "string") {
    return false;
  }
  return true;
}

export class PaymentReceipt extends EmailTemplatesCatalogEntry<PaymentReceiptEmailProps> {
  public id = "payment-receipt" as const satisfies string;

  public description =
    "Payment receipt email sent to a customer after a successful charge. Uses SchemaVaults brand-blue gradient header with a 'Paid' status badge, a prominent 'Amount paid' panel, a metadata grid (receipt #, paid-on, billed-to, payment method), an itemised line-items table, a subtotal/tax/total breakdown, and a primary CTA to view the receipt online with a billing-settings/next-charge callout. Props: { receiptNumber: string, total: string, paidAt: string, customerName?: string, customerEmail?: string, description?: string, lineItems?: Array<{ description: string; amount: string }>, subtotal?: string, tax?: string, paymentMethod?: string, viewReceiptUrl?: string, manageBillingUrl?: string, nextBillingDate?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is PaymentReceiptEmailProps {
    if (typeof val !== "object" || !val) {
      return false;
    }
    if (!("receiptNumber" in val) || typeof val.receiptNumber !== "string") {
      return false;
    }
    if (!("total" in val) || typeof val.total !== "string") {
      return false;
    }
    if (!("paidAt" in val) || typeof val.paidAt !== "string") {
      return false;
    }
    if (
      "customerName" in val &&
      typeof val.customerName !== "undefined" &&
      typeof val.customerName !== "string"
    ) {
      return false;
    }
    if (
      "customerEmail" in val &&
      typeof val.customerEmail !== "undefined" &&
      typeof val.customerEmail !== "string"
    ) {
      return false;
    }
    if (
      "description" in val &&
      typeof val.description !== "undefined" &&
      typeof val.description !== "string"
    ) {
      return false;
    }
    if ("lineItems" in val && typeof val.lineItems !== "undefined") {
      if (!Array.isArray(val.lineItems)) {
        return false;
      }
      for (const item of val.lineItems) {
        if (!isPaymentReceiptLineItem(item)) {
          return false;
        }
      }
    }
    if (
      "subtotal" in val &&
      typeof val.subtotal !== "undefined" &&
      typeof val.subtotal !== "string"
    ) {
      return false;
    }
    if (
      "tax" in val &&
      typeof val.tax !== "undefined" &&
      typeof val.tax !== "string"
    ) {
      return false;
    }
    if (
      "paymentMethod" in val &&
      typeof val.paymentMethod !== "undefined" &&
      typeof val.paymentMethod !== "string"
    ) {
      return false;
    }
    if (
      "viewReceiptUrl" in val &&
      typeof val.viewReceiptUrl !== "undefined" &&
      typeof val.viewReceiptUrl !== "string"
    ) {
      return false;
    }
    if (
      "manageBillingUrl" in val &&
      typeof val.manageBillingUrl !== "undefined" &&
      typeof val.manageBillingUrl !== "string"
    ) {
      return false;
    }
    if (
      "nextBillingDate" in val &&
      typeof val.nextBillingDate !== "undefined" &&
      typeof val.nextBillingDate !== "string"
    ) {
      return false;
    }
    if (
      "productName" in val &&
      typeof val.productName !== "undefined" &&
      typeof val.productName !== "string"
    ) {
      return false;
    }
    if (
      "supportEmail" in val &&
      typeof val.supportEmail !== "undefined" &&
      typeof val.supportEmail !== "string"
    ) {
      return false;
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

    const lineItems: PaymentReceiptLineItem[] = Array.isArray(props.lineItems)
      ? props.lineItems.filter(isPaymentReceiptLineItem)
      : [];

    const lines: string[] = [
      `Payment received — ${props.total} for ${productName} (receipt ${props.receiptNumber}).`,
      "",
      `Hi ${greetingName},`,
      "",
      `We've received your payment for ${productName}. Keep this email as your receipt — a copy is also available in your billing history.`,
      "",
    ];

    if (
      typeof props.description === "string" &&
      props.description.length > 0
    ) {
      lines.push("Summary:");
      lines.push(`  ${props.description}`);
      lines.push("");
    }

    lines.push(`Amount paid: ${props.total}`);
    lines.push(`Receipt: ${props.receiptNumber}`);
    lines.push(`Paid on: ${props.paidAt}`);
    if (
      typeof props.customerEmail === "string" &&
      props.customerEmail.length > 0
    ) {
      lines.push(`Billed to: ${props.customerEmail}`);
    }
    if (
      typeof props.paymentMethod === "string" &&
      props.paymentMethod.length > 0
    ) {
      lines.push(`Payment method: ${props.paymentMethod}`);
    }
    lines.push("");

    if (lineItems.length > 0) {
      lines.push("Items:");
      for (const item of lineItems) {
        lines.push(`  - ${item.description}: ${item.amount}`);
      }
      lines.push("");
    }

    if (typeof props.subtotal === "string" && props.subtotal.length > 0) {
      lines.push(`Subtotal: ${props.subtotal}`);
    }
    if (typeof props.tax === "string" && props.tax.length > 0) {
      lines.push(`Tax: ${props.tax}`);
    }
    lines.push(`Total paid: ${props.total}`);
    lines.push("");

    if (
      typeof props.viewReceiptUrl === "string" &&
      props.viewReceiptUrl.length > 0
    ) {
      lines.push(`View receipt: ${props.viewReceiptUrl}`);
    }
    if (
      typeof props.nextBillingDate === "string" &&
      props.nextBillingDate.length > 0
    ) {
      lines.push(`Next charge: ${props.nextBillingDate}`);
    }
    if (
      typeof props.manageBillingUrl === "string" &&
      props.manageBillingUrl.length > 0
    ) {
      lines.push(`Manage billing: ${props.manageBillingUrl}`);
    }
    lines.push("");
    lines.push(
      `Questions about this charge or need a refund? Reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default PaymentReceipt;
