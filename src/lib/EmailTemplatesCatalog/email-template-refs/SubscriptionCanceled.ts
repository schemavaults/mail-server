import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { SubscriptionCanceledEmailProps } from "@/email-templates/subscription-canceled";

export class SubscriptionCanceled extends EmailTemplatesCatalogEntry<SubscriptionCanceledEmailProps> {
  public id = "subscription-canceled" as const satisfies string;

  public description =
    "Subscription cancellation confirmation email sent when a user cancels their paid subscription. Uses a calm neutral slate gradient header (distinct from the brand-blue transactional and amber warning headers), a metadata table (plan, cancellation date, access-end date, refund, reason), an optional data-retention callout, and a primary reactivation CTA inside a soft brand-accent panel. Props: { planName: string, serviceEndsAt: string, reactivateUrl: string, recipientName?: string, cancellationEffectiveAt?: string, refundAmount?: string, manageBillingUrl?: string, dataRetentionDays?: number, cancellationReason?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is SubscriptionCanceledEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof SubscriptionCanceledEmailProps)[] =
      ["planName", "serviceEndsAt", "reactivateUrl"];
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
        "cancellationEffectiveAt",
        "refundAmount",
        "manageBillingUrl",
        "cancellationReason",
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
      typeof (val as Record<string, unknown>).dataRetentionDays !==
        "undefined" &&
      typeof (val as Record<string, unknown>).dataRetentionDays !== "number"
    ) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected optional prop 'dataRetentionDays' to be a number when provided, but got ${typeof (val as Record<string, unknown>).dataRetentionDays}.`,
      );
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
      `Your ${props.planName} subscription has been canceled.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We've processed your cancellation request for ${props.planName}. You'll keep full access to ${productName} until ${props.serviceEndsAt} — no further charges will be made after that date.`,
      "",
      `Plan: ${props.planName}`,
    ];

    if (
      typeof props.cancellationEffectiveAt === "string" &&
      props.cancellationEffectiveAt.length > 0
    ) {
      lines.push(`Canceled on: ${props.cancellationEffectiveAt}`);
    }
    lines.push(`Access ends: ${props.serviceEndsAt}`);
    if (
      typeof props.refundAmount === "string" &&
      props.refundAmount.length > 0
    ) {
      lines.push(`Refund: ${props.refundAmount}`);
    }
    if (
      typeof props.cancellationReason === "string" &&
      props.cancellationReason.length > 0
    ) {
      lines.push(`Reason: ${props.cancellationReason}`);
    }

    if (
      typeof props.dataRetentionDays === "number" &&
      Number.isFinite(props.dataRetentionDays) &&
      props.dataRetentionDays > 0
    ) {
      const days = Math.floor(props.dataRetentionDays);
      lines.push("");
      lines.push("What happens to your data:");
      lines.push(
        `  Your vaults, schemas, and team data will be retained in read-only mode for ${days} day${days === 1 ? "" : "s"} after ${props.serviceEndsAt}. Reactivate within that window to resume exactly where you left off — after that, your data will be permanently deleted.`,
      );
    }

    lines.push("");
    lines.push(
      "Changed your mind? You can reactivate any time before your access ends:",
    );
    lines.push(`  ${props.reactivateUrl}`);

    if (
      typeof props.manageBillingUrl === "string" &&
      props.manageBillingUrl.length > 0
    ) {
      lines.push("");
      lines.push(
        `Review past invoices and download receipts in your billing settings: ${props.manageBillingUrl}`,
      );
    }

    lines.push("");
    lines.push(
      `Was something missing or did you run into a problem? Reply to this email or reach us at ${supportEmail}. Thanks for trying ${productName}.`,
    );

    return lines.join("\n");
  }
}

export default SubscriptionCanceled;
