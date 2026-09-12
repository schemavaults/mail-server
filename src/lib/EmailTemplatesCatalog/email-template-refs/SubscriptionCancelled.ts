import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import type { SubscriptionCancelledEmailProps } from "@/email-templates/subscription-cancelled";

export class SubscriptionCancelled extends EmailTemplatesCatalogEntry<SubscriptionCancelledEmailProps> {
  public id = "subscription-cancelled" as const satisfies string;

  public description =
    "Subscription cancellation confirmation sent when a paid plan is cancelled, closing the billing lifecycle alongside 'trial-ending', 'payment-receipt' and 'payment-failed'. Uses a calm neutral/slate gradient header (the theme's neutral ramp rather than a celebratory accent) with an 'access until' pill, a billing metadata table (plan, billing interval, cancellation date, access end, final invoice, reason), a 'What happens next' checklist that falls back to sensible defaults derived from the other props, optional data-export and cancellation-feedback panels, and a brand-accent win-back CTA to reactivate. Props: { planName: string, accessEndsAt: string, reactivateUrl: string, recipientName?: string, cancelledAt?: string, billingInterval?: string, finalInvoiceAmount?: string, cancellationReason?: string, dataRetentionDays?: number, dataExportUrl?: string, feedbackUrl?: string, whatHappensNext?: string[], productName?: string, supportEmail?: string }" as const satisfies string;

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
        "recipientName",
        "cancelledAt",
        "billingInterval",
        "finalInvoiceAmount",
        "cancellationReason",
        "dataExportUrl",
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
    if ("whatHappensNext" in val && typeof val.whatHappensNext !== "undefined") {
      if (!Array.isArray(val.whatHappensNext)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'whatHappensNext' to be an array of strings when provided, but got ${typeof val.whatHappensNext}.`,
        );
      }
      for (let i = 0; i < val.whatHappensNext.length; i++) {
        if (typeof val.whatHappensNext[i] !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected every entry of prop 'whatHappensNext' to be a string, but entry at index ${i} is ${typeof val.whatHappensNext[i]}.`,
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
    const brand = getEmailBrand();
    const productName: string =
      typeof props.productName === "string" && props.productName.length > 0
        ? props.productName
        : brand.productName;
    const supportEmail: string =
      typeof props.supportEmail === "string" && props.supportEmail.length > 0
        ? props.supportEmail
        : brand.supportEmail;
    const greetingName: string =
      typeof props.recipientName === "string" && props.recipientName.length > 0
        ? props.recipientName
        : "there";
    const dataRetentionDays: number | undefined =
      typeof props.dataRetentionDays === "number" &&
      Number.isFinite(props.dataRetentionDays)
        ? Math.max(0, Math.floor(props.dataRetentionDays))
        : undefined;

    const providedNextSteps: string[] = Array.isArray(props.whatHappensNext)
      ? props.whatHappensNext.filter(
          (item): item is string => typeof item === "string" && item.length > 0,
        )
      : [];
    const defaultNextSteps: string[] = [
      `Your ${props.planName} features stay active until ${props.accessEndsAt}.`,
      "You won't be charged again — no further invoices will be issued.",
      typeof dataRetentionDays === "number"
        ? `Your data is kept for ${dataRetentionDays} day${
            dataRetentionDays === 1 ? "" : "s"
          } after your access ends, then permanently deleted.`
        : "Your account stays available on the free plan — nothing is deleted today.",
      "You can reactivate at any time and pick up exactly where you left off.",
    ];
    const nextSteps: string[] =
      providedNextSteps.length > 0 ? providedNextSteps : defaultNextSteps;

    const lines: string[] = [
      `Your ${props.planName} subscription has been cancelled.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We've cancelled your ${props.planName} subscription on ${productName}, so you won't be billed again. You keep full access until ${props.accessEndsAt} — nothing changes before then.`,
      "",
      `Plan: ${props.planName}`,
    ];

    if (
      typeof props.billingInterval === "string" &&
      props.billingInterval.length > 0
    ) {
      lines.push(`Billing: ${props.billingInterval}`);
    }
    if (typeof props.cancelledAt === "string" && props.cancelledAt.length > 0) {
      lines.push(`Cancelled on: ${props.cancelledAt}`);
    }
    lines.push(`Access ends: ${props.accessEndsAt}`);
    if (
      typeof props.finalInvoiceAmount === "string" &&
      props.finalInvoiceAmount.length > 0
    ) {
      lines.push(`Final invoice: ${props.finalInvoiceAmount}`);
    }
    if (
      typeof props.cancellationReason === "string" &&
      props.cancellationReason.length > 0
    ) {
      lines.push(`Reason given: ${props.cancellationReason}`);
    }
    lines.push("");

    lines.push("What happens next:");
    for (const step of nextSteps) {
      lines.push(`  - ${step}`);
    }
    lines.push("");

    lines.push(
      `Changed your mind? Reactivating restores your ${props.planName} plan and every project exactly as you left it.`,
    );
    lines.push(`Reactivate ${props.planName}: ${props.reactivateUrl}`);
    lines.push("");

    if (
      typeof props.dataExportUrl === "string" &&
      props.dataExportUrl.length > 0
    ) {
      lines.push(
        typeof dataRetentionDays === "number"
          ? `Want to take your data with you? Export everything any time in the next ${dataRetentionDays} day${
              dataRetentionDays === 1 ? "" : "s"
            }: ${props.dataExportUrl}`
          : `Want to take your data with you? Export everything from your account settings: ${props.dataExportUrl}`,
      );
      lines.push("");
    }

    if (typeof props.feedbackUrl === "string" && props.feedbackUrl.length > 0) {
      lines.push(
        `Mind telling us why you left? Two minutes of feedback genuinely shapes what we build next: ${props.feedbackUrl}`,
      );
      lines.push("");
    }

    lines.push(
      `Didn't request this cancellation, or think it was made in error? Contact us right away at ${supportEmail} and we'll restore your subscription.`,
    );

    return lines.join("\n");
  }
}

export default SubscriptionCancelled;
