import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import {
  SUBSCRIPTION_CHANGE_KINDS,
  type SubscriptionChangeKind,
  type SubscriptionChangedEmailProps,
} from "@/email-templates/subscription-changed";

export class SubscriptionChanged extends EmailTemplatesCatalogEntry<SubscriptionChangedEmailProps> {
  public id = "subscription-changed" as const satisfies string;

  public description =
    "Subscription lifecycle email confirming a plan upgrade, downgrade, cancellation, or reactivation. The 'changeKind' prop drives a semantic accent palette (emerald upgrade, amber downgrade, red cancellation, brand-accent reactivation) applied to the gradient header, the previous-plan → new-plan transition card, the billing-note callout, and the CTA. Also renders a metadata table (effective/cancelled date, access end, next billing date, next charge) and an optional plan-highlights checklist. Props: { changeKind: \"upgrade\" | \"downgrade\" | \"cancellation\" | \"reactivation\", previousPlanName: string, newPlanName: string, effectiveDate: string, customerName?: string, previousPlanPrice?: string, newPlanPrice?: string, nextBillingDate?: string, nextChargeAmount?: string, accessEndsAt?: string, prorationNote?: string, planHighlights?: string[], manageSubscriptionUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is SubscriptionChangedEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof SubscriptionChangedEmailProps)[] =
      ["changeKind", "previousPlanName", "newPlanName", "effectiveDate"];
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
    const changeKind = (val as Record<string, unknown>)
      .changeKind as SubscriptionChangeKind;
    if (!SUBSCRIPTION_CHANGE_KINDS.includes(changeKind)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'changeKind' to be one of ${SUBSCRIPTION_CHANGE_KINDS.map(
          (kind) => `'${kind}'`,
        ).join(", ")}, but got '${changeKind}'.`,
      );
    }
    const optionalStringKeys: readonly (keyof SubscriptionChangedEmailProps)[] =
      [
        "customerName",
        "previousPlanPrice",
        "newPlanPrice",
        "nextBillingDate",
        "nextChargeAmount",
        "accessEndsAt",
        "prorationNote",
        "manageSubscriptionUrl",
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
      "planHighlights" in val &&
      typeof (val as Record<string, unknown>).planHighlights !== "undefined"
    ) {
      const highlights = (val as Record<string, unknown>).planHighlights;
      if (!Array.isArray(highlights)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'planHighlights' to be an array of strings when provided, but got ${typeof highlights}.`,
        );
      }
      highlights.forEach((highlight, idx) => {
        if (typeof highlight !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'planHighlights[${idx}]' to be a string, but got ${highlight === null ? "null" : typeof highlight}.`,
          );
        }
      });
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<
    FC<SubscriptionChangedEmailProps>
  > {
    const component = await import(
      "@/email-templates/subscription-changed"
    ).then((mod) => mod.default);
    return component;
  }

  public async renderPlainTextVersion(
    props: SubscriptionChangedEmailProps,
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
      typeof props.customerName === "string" && props.customerName.length > 0
        ? props.customerName
        : "there";
    const manageSubscriptionUrl: string =
      typeof props.manageSubscriptionUrl === "string" &&
      props.manageSubscriptionUrl.length > 0
        ? props.manageSubscriptionUrl
        : brand.url;
    const changeKind: SubscriptionChangeKind =
      SUBSCRIPTION_CHANGE_KINDS.includes(props.changeKind)
        ? props.changeKind
        : "downgrade";

    const headlines: Record<SubscriptionChangeKind, string> = {
      upgrade: `You're now on the ${props.newPlanName} plan.`,
      downgrade: `Your plan changes to ${props.newPlanName}.`,
      cancellation: `Your ${props.previousPlanName} subscription has been cancelled.`,
      reactivation: `Welcome back to ${props.newPlanName}.`,
    };
    const intros: Record<SubscriptionChangeKind, string> = {
      upgrade: `Your ${productName} subscription was upgraded from ${props.previousPlanName} to ${props.newPlanName}. The new limits and features are already active on your account.`,
      downgrade: `Your ${productName} subscription is moving from ${props.previousPlanName} down to ${props.newPlanName}. Nothing changes until the switch takes effect, so you keep your current plan until then.`,
      cancellation: `We've cancelled your ${props.previousPlanName} subscription on ${productName}. You won't be billed again, and you can reactivate at any time without losing your account.`,
      reactivation: `Your ${productName} subscription is active again on the ${props.newPlanName} plan. Everything picks up right where you left off.`,
    };
    const highlightsLabels: Record<SubscriptionChangeKind, string> = {
      upgrade: "What you just unlocked:",
      downgrade: "What changes on your account:",
      cancellation: "What you'll lose access to:",
      reactivation: "What's included again:",
    };
    const ctaLabels: Record<SubscriptionChangeKind, string> = {
      upgrade: "Manage subscription",
      downgrade: "Manage subscription",
      cancellation: "Reactivate subscription",
      reactivation: "Manage subscription",
    };

    const lines: string[] = [
      headlines[changeKind],
      "",
      `Hi ${greetingName},`,
      "",
      intros[changeKind],
      "",
      `Previous plan: ${props.previousPlanName}${
        typeof props.previousPlanPrice === "string" &&
        props.previousPlanPrice.length > 0
          ? ` (${props.previousPlanPrice})`
          : ""
      }`,
      `${changeKind === "cancellation" ? "After cancellation" : "New plan"}: ${
        props.newPlanName
      }${
        typeof props.newPlanPrice === "string" && props.newPlanPrice.length > 0
          ? ` (${props.newPlanPrice})`
          : ""
      }`,
      "",
      `${changeKind === "cancellation" ? "Cancelled on" : "Effective"}: ${props.effectiveDate}`,
    ];

    if (
      typeof props.accessEndsAt === "string" &&
      props.accessEndsAt.length > 0
    ) {
      lines.push(`Access ends: ${props.accessEndsAt}`);
    }
    if (
      typeof props.nextBillingDate === "string" &&
      props.nextBillingDate.length > 0
    ) {
      lines.push(`Next billing date: ${props.nextBillingDate}`);
    }
    if (
      typeof props.nextChargeAmount === "string" &&
      props.nextChargeAmount.length > 0
    ) {
      lines.push(`Next charge: ${props.nextChargeAmount}`);
    }

    if (
      typeof props.prorationNote === "string" &&
      props.prorationNote.length > 0
    ) {
      lines.push("");
      lines.push("Billing note:");
      lines.push(`  ${props.prorationNote}`);
    }

    const planHighlights: string[] = Array.isArray(props.planHighlights)
      ? props.planHighlights.filter(
          (highlight): highlight is string =>
            typeof highlight === "string" && highlight.length > 0,
        )
      : [];
    if (planHighlights.length > 0) {
      lines.push("");
      lines.push(highlightsLabels[changeKind]);
      for (const highlight of planHighlights) {
        lines.push(`  - ${highlight}`);
      }
    }

    lines.push("");
    lines.push(`${ctaLabels[changeKind]}: ${manageSubscriptionUrl}`);
    lines.push("");
    lines.push(
      `Didn't make this change? Contact us right away at ${supportEmail} and we'll sort it out.`,
    );

    return lines.join("\n");
  }
}

export default SubscriptionChanged;
