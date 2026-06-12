import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { SubscriptionCancelledEmailProps } from "@/email-templates/subscription-cancelled";

export class SubscriptionCancelled extends EmailTemplatesCatalogEntry<SubscriptionCancelledEmailProps> {
  public id = "subscription-cancelled" as const satisfies string;

  public description =
    "Subscription cancellation confirmation email. Acknowledges the cancellation with a calmer slate-toned header (distinct from active-state brand-blue emails), summarizes the plan, cancellation date, and the end-of-access date, optionally explains data retention and any prorated refund, and offers a primary CTA to reactivate plus an optional secondary CTA to share cancellation feedback. Props: { planName: string, cancelledAt: string, accessEndsAt: string, reactivateUrl: string, recipientName?: string, refundAmount?: string, dataRetentionDays?: number, feedbackUrl?: string, manageBillingUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is SubscriptionCancelledEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof SubscriptionCancelledEmailProps)[] =
      ["planName", "cancelledAt", "accessEndsAt", "reactivateUrl"];
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
    const optionalStringKeys: readonly (keyof SubscriptionCancelledEmailProps)[] =
      [
        "recipientName",
        "refundAmount",
        "feedbackUrl",
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
      typeof (val as Record<string, unknown>)["dataRetentionDays"] !==
        "undefined" &&
      typeof (val as Record<string, unknown>)["dataRetentionDays"] !== "number"
    ) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected optional prop 'dataRetentionDays' to be a number when provided, but got ${typeof (val as Record<string, unknown>)["dataRetentionDays"]}.`,
      );
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<
    FC<SubscriptionCancelledEmailProps>
  > {
    const component = await import(
      "@/email-templates/subscription-cancelled"
    ).then((mod) => mod.default);
    return component;
  }

  public async renderPlainTextVersion(
    props: SubscriptionCancelledEmailProps,
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
      `Your ${productName} subscription has been cancelled.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We've cancelled your ${props.planName} subscription as requested. You'll keep full access to ${productName} until ${props.accessEndsAt} — after that, your account will switch to read-only and we won't bill you again.`,
      "",
      `Plan: ${props.planName}`,
      `Cancelled on: ${props.cancelledAt}`,
      `Access ends: ${props.accessEndsAt}`,
    ];

    if (
      typeof props.refundAmount === "string" &&
      props.refundAmount.length > 0
    ) {
      lines.push(`Refund: ${props.refundAmount}`);
    }

    if (
      typeof props.dataRetentionDays === "number" &&
      props.dataRetentionDays > 0
    ) {
      lines.push("");
      lines.push(
        `Your data: We'll keep your schemas, vaults, and history for ${props.dataRetentionDays} days after ${props.accessEndsAt}. Reactivate any time before then and pick up where you left off.`,
      );
    }

    lines.push("");
    lines.push(`Reactivate subscription: ${props.reactivateUrl}`);

    if (
      typeof props.manageBillingUrl === "string" &&
      props.manageBillingUrl.length > 0
    ) {
      lines.push(`Manage billing: ${props.manageBillingUrl}`);
    }

    if (typeof props.feedbackUrl === "string" && props.feedbackUrl.length > 0) {
      lines.push("");
      lines.push(
        `One quick favor? We'd love a minute of your time to learn what we could have done better. Share feedback: ${props.feedbackUrl}`,
      );
    }

    lines.push("");
    lines.push(
      `Didn't request this cancellation? Reach us right away at ${supportEmail} and we'll help sort it out.`,
    );

    return lines.join("\n");
  }
}

export default SubscriptionCancelled;
