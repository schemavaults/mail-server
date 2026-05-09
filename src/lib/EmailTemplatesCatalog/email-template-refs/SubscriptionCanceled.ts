import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { SubscriptionCanceledEmailProps } from "@/email-templates/subscription-canceled";

export class SubscriptionCanceled extends EmailTemplatesCatalogEntry<SubscriptionCanceledEmailProps> {
  public id = "subscription-canceled" as const satisfies string;

  public description =
    "Subscription cancellation confirmation email sent after a paid plan is canceled. Uses the SchemaVaults brand gradient header, a metadata table (plan, canceled date, access-until date, final charge), an optional 'Reason on file' callout, a primary 'Reactivate subscription' CTA, an optional feedback survey CTA, and a support fallback for unauthorized cancellations. Props: { planName: string, reactivateUrl: string, recipientName?: string, canceledAt?: string, accessUntil?: string, finalChargeAmount?: string, cancellationReason?: string, feedbackUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(
    val: unknown,
  ): val is SubscriptionCanceledEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof SubscriptionCanceledEmailProps)[] =
      ["planName", "reactivateUrl"];
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
        "accessUntil",
        "finalChargeAmount",
        "cancellationReason",
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
      typeof props.recipientName === "string" &&
      props.recipientName.length > 0
        ? props.recipientName
        : "there";

    const lines: string[] = [
      `Your ${productName} ${props.planName} subscription has been canceled.`,
      "",
      `Hi ${greetingName},`,
      "",
    ];

    if (
      typeof props.accessUntil === "string" &&
      props.accessUntil.length > 0
    ) {
      lines.push(
        `We've canceled your ${props.planName} subscription on ${productName}. You'll keep full access through ${props.accessUntil}, after which your account will switch to the free tier. No further charges will be made.`,
      );
    } else {
      lines.push(
        `We've canceled your ${props.planName} subscription on ${productName}. Your account has been switched to the free tier effective immediately. No further charges will be made.`,
      );
    }
    lines.push("");

    lines.push(`Plan: ${props.planName}`);
    if (typeof props.canceledAt === "string" && props.canceledAt.length > 0) {
      lines.push(`Canceled on: ${props.canceledAt}`);
    }
    if (
      typeof props.accessUntil === "string" &&
      props.accessUntil.length > 0
    ) {
      lines.push(`Access until: ${props.accessUntil}`);
    }
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
      lines.push("Reason on file:");
      lines.push(`  ${props.cancellationReason}`);
      lines.push("");
    }

    lines.push("Changed your mind?");
    lines.push(
      "You can reactivate your subscription at any time. Your schemas, vaults, and team settings are preserved.",
    );
    lines.push(`Reactivate: ${props.reactivateUrl}`);
    lines.push("");

    if (typeof props.feedbackUrl === "string" && props.feedbackUrl.length > 0) {
      lines.push(
        `We'd love to learn what didn't work. Share feedback: ${props.feedbackUrl}`,
      );
      lines.push("");
    }

    lines.push(
      `Didn't request this cancellation? Reach us right away at ${supportEmail} and we'll restore your subscription.`,
    );

    return lines.join("\n");
  }
}

export default SubscriptionCanceled;
