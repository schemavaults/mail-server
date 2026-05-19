import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { SubscriptionCanceledEmailProps } from "@/email-templates/subscription-canceled";

export class SubscriptionCanceled extends EmailTemplatesCatalogEntry<SubscriptionCanceledEmailProps> {
  public id = "subscription-canceled" as const satisfies string;

  public description =
    "Subscription cancellation confirmation email sent immediately after a paid subscription is canceled. Uses a neutral slate gradient header (mirroring the @schemavaults/theme neutral `--foreground`/`--muted-foreground` token family) with a 'Canceled' status pill, a metadata table (plan, canceled-on date, access-end date, optional refund), an optional 'reason you told us' callout, a 'what happens to your data' panel that adapts to an optional retention window, a brand-blue one-click reactivation CTA with a visible fallback link, and optional feedback and billing-settings links. Props: { planName: string, canceledAt: string, accessEndsAt: string, reactivateUrl: string, recipientName?: string, cancellationReason?: string, refundAmount?: string, dataRetentionDays?: number, feedbackUrl?: string, manageBillingUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is SubscriptionCanceledEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof SubscriptionCanceledEmailProps)[] =
      ["planName", "canceledAt", "accessEndsAt", "reactivateUrl"];
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
        "cancellationReason",
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
      typeof val.dataRetentionDays !== "undefined"
    ) {
      if (typeof val.dataRetentionDays !== "number") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'dataRetentionDays' to be a number when provided, but got ${typeof val.dataRetentionDays}.`,
        );
      }
      if (!Number.isFinite(val.dataRetentionDays)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'dataRetentionDays' to be a finite number, but got ${val.dataRetentionDays}.`,
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
    const dataRetentionDays: number | undefined =
      typeof props.dataRetentionDays === "number" &&
      Number.isFinite(props.dataRetentionDays) &&
      props.dataRetentionDays > 0
        ? Math.floor(props.dataRetentionDays)
        : undefined;

    const lines: string[] = [
      `Your ${productName} ${props.planName} subscription has been canceled.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We've canceled your ${props.planName} subscription to ${productName}. You won't be charged again. Your plan stays active until ${props.accessEndsAt} — after that your account moves to the free tier.`,
      "",
      `Plan: ${props.planName}`,
      `Canceled on: ${props.canceledAt}`,
      `Access ends: ${props.accessEndsAt}`,
    ];

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
      lines.push("Reason you told us:");
      lines.push(`  ${props.cancellationReason}`);
      lines.push("");
    }

    lines.push("What happens to your data:");
    lines.push(
      dataRetentionDays
        ? `  Your schemas and vault history are kept read-only for ${dataRetentionDays} day${
            dataRetentionDays === 1 ? "" : "s"
          } after ${props.accessEndsAt}. Reactivate within that window and everything picks up exactly where you left off. Export anytime before then.`
        : `  Your schemas and vault history are preserved on the free tier within its limits. Reactivate anytime to restore full access — nothing is deleted without advance notice.`,
    );
    lines.push("");

    lines.push(
      `Changed your mind? Reactivate ${props.planName} instantly: ${props.reactivateUrl}`,
    );
    lines.push("");

    if (typeof props.feedbackUrl === "string" && props.feedbackUrl.length > 0) {
      lines.push(
        `Got a minute? Tell us why you left — it shapes what we build next: ${props.feedbackUrl}`,
      );
      lines.push("");
    }

    if (
      typeof props.manageBillingUrl === "string" &&
      props.manageBillingUrl.length > 0
    ) {
      lines.push(
        `View invoices, update payment details, or pick a different plan in your billing settings: ${props.manageBillingUrl}`,
      );
      lines.push("");
    }

    lines.push(
      `Didn't request this cancellation? Contact us right away at ${supportEmail} and we'll help restore your subscription.`,
    );

    return lines.join("\n");
  }
}

export default SubscriptionCanceled;
