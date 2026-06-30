import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { SubscriptionCanceledEmailProps } from "@/email-templates/subscription-canceled";

export class SubscriptionCanceled extends EmailTemplatesCatalogEntry<SubscriptionCanceledEmailProps> {
  public id = "subscription-canceled" as const satisfies string;

  public description =
    "Transactional email sent when a user's paid subscription is canceled (either by them or automatically). Uses a neutral slate gradient header, a prominent blue 'You still have access until' callout that highlights the end-of-access date, a metadata table (plan name, billing cycle, canceled date, last payment amount/date, optional cancellation reason), a primary 'Reactivate subscription' CTA (brand blue), an optional secondary 'Manage billing' link, and a 'What happens to your data' panel that surfaces the data-retention window before permanent deletion. Designed as the standard SaaS cancellation confirmation + soft win-back. Props: { planName: string, accessEndsAt: string, reactivateUrl: string, recipientName?: string, canceledAt?: string, billingCycle?: string, lastPaymentAmount?: string, lastPaymentDate?: string, cancellationReason?: string, manageBillingUrl?: string, dataRetentionDays?: number, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is SubscriptionCanceledEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof SubscriptionCanceledEmailProps)[] =
      ["planName", "accessEndsAt", "reactivateUrl"];
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
    const optionalStringKeys: readonly (keyof SubscriptionCanceledEmailProps)[] =
      [
        "recipientName",
        "canceledAt",
        "billingCycle",
        "lastPaymentAmount",
        "lastPaymentDate",
        "cancellationReason",
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
    if (
      "dataRetentionDays" in val &&
      typeof (val as Record<string, unknown>).dataRetentionDays !== "undefined"
    ) {
      const v = (val as Record<string, unknown>).dataRetentionDays;
      if (typeof v !== "number" || !Number.isFinite(v) || v < 0) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'dataRetentionDays' to be a non-negative finite number when provided, but got ${typeof v === "number" ? String(v) : typeof v}.`,
        );
      }
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<
    FC<SubscriptionCanceledEmailProps>
  > {
    const component = await import(
      "@/email-templates/subscription-canceled"
    ).then((mod) => mod.default);
    return component;
  }

  public async renderPlainTextVersion(
    props: SubscriptionCanceledEmailProps,
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
    const dataRetentionDays: number =
      typeof props.dataRetentionDays === "number" &&
      Number.isFinite(props.dataRetentionDays) &&
      props.dataRetentionDays > 0
        ? Math.floor(props.dataRetentionDays)
        : 30;

    const lines: string[] = [
      `Your ${productName} ${props.planName} subscription has been canceled. You'll keep access through ${props.accessEndsAt}.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We've canceled your "${props.planName}" subscription on ${productName}. You won't be charged again. Thanks for trying us out — we're sorry to see you go.`,
      "",
      `You still have access until: ${props.accessEndsAt}`,
      "Your paid features stay on until then. After that, your account moves to the free tier.",
      "",
      `Plan: ${props.planName}`,
    ];

    if (
      typeof props.billingCycle === "string" &&
      props.billingCycle.length > 0
    ) {
      lines.push(`Billing cycle: ${props.billingCycle}`);
    }
    if (typeof props.canceledAt === "string" && props.canceledAt.length > 0) {
      lines.push(`Canceled on: ${props.canceledAt}`);
    }
    if (
      typeof props.lastPaymentAmount === "string" &&
      props.lastPaymentAmount.length > 0
    ) {
      lines.push(`Last payment: ${props.lastPaymentAmount}`);
    }
    if (
      typeof props.lastPaymentDate === "string" &&
      props.lastPaymentDate.length > 0
    ) {
      lines.push(`Paid on: ${props.lastPaymentDate}`);
    }
    if (
      typeof props.cancellationReason === "string" &&
      props.cancellationReason.length > 0
    ) {
      lines.push(`Reason: ${props.cancellationReason}`);
    }

    lines.push("");
    lines.push(`Reactivate subscription: ${props.reactivateUrl}`);
    if (
      typeof props.manageBillingUrl === "string" &&
      props.manageBillingUrl.length > 0
    ) {
      lines.push(`Manage billing: ${props.manageBillingUrl}`);
    }
    lines.push("");
    lines.push("What happens to your data");
    lines.push(
      `We'll keep your schemas and vaults for ${dataRetentionDays} days after access ends. Reactivate before then and everything picks up where you left off. After that, your workspace data is permanently deleted.`,
    );
    lines.push("");
    lines.push(
      `Mind sharing why you canceled? Just reply to this email — we read every response and use it to make ${productName} better.`,
    );
    lines.push("");
    lines.push(`Questions about your account? Reach us at ${supportEmail}.`);

    return lines.join("\n");
  }
}

export default SubscriptionCanceled;
