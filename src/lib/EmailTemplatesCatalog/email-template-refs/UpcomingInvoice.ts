import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { UpcomingInvoiceEmailProps } from "@/email-templates/upcoming-invoice";

export class UpcomingInvoice extends EmailTemplatesCatalogEntry<UpcomingInvoiceEmailProps> {
  public id = "upcoming-invoice" as const satisfies string;

  public description =
    "Upcoming-invoice / renewal reminder email sent a few days before an active subscription is automatically renewed. Uses the SchemaVaults brand gradient header, a highlighted 'amount due' card showing the renewal amount and charge date, a metadata table (plan, billing period, payment method, invoice number), and a primary CTA to manage billing with a visible fallback link. Complements the trial-ending, payment-receipt, and payment-failed templates to cover the full billing lifecycle. Props: { name: string, amount: string, chargeDate: string, manageBillingUrl: string, planName?: string, billingPeriod?: string, paymentMethod?: string, invoiceNumber?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is UpcomingInvoiceEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof UpcomingInvoiceEmailProps)[] = [
      "name",
      "amount",
      "chargeDate",
      "manageBillingUrl",
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
    const optionalStringKeys: readonly (keyof UpcomingInvoiceEmailProps)[] = [
      "planName",
      "billingPeriod",
      "paymentMethod",
      "invoiceNumber",
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
    FC<UpcomingInvoiceEmailProps>
  > {
    const component = await import("@/email-templates/upcoming-invoice").then(
      (mod) => mod.default,
    );
    return component;
  }

  public async renderPlainTextVersion(
    props: UpcomingInvoiceEmailProps,
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
      `Your ${productName} subscription renews on ${props.chargeDate} for ${props.amount}.`,
      "",
      `Hi ${props.name},`,
      "",
      `This is a friendly heads-up that we'll automatically charge your payment method on file for the next ${productName} billing cycle. No action is needed if everything looks right.`,
      "",
      `Amount due: ${props.amount}`,
      `Charges on: ${props.chargeDate}`,
      "",
    ];

    if (typeof props.planName === "string" && props.planName.length > 0) {
      lines.push(`Plan: ${props.planName}`);
    }
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
    if (
      typeof props.invoiceNumber === "string" &&
      props.invoiceNumber.length > 0
    ) {
      lines.push(`Invoice: ${props.invoiceNumber}`);
    }
    lines.push("");
    lines.push(`Manage billing: ${props.manageBillingUrl}`);
    lines.push("");
    lines.push(
      `You can update your payment method, change your plan, or cancel your subscription anytime before ${props.chargeDate} from your billing settings.`,
    );
    lines.push("");
    lines.push(
      `Questions about this charge? Reach us at ${supportEmail}. We're happy to help.`,
    );

    return lines.join("\n");
  }
}

export default UpcomingInvoice;
