import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { SubscriptionCanceledEmailProps } from "@/email-templates/subscription-canceled";

export class SubscriptionCanceled extends EmailTemplatesCatalogEntry<SubscriptionCanceledEmailProps> {
  public id = "subscription-canceled" as const satisfies string;

  public description =
    "Subscription cancellation confirmation email sent when a user cancels a paid plan. Uses a calm slate gradient header (cancellation is a neutral, factual confirmation — not a problem), a metadata table (plan, cancellation date, access-ends date, final charge), an optional 'reason you shared' callout, an optional 'still available on the free tier' feature list, a brand-blue reactivate CTA, and an optional feedback link. Props: { planName: string, cancellationDate: string, accessEndsAt: string, recipientName?: string, finalChargeAmount?: string, cancellationReason?: string, reactivateUrl?: string, feedbackUrl?: string, manageBillingUrl?: string, retainedFeatures?: string[], productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is SubscriptionCanceledEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof SubscriptionCanceledEmailProps)[] =
      ["planName", "cancellationDate", "accessEndsAt"];
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
        "finalChargeAmount",
        "cancellationReason",
        "reactivateUrl",
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
      "retainedFeatures" in val &&
      typeof (val as Record<string, unknown>).retainedFeatures !== "undefined"
    ) {
      const arr = (val as Record<string, unknown>).retainedFeatures;
      if (!Array.isArray(arr)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'retainedFeatures' to be an array of strings when provided, but got ${typeof arr}.`,
        );
      }
      for (const item of arr) {
        if (typeof item !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected every entry of 'retainedFeatures' to be a string, but found ${typeof item}.`,
          );
        }
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

    const lines: string[] = [
      `Your ${props.planName} subscription on ${productName} has been canceled.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We've received your request to cancel your ${props.planName} subscription. You'll continue to have full access until ${props.accessEndsAt}, after which your account will switch to the free tier — your data and projects will remain intact.`,
      "",
      `Plan: ${props.planName}`,
      `Canceled on: ${props.cancellationDate}`,
      `Access ends: ${props.accessEndsAt}`,
    ];

    if (
      typeof props.finalChargeAmount === "string" &&
      props.finalChargeAmount.length > 0
    ) {
      lines.push(`Final charge: ${props.finalChargeAmount}`);
    }
    lines.push("");

    if (
      typeof props.cancellationReason === "string" &&
      props.cancellationReason.length > 0
    ) {
      lines.push("Reason you shared:");
      lines.push(`  ${props.cancellationReason}`);
      lines.push("");
    }

    const retainedFeatures: string[] = Array.isArray(props.retainedFeatures)
      ? props.retainedFeatures.filter(
          (item): item is string => typeof item === "string" && item.length > 0,
        )
      : [];
    if (retainedFeatures.length > 0) {
      lines.push("Still available on the free tier:");
      for (const feature of retainedFeatures) {
        lines.push(`  - ${feature}`);
      }
      lines.push("");
    }

    if (
      typeof props.reactivateUrl === "string" &&
      props.reactivateUrl.length > 0
    ) {
      lines.push(
        `Changed your mind? Reactivate any time before ${props.accessEndsAt}:`,
      );
      lines.push(`  ${props.reactivateUrl}`);
      lines.push("");
    }

    if (typeof props.feedbackUrl === "string" && props.feedbackUrl.length > 0) {
      lines.push(
        `We'd love to know what went wrong — share two minutes of feedback:`,
      );
      lines.push(`  ${props.feedbackUrl}`);
      lines.push("");
    }

    if (
      typeof props.manageBillingUrl === "string" &&
      props.manageBillingUrl.length > 0
    ) {
      lines.push(
        `Need to download invoices or update payment details? Visit your billing settings:`,
      );
      lines.push(`  ${props.manageBillingUrl}`);
      lines.push("");
    }

    lines.push(
      `Didn't request this cancellation? Reply to this email immediately or reach us at ${supportEmail} and we'll restore your subscription right away.`,
    );

    return lines.join("\n");
  }
}

export default SubscriptionCanceled;
