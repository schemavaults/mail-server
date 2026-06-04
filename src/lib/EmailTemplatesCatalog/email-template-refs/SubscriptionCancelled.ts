import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { SubscriptionCancelledEmailProps } from "@/email-templates/subscription-cancelled";

export class SubscriptionCancelled extends EmailTemplatesCatalogEntry<SubscriptionCancelledEmailProps> {
  public id = "subscription-cancelled" as const satisfies string;

  public description =
    "Subscription cancellation confirmation email sent after a paid subscription has been cancelled. Uses a calm slate gradient header (no alarming red), an optional 'days of access left' countdown pill, a metadata table (plan, cancellation date, access-end date, refund amount), an optional 'You'll keep on the free tier' success-tinted callout (mirrors the @schemavaults/theme success palette), an optional reason-you-shared block echoing the customer's cancellation reason, a primary blue 'Reactivate' CTA pointing at the win-back flow, and a billing-settings + feedback footer. Props: { planName: string, accessEndsAt: string, reactivateUrl: string, recipientName?: string, cancellationEffectiveAt?: string, daysOfAccessRemaining?: number, manageBillingUrl?: string, feedbackUrl?: string, cancellationReason?: string, refundAmount?: string, retainedFeatures?: string[], productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(
    val: unknown,
  ): val is SubscriptionCancelledEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof SubscriptionCancelledEmailProps)[] =
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
    const optionalStringKeys: readonly (keyof SubscriptionCancelledEmailProps)[] =
      [
        "recipientName",
        "cancellationEffectiveAt",
        "manageBillingUrl",
        "feedbackUrl",
        "cancellationReason",
        "refundAmount",
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
      "daysOfAccessRemaining" in val &&
      typeof (val as Record<string, unknown>).daysOfAccessRemaining !==
        "undefined"
    ) {
      const daysValue = (val as Record<string, unknown>)
        .daysOfAccessRemaining;
      if (typeof daysValue !== "number") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'daysOfAccessRemaining' to be a number when provided, but got ${typeof daysValue}.`,
        );
      }
      if (!Number.isFinite(daysValue)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'daysOfAccessRemaining' to be a finite number when provided, but got ${daysValue}.`,
        );
      }
    }
    if (
      "retainedFeatures" in val &&
      typeof (val as Record<string, unknown>).retainedFeatures !== "undefined"
    ) {
      const retained = (val as Record<string, unknown>).retainedFeatures;
      if (!Array.isArray(retained)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'retainedFeatures' to be an array of strings when provided, but got ${typeof retained}.`,
        );
      }
      for (let i = 0; i < retained.length; i++) {
        if (typeof retained[i] !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected every entry of prop 'retainedFeatures' to be a string, but entry at index ${i} is ${typeof retained[i]}.`,
          );
        }
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
      typeof props.recipientName === "string" && props.recipientName.length > 0
        ? props.recipientName
        : "there";

    const lines: string[] = [
      `Your ${productName} ${props.planName} subscription has been cancelled.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We're confirming that your ${productName} ${props.planName} subscription has been cancelled. You'll keep full access through ${props.accessEndsAt}, after which your account will move to the free tier. Nothing you've built will be deleted.`,
      "",
      `Plan: ${props.planName}`,
    ];

    if (
      typeof props.cancellationEffectiveAt === "string" &&
      props.cancellationEffectiveAt.length > 0
    ) {
      lines.push(`Cancelled on: ${props.cancellationEffectiveAt}`);
    }
    lines.push(`Access ends: ${props.accessEndsAt}`);
    if (
      typeof props.refundAmount === "string" &&
      props.refundAmount.length > 0
    ) {
      lines.push(`Refund issued: ${props.refundAmount}`);
    }
    lines.push("");

    const retainedFeatures: string[] = Array.isArray(props.retainedFeatures)
      ? props.retainedFeatures.filter(
          (item): item is string => typeof item === "string" && item.length > 0,
        )
      : [];

    if (retainedFeatures.length > 0) {
      lines.push("You'll keep on the free tier:");
      for (const feature of retainedFeatures) {
        lines.push(`  - ${feature}`);
      }
      lines.push("");
    }

    if (
      typeof props.cancellationReason === "string" &&
      props.cancellationReason.length > 0
    ) {
      lines.push(`Reason you shared:`);
      lines.push(`  ${props.cancellationReason}`);
      lines.push("");
    }

    lines.push(
      `Changed your mind? Reactivate any time before ${props.accessEndsAt} and you won't lose a thing.`,
    );
    lines.push(`Reactivate ${props.planName}: ${props.reactivateUrl}`);
    lines.push("");

    if (
      typeof props.manageBillingUrl === "string" &&
      props.manageBillingUrl.length > 0
    ) {
      lines.push(
        `Need an invoice copy or to update billing details? Visit your billing settings: ${props.manageBillingUrl}`,
      );
    }
    if (typeof props.feedbackUrl === "string" && props.feedbackUrl.length > 0) {
      lines.push(
        `Mind telling us what we could do better? Share two minutes of feedback: ${props.feedbackUrl}`,
      );
    }
    lines.push("");

    lines.push(
      `Didn't mean to cancel? Reply to this email or reach ${supportEmail} and we'll get you sorted — usually within a business day. Thanks for being part of ${productName}.`,
    );

    return lines.join("\n");
  }
}

export default SubscriptionCancelled;
