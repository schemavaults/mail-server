import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { UsageLimitWarningEmailProps } from "@/email-templates/usage-limit-warning";

export class UsageLimitWarning extends EmailTemplatesCatalogEntry<UsageLimitWarningEmailProps> {
  public id = "usage-limit-warning" as const satisfies string;

  public description =
    "Plan usage/quota warning email sent when a customer's account approaches or exceeds a plan limit (API requests, schemas, vaults, mailing list size, etc.). Uses an amber warning palette by default and automatically switches to a destructive-red palette when percentUsed >= 100. Renders a usage gauge with a percentage bar, a metadata table (resource, used/limit, plan, reset date), an optional recommended-upgrade callout, a primary upgrade CTA, and an actionable 'What you can do' list. Props: { resourceName: string, usedAmount: string, limitAmount: string, percentUsed: number, upgradeUrl: string, recipientName?: string, resetDate?: string, currentPlan?: string, upgradePlanName?: string, upgradePlanLimit?: string, manageBillingUrl?: string, recommendations?: string[], productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is UsageLimitWarningEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "resourceName",
      "usedAmount",
      "limitAmount",
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
    if (!("percentUsed" in val)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' is missing required prop 'percentUsed' (expected number).`,
      );
    }
    const percentUsed = (val as Record<string, unknown>)["percentUsed"];
    if (typeof percentUsed !== "number" || !Number.isFinite(percentUsed)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'percentUsed' to be a finite number, but got ${typeof percentUsed}.`,
      );
    }
    const optionalStringKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "recipientName",
      "resetDate",
      "currentPlan",
      "upgradePlanName",
      "upgradePlanLimit",
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
    if ("recommendations" in val) {
      const recommendations = (val as Record<string, unknown>)[
        "recommendations"
      ];
      if (typeof recommendations !== "undefined") {
        if (!Array.isArray(recommendations)) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected optional prop 'recommendations' to be an array of strings when provided, but got ${typeof recommendations}.`,
          );
        }
        for (const [idx, entry] of recommendations.entries()) {
          if (typeof entry !== "string") {
            throw new BadEmailTemplatePropsError(
              `Template '${this.id}' expected 'recommendations[${idx}]' to be a string, but got ${typeof entry}.`,
            );
          }
        }
      }
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<
    FC<UsageLimitWarningEmailProps>
  > {
    const component = await import(
      "@/email-templates/usage-limit-warning"
    ).then((mod) => mod.default);
    return component;
  }

  public async renderPlainTextVersion(
    props: UsageLimitWarningEmailProps,
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
    const rawPercent: number =
      typeof props.percentUsed === "number" &&
      Number.isFinite(props.percentUsed)
        ? props.percentUsed
        : 0;
    const displayPercent: number = Math.round(rawPercent);
    const isOverLimit: boolean = rawPercent >= 100;
    const recommendations: readonly string[] =
      Array.isArray(props.recommendations) && props.recommendations.length > 0
        ? props.recommendations
        : [
            "Review recent usage in your dashboard to identify spikes",
            "Archive or delete resources you no longer need",
            "Upgrade your plan to unlock a higher limit",
          ];

    const headline: string = isOverLimit
      ? `You've hit your ${props.resourceName} limit on ${productName}.`
      : `You're nearing your ${props.resourceName} limit on ${productName}.`;
    const lead: string = isOverLimit
      ? `Your ${productName} account has reached its ${props.resourceName} allowance for the current billing period. Some operations may be paused until usage drops or your plan is upgraded.`
      : `Your ${productName} account has used ${displayPercent}% of its ${props.resourceName} allowance for the current billing period. We're sending this heads-up so nothing breaks unexpectedly.`;

    const lines: string[] = [
      headline,
      "",
      `Hi ${greetingName},`,
      "",
      lead,
      "",
      `Usage: ${props.usedAmount} of ${props.limitAmount} (${displayPercent}%)`,
      `Resource: ${props.resourceName}`,
    ];
    if (
      typeof props.currentPlan === "string" &&
      props.currentPlan.length > 0
    ) {
      lines.push(`Current plan: ${props.currentPlan}`);
    }
    if (typeof props.resetDate === "string" && props.resetDate.length > 0) {
      lines.push(`Resets on: ${props.resetDate}`);
    }
    lines.push("");

    if (
      typeof props.upgradePlanName === "string" &&
      props.upgradePlanName.length > 0
    ) {
      const upgradeLine: string =
        typeof props.upgradePlanLimit === "string" &&
        props.upgradePlanLimit.length > 0
          ? `Recommended upgrade: ${props.upgradePlanName} (includes ${props.upgradePlanLimit} of ${props.resourceName}).`
          : `Recommended upgrade: ${props.upgradePlanName}.`;
      lines.push(upgradeLine);
      lines.push("");
    }

    lines.push(
      `${isOverLimit ? "Upgrade now" : "Review upgrade options"}: ${props.upgradeUrl}`,
    );
    if (
      typeof props.manageBillingUrl === "string" &&
      props.manageBillingUrl.length > 0
    ) {
      lines.push(`Manage billing: ${props.manageBillingUrl}`);
    }
    lines.push("");

    lines.push("What you can do:");
    for (const item of recommendations) {
      lines.push(`  - ${item}`);
    }
    lines.push("");
    lines.push(
      `Questions about your usage or billing? Reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default UsageLimitWarning;
