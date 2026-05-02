import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { TrialEndingEmailProps } from "@/email-templates/trial-ending";

export class TrialEnding extends EmailTemplatesCatalogEntry<TrialEndingEmailProps> {
  public id = "trial-ending" as const satisfies string;

  public description =
    "Trial-ending reminder email sent before a free or paid trial expires. Uses an amber/warning gradient header (mirroring the @schemavaults/theme `--warning` token), a 'days left' countdown pill, a metadata table (current plan, trial end, upgrade plan price), an optional 'features at risk' callout listing what the user will lose, a primary upgrade CTA, and an optional billing-management link. Props: { daysRemaining: number, trialEndsAt: string, upgradeUrl: string, recipientName?: string, currentPlan?: string, upgradePlanName?: string, upgradePlanPrice?: string, manageBillingUrl?: string, featuresAtRisk?: string[], productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is TrialEndingEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    if (!("daysRemaining" in val)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' is missing required prop 'daysRemaining' (expected finite number).`,
      );
    }
    if (typeof val.daysRemaining !== "number") {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'daysRemaining' to be a number, but got ${typeof val.daysRemaining}.`,
      );
    }
    if (!Number.isFinite(val.daysRemaining)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'daysRemaining' to be a finite number, but got ${val.daysRemaining}.`,
      );
    }
    const requiredStringKeys: readonly (keyof TrialEndingEmailProps)[] = [
      "trialEndsAt",
      "upgradeUrl",
    ];
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
    const optionalStringKeys: readonly (keyof TrialEndingEmailProps)[] = [
      "recipientName",
      "currentPlan",
      "upgradePlanName",
      "upgradePlanPrice",
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
    if ("featuresAtRisk" in val && typeof val.featuresAtRisk !== "undefined") {
      if (!Array.isArray(val.featuresAtRisk)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'featuresAtRisk' to be an array of strings when provided, but got ${typeof val.featuresAtRisk}.`,
        );
      }
      for (let i = 0; i < val.featuresAtRisk.length; i++) {
        if (typeof val.featuresAtRisk[i] !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected every entry of prop 'featuresAtRisk' to be a string, but entry at index ${i} is ${typeof val.featuresAtRisk[i]}.`,
          );
        }
      }
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<FC<TrialEndingEmailProps>> {
    const component = await import("@/email-templates/trial-ending").then(
      (mod) => mod.default,
    );
    return component;
  }

  public async renderPlainTextVersion(
    props: TrialEndingEmailProps,
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
    const currentPlan: string =
      typeof props.currentPlan === "string" && props.currentPlan.length > 0
        ? props.currentPlan
        : "free trial";
    const upgradePlanName: string =
      typeof props.upgradePlanName === "string" &&
      props.upgradePlanName.length > 0
        ? props.upgradePlanName
        : "Pro";

    const safeDaysRemaining: number =
      typeof props.daysRemaining === "number" &&
      Number.isFinite(props.daysRemaining)
        ? Math.max(0, Math.floor(props.daysRemaining))
        : 0;

    const headingText: string =
      safeDaysRemaining === 0
        ? `Your ${productName} trial ends today.`
        : safeDaysRemaining === 1
          ? `Your ${productName} trial ends tomorrow.`
          : `Your ${productName} trial ends in ${safeDaysRemaining} days.`;

    const lines: string[] = [
      headingText,
      "",
      `Hi ${greetingName},`,
      "",
      `Your ${productName} ${currentPlan} is ending on ${props.trialEndsAt}. Upgrade to ${upgradePlanName} to keep using everything you've built without interruption.`,
      "",
      `Current plan: ${currentPlan}`,
      `Trial ends: ${props.trialEndsAt}`,
    ];

    if (
      typeof props.upgradePlanPrice === "string" &&
      props.upgradePlanPrice.length > 0
    ) {
      lines.push(`${upgradePlanName} plan: ${props.upgradePlanPrice}`);
    }
    lines.push("");

    const featuresAtRisk: string[] = Array.isArray(props.featuresAtRisk)
      ? props.featuresAtRisk.filter(
          (item): item is string => typeof item === "string" && item.length > 0,
        )
      : [];

    if (featuresAtRisk.length > 0) {
      lines.push(`What you'll lose without ${upgradePlanName}:`);
      for (const feature of featuresAtRisk) {
        lines.push(`  - ${feature}`);
      }
      lines.push("");
    }

    lines.push(`Upgrade to ${upgradePlanName}: ${props.upgradeUrl}`);
    lines.push("");

    if (
      typeof props.manageBillingUrl === "string" &&
      props.manageBillingUrl.length > 0
    ) {
      lines.push(
        `Need to change plans, update billing details, or cancel? Visit your billing settings: ${props.manageBillingUrl}`,
      );
      lines.push("");
    }

    lines.push(
      `Questions about pricing, plan limits, or migrating data? Reply to this email or reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default TrialEnding;
