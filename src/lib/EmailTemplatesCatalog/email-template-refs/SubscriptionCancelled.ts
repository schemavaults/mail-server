import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { SubscriptionCancelledEmailProps } from "@/email-templates/subscription-cancelled";

export class SubscriptionCancelled extends EmailTemplatesCatalogEntry<SubscriptionCancelledEmailProps> {
  public id = "subscription-cancelled" as const satisfies string;

  public description =
    "Subscription cancellation confirmation email, sent when a paid subscription is cancelled (by the customer or admin). Uses a respectful slate-gradient header, a metadata table (plan, account, cancelled-on, access-until, optional refund), a 'What happens next' timeline, an optional 'Cancellation reason' callout, a primary reactivate CTA (kept blue to invite return), and a feedback solicitation panel. Props: { planName: string, cancellationDate: string, accessUntil: string, customerName?: string, customerEmail?: string, cancellationReason?: string, refundAmount?: string, reactivateUrl?: string, feedbackUrl?: string, dataRetentionPolicy?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is SubscriptionCancelledEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof SubscriptionCancelledEmailProps)[] =
      ["planName", "cancellationDate", "accessUntil"];
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
        "customerName",
        "customerEmail",
        "cancellationReason",
        "refundAmount",
        "reactivateUrl",
        "feedbackUrl",
        "dataRetentionPolicy",
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
      typeof props.customerName === "string" && props.customerName.length > 0
        ? props.customerName
        : "there";

    const lines: string[] = [
      `Your ${props.planName} subscription on ${productName} has been cancelled.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We've cancelled your ${props.planName} subscription, as requested. You'll continue to have full access until ${props.accessUntil}, and we won't bill you again.`,
      "",
      `Plan: ${props.planName}`,
    ];

    if (
      typeof props.customerEmail === "string" &&
      props.customerEmail.length > 0
    ) {
      lines.push(`Account: ${props.customerEmail}`);
    }
    lines.push(`Cancelled on: ${props.cancellationDate}`);
    lines.push(`Access until: ${props.accessUntil}`);
    if (
      typeof props.refundAmount === "string" &&
      props.refundAmount.length > 0
    ) {
      lines.push(`Refund issued: ${props.refundAmount}`);
    }
    lines.push("");

    if (
      typeof props.cancellationReason === "string" &&
      props.cancellationReason.length > 0
    ) {
      lines.push("Cancellation reason:");
      lines.push(`  ${props.cancellationReason}`);
      lines.push("");
    }

    lines.push("What happens next:");
    lines.push(
      `  - You keep full access to ${props.planName} features through ${props.accessUntil}.`,
    );
    lines.push(
      "  - After that, your account moves to the free tier and paid features become read-only.",
    );
    if (
      typeof props.dataRetentionPolicy === "string" &&
      props.dataRetentionPolicy.length > 0
    ) {
      lines.push(`  - ${props.dataRetentionPolicy}`);
    } else {
      lines.push(
        "  - Your schemas and vaults stay in place — nothing will be deleted automatically.",
      );
    }
    lines.push(
      "  - You can reactivate anytime and pick up right where you left off.",
    );
    lines.push("");

    if (
      typeof props.reactivateUrl === "string" &&
      props.reactivateUrl.length > 0
    ) {
      lines.push(`Reactivate subscription: ${props.reactivateUrl}`);
      lines.push("");
    }
    if (typeof props.feedbackUrl === "string" && props.feedbackUrl.length > 0) {
      lines.push(
        `Mind sharing why you're leaving? Two minutes of feedback genuinely helps us make ${productName} better.`,
      );
      lines.push(`Share feedback: ${props.feedbackUrl}`);
      lines.push("");
    }

    lines.push(
      `Didn't request this cancellation? Reach out to us right away at ${supportEmail} and we'll restore your subscription.`,
    );

    return lines.join("\n");
  }
}

export default SubscriptionCancelled;
