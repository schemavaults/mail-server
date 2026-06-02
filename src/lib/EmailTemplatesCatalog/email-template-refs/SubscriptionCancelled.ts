import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { SubscriptionCancelledEmailProps } from "@/email-templates/subscription-cancelled";

export class SubscriptionCancelled extends EmailTemplatesCatalogEntry<SubscriptionCancelledEmailProps> {
  public id = "subscription-cancelled" as const satisfies string;

  public description =
    "Subscription cancellation confirmation email sent immediately after a paid plan is cancelled. Uses a calm slate gradient header (deliberately avoiding the destructive red token so the email reads as confirmation, not alarm), a 'You still have access' callout that emphasizes the access end date, a metadata table (plan, cancellation date, access end, refund), a primary reactivation CTA with a visible fallback link, an optional feedback callout to learn why the customer left, and an optional billing-portal link for invoices and history. Props: { planName: string, accessEndsAt: string, reactivateUrl: string, customerName?: string, cancellationDate?: string, refundAmount?: string, feedbackUrl?: string, billingPortalUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is SubscriptionCancelledEmailProps {
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
        "customerName",
        "cancellationDate",
        "refundAmount",
        "feedbackUrl",
        "billingPortalUrl",
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
      `We're confirming that your ${props.planName} subscription on ${productName} has been cancelled. You'll keep full access to all paid features until ${props.accessEndsAt}, after which your account will move to the free tier. No further charges will be made.`,
      "",
      `You still have access:`,
      `  Until ${props.accessEndsAt}, everything keeps working exactly as it does today — vaults, schemas, API keys, integrations, and team members. Export any data you'd like to keep before that date.`,
      "",
      `Plan: ${props.planName}`,
    ];

    if (
      typeof props.cancellationDate === "string" &&
      props.cancellationDate.length > 0
    ) {
      lines.push(`Cancelled: ${props.cancellationDate}`);
    }
    lines.push(`Access ends: ${props.accessEndsAt}`);
    if (
      typeof props.refundAmount === "string" &&
      props.refundAmount.length > 0
    ) {
      lines.push(`Refund: ${props.refundAmount}`);
    }
    lines.push("");

    lines.push(
      `Changed your mind? You can reactivate any time before ${props.accessEndsAt} and pick up exactly where you left off — no data loss, no reconfiguration.`,
    );
    lines.push(`Reactivate ${props.planName}: ${props.reactivateUrl}`);
    lines.push("");

    if (
      typeof props.feedbackUrl === "string" &&
      props.feedbackUrl.length > 0
    ) {
      lines.push(
        `Got a minute? We'd love to know what we could have done better. Share feedback: ${props.feedbackUrl}`,
      );
      lines.push("");
    }

    if (
      typeof props.billingPortalUrl === "string" &&
      props.billingPortalUrl.length > 0
    ) {
      lines.push(
        `Need an invoice or payment history? Visit your billing portal: ${props.billingPortalUrl}`,
      );
      lines.push("");
    }

    lines.push(
      `Thanks for trying ${productName}. If you didn't request this cancellation, or if anything looks off, contact us right away at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default SubscriptionCancelled;
