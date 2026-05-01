import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import type {
  PaymentReceiptEmailProps,
  PaymentReceiptLineItem,
} from "@/email-templates/payment-receipt";

export class PaymentReceipt extends EmailTemplatesCatalogEntry<PaymentReceiptEmailProps> {
  public id = "payment-receipt" as const satisfies string;

  public description =
    "Payment-receipt confirmation email sent after a successful subscription or one-time charge. Uses an emerald/success gradient header (visually distinct from the amber trial-ending and brand-blue welcome flows), a prominent 'amount paid' callout, an optional itemized line-items table with subtotal/tax/total, a metadata table (receipt number, date, payment method, billing period, plan, next billing date), an optional 'view receipt' CTA, and an optional billing-management panel. Props: { receiptNumber: string, amountTotal: string, paymentDate: string, recipientName?: string, planName?: string, billingPeriod?: string, paymentMethod?: string, lineItems?: Array<{ description: string, amount: string }>, subtotal?: string, taxAmount?: string, nextBillingDate?: string, viewReceiptUrl?: string, manageBillingUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is PaymentReceiptEmailProps {
    if (typeof val !== "object" || !val) {
      return false;
    }
    if (!("receiptNumber" in val) || typeof val.receiptNumber !== "string") {
      return false;
    }
    if (!("amountTotal" in val) || typeof val.amountTotal !== "string") {
      return false;
    }
    if (!("paymentDate" in val) || typeof val.paymentDate !== "string") {
      return false;
    }
    if (
      "recipientName" in val &&
      typeof val.recipientName !== "undefined" &&
      typeof val.recipientName !== "string"
    ) {
      return false;
    }
    if (
      "planName" in val &&
      typeof val.planName !== "undefined" &&
      typeof val.planName !== "string"
    ) {
      return false;
    }
    if (
      "billingPeriod" in val &&
      typeof val.billingPeriod !== "undefined" &&
      typeof val.billingPeriod !== "string"
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
      "subtotal" in val &&
      typeof val.subtotal !== "undefined" &&
      typeof val.subtotal !== "string"
    ) {
      return false;
    }
    if (
      "taxAmount" in val &&
      typeof val.taxAmount !== "undefined" &&
      typeof val.taxAmount !== "string"
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
    if ("lineItems" in val && typeof val.lineItems !== "undefined") {
      if (!Array.isArray(val.lineItems)) {
        return false;
      }
      for (const item of val.lineItems) {
        if (typeof item !== "object" || item === null) {
          return false;
        }
        const candidate = item as Partial<PaymentReceiptLineItem>;
        if (typeof candidate.description !== "string") {
          return false;
        }
        if (typeof candidate.amount !== "string") {
          return false;
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
      typeof props.recipientName === "string" && props.recipientName.length > 0
        ? props.recipientName
        : "there";

    const lineItems: PaymentReceiptLineItem[] = Array.isArray(props.lineItems)
      ? props.lineItems.filter(
          (item): item is PaymentReceiptLineItem =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as PaymentReceiptLineItem).description === "string" &&
            (item as PaymentReceiptLineItem).description.length > 0 &&
            typeof (item as PaymentReceiptLineItem).amount === "string" &&
            (item as PaymentReceiptLineItem).amount.length > 0,
        )
      : [];

    const lines: string[] = [
      `${productName} — payment receipt #${props.receiptNumber}`,
      "",
      `Hi ${greetingName},`,
      "",
      `We received your payment of ${props.amountTotal} on ${props.paymentDate}. Keep this email for your records — a copy is also available in your billing settings.`,
      "",
      `Amount paid: ${props.amountTotal}`,
      "",
    ];

    if (lineItems.length > 0) {
      lines.push("Items:");
      for (const item of lineItems) {
        lines.push(`  - ${item.description}: ${item.amount}`);
      }
      if (
        typeof props.subtotal === "string" &&
        props.subtotal.length > 0
      ) {
        lines.push(`  Subtotal: ${props.subtotal}`);
      }
      if (
        typeof props.taxAmount === "string" &&
        props.taxAmount.length > 0
      ) {
        lines.push(`  Tax: ${props.taxAmount}`);
      }
      lines.push(`  Total paid: ${props.amountTotal}`);
      lines.push("");
    }

    lines.push("Details:");
    lines.push(`  Receipt #: ${props.receiptNumber}`);
    lines.push(`  Date paid: ${props.paymentDate}`);
    if (
      typeof props.paymentMethod === "string" &&
      props.paymentMethod.length > 0
    ) {
      lines.push(`  Payment method: ${props.paymentMethod}`);
    }
    if (
      typeof props.billingPeriod === "string" &&
      props.billingPeriod.length > 0
    ) {
      lines.push(`  Billing period: ${props.billingPeriod}`);
    }
    if (typeof props.planName === "string" && props.planName.length > 0) {
      lines.push(`  Plan: ${props.planName}`);
    }
    if (
      typeof props.nextBillingDate === "string" &&
      props.nextBillingDate.length > 0
    ) {
      lines.push(`  Next billing date: ${props.nextBillingDate}`);
    }
    lines.push("");

    if (
      typeof props.viewReceiptUrl === "string" &&
      props.viewReceiptUrl.length > 0
    ) {
      lines.push(`View receipt: ${props.viewReceiptUrl}`);
      lines.push("");
    }

    if (
      typeof props.manageBillingUrl === "string" &&
      props.manageBillingUrl.length > 0
    ) {
      lines.push(
        `Need to update payment details, change plans, or download past invoices? Visit your billing settings: ${props.manageBillingUrl}`,
      );
      lines.push("");
    }

    lines.push(
      `Questions about this charge or your subscription? Reply to this email or reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default PaymentReceipt;
