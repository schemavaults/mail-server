import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { SubscriptionCancelledEmailProps } from "@/email-templates/subscription-cancelled";

export class SubscriptionCancelled extends EmailTemplatesCatalogEntry<SubscriptionCancelledEmailProps> {
  public id = "subscription-cancelled" as const satisfies string;

  public description =
    "Subscription cancellation confirmation email sent when a paid plan is canceled. Uses the SchemaVaults brand-blue gradient header, a 'Canceled' status pill, a metadata table (plan, canceled-on, access-until, optional refund), a 'what happens next' reassurance callout, an optional cancellation-reason callout (brand-red accent from the @schemavaults/theme `--schemavaults-brand-red` token), a prominent win-back reactivation CTA with fallback link, and optional data-export and feedback panels. Props: { planName: string, cancelledAt: string, accessUntil: string, reactivateUrl: string, recipientName?: string, cancellationReason?: string, refundAmount?: string, feedbackUrl?: string, exportDataUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(
    val: unknown,
  ): val is SubscriptionCancelledEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof SubscriptionCancelledEmailProps)[] =
      ["planName", "cancelledAt", "accessUntil", "reactivateUrl"];
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
        "cancellationReason",
        "refundAmount",
        "feedbackUrl",
        "exportDataUrl",
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
      typeof props.recipientName === "string" &&
      props.recipientName.length > 0
        ? props.recipientName
        : "there";

    const lines: string[] = [
      `Your ${productName} ${props.planName} subscription is canceled.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We've canceled your ${props.planName} subscription on ${productName}. You won't be billed again. There's nothing else you need to do.`,
      "",
      `Plan: ${props.planName}`,
      `Canceled on: ${props.cancelledAt}`,
      `Access until: ${props.accessUntil}`,
    ];

    if (
      typeof props.refundAmount === "string" &&
      props.refundAmount.length > 0
    ) {
      lines.push(`Refund: ${props.refundAmount}`);
    }
    lines.push("");

    lines.push("What happens next:");
    lines.push(
      `  You keep full access to ${props.planName} features until ${props.accessUntil}. After that, your account moves to the free tier — your schemas and vaults are preserved, but paid features and quotas no longer apply.`,
    );
    lines.push("");

    if (
      typeof props.cancellationReason === "string" &&
      props.cancellationReason.length > 0
    ) {
      lines.push(`Cancellation reason: ${props.cancellationReason}`);
      lines.push("");
    }

    lines.push(
      "Changed your mind? You can reactivate any time and pick up exactly where you left off.",
    );
    lines.push(`Reactivate ${props.planName}: ${props.reactivateUrl}`);
    lines.push("");

    if (
      typeof props.exportDataUrl === "string" &&
      props.exportDataUrl.length > 0
    ) {
      lines.push(
        `Want a copy of your data before access changes? Export your schemas and vaults: ${props.exportDataUrl}`,
      );
      lines.push("");
    }

    if (
      typeof props.feedbackUrl === "string" &&
      props.feedbackUrl.length > 0
    ) {
      lines.push(
        `We'd love to learn why you left — it takes under a minute: ${props.feedbackUrl}`,
      );
      lines.push("");
    }

    lines.push(
      `Didn't request this cancellation, or think it's a mistake? Contact us right away at ${supportEmail} and we'll sort it out.`,
    );

    return lines.join("\n");
  }
}

export default SubscriptionCancelled;
