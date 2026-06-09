import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { SubscriptionCanceledEmailProps } from "@/email-templates/subscription-canceled";

export class SubscriptionCanceled extends EmailTemplatesCatalogEntry<SubscriptionCanceledEmailProps> {
  public id = "subscription-canceled" as const satisfies string;

  public description =
    "Subscription cancellation confirmation email sent after a user cancels a paid plan. Confirms the cancellation, communicates the access-until date so the user knows when paid features lapse, optionally surfaces a prorated refund line, offers an easy reactivation CTA, and (when a feedbackUrl is supplied) invites a short churn survey. Uses a neutral slate gradient header (vs. the brand-blue invite header / amber trial-ending header) to read as confirming rather than alarming, with the SchemaVaults brand-blue gradient reserved for the primary reactivate CTA. Props: { planName: string, accessUntil: string, reactivateUrl: string, recipientName?: string, canceledAt?: string, refundAmount?: string, manageBillingUrl?: string, feedbackUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is SubscriptionCanceledEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof SubscriptionCanceledEmailProps)[] =
      ["planName", "accessUntil", "reactivateUrl"];
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
        "refundAmount",
        "manageBillingUrl",
        "feedbackUrl",
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
      `Your ${productName} ${props.planName} subscription is canceled.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We've processed your cancellation for ${productName} ${props.planName}. You'll keep full access through ${props.accessUntil}, after which your account will revert to the free tier. Your data stays put — nothing is deleted.`,
      "",
      `Plan: ${props.planName}`,
      `Access until: ${props.accessUntil}`,
    ];

    if (typeof props.canceledAt === "string" && props.canceledAt.length > 0) {
      lines.push(`Canceled on: ${props.canceledAt}`);
    }
    if (
      typeof props.refundAmount === "string" &&
      props.refundAmount.length > 0
    ) {
      lines.push(`Refund: ${props.refundAmount}`);
    }

    lines.push("");
    lines.push(
      `Changed your mind? You can reactivate any time before ${props.accessUntil} and pick up exactly where you left off — no setup, no data migration.`,
    );
    lines.push("");
    lines.push(`Reactivate ${props.planName}: ${props.reactivateUrl}`);

    if (
      typeof props.manageBillingUrl === "string" &&
      props.manageBillingUrl.length > 0
    ) {
      lines.push("");
      lines.push(
        `Need an invoice, want to download your data, or switch to a different plan? Visit your billing settings: ${props.manageBillingUrl}`,
      );
    }

    if (typeof props.feedbackUrl === "string" && props.feedbackUrl.length > 0) {
      lines.push("");
      lines.push(
        `Mind sharing why you canceled? It takes about 60 seconds and helps us improve: ${props.feedbackUrl}`,
      );
    }

    lines.push("");
    lines.push(
      `Didn't cancel this subscription? Reach us at ${supportEmail} and we'll sort it out right away.`,
    );

    return lines.join("\n");
  }
}

export default SubscriptionCanceled;
