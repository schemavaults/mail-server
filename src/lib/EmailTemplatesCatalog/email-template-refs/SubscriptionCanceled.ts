import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { SubscriptionCanceledEmailProps } from "@/email-templates/subscription-canceled";

export class SubscriptionCanceled extends EmailTemplatesCatalogEntry<SubscriptionCanceledEmailProps> {
  public id = "subscription-canceled" as const satisfies string;

  public description =
    "Subscription cancellation confirmation email sent after a paid subscription is canceled. Confirms the request, spells out the access-ends date, includes a metadata table (plan, billing cycle, cancellation date, access-ends date, refund status), an amber 'what happens next' callout (downgrade to free tier, data stays intact), a primary reactivate CTA, an optional feedback link, and a fraud-check footer. Uses the SchemaVaults brand-blue gradient header. Props: { planName: string, accessEndsAt: string, reactivateUrl: string, recipientName?: string, canceledAt?: string, billingCycle?: string, amountRefunded?: string, feedbackUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is SubscriptionCanceledEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof SubscriptionCanceledEmailProps)[] =
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
    const optionalStringKeys: readonly (keyof SubscriptionCanceledEmailProps)[] =
      [
        "recipientName",
        "canceledAt",
        "billingCycle",
        "amountRefunded",
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
      `Your ${productName} ${props.planName} subscription has been canceled.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We've received your cancellation request for the ${props.planName} plan on ${productName}. You'll continue to have full access to all paid features until ${props.accessEndsAt} — no further charges will be made.`,
      "",
      "What happens next:",
      `  After ${props.accessEndsAt}, your account will be downgraded to the free tier. Your data stays safe — schemas and vaults remain readable, but paid features (team collaboration, private vaults, extended history) will be paused until you reactivate.`,
      "",
      `Plan: ${props.planName}`,
    ];

    if (
      typeof props.billingCycle === "string" &&
      props.billingCycle.length > 0
    ) {
      lines.push(`Billing cycle: ${props.billingCycle}`);
    }
    if (typeof props.canceledAt === "string" && props.canceledAt.length > 0) {
      lines.push(`Canceled on: ${props.canceledAt}`);
    }
    lines.push(`Access ends: ${props.accessEndsAt}`);
    if (
      typeof props.amountRefunded === "string" &&
      props.amountRefunded.length > 0
    ) {
      lines.push(`Refund: ${props.amountRefunded}`);
    }

    lines.push("");
    lines.push(
      `Changed your mind? You can reactivate at any time before ${props.accessEndsAt} and pick up right where you left off:`,
    );
    lines.push(`  ${props.reactivateUrl}`);
    lines.push("");

    if (
      typeof props.feedbackUrl === "string" &&
      props.feedbackUrl.length > 0
    ) {
      lines.push(
        `Before you go — would you share what made you cancel? Two minutes of your feedback helps us make ${productName} better for everyone:`,
      );
      lines.push(`  ${props.feedbackUrl}`);
      lines.push("");
    }

    lines.push(
      `Didn't cancel this subscription? Contact us right away at ${supportEmail} so we can secure your account.`,
    );

    return lines.join("\n");
  }
}

export default SubscriptionCanceled;
