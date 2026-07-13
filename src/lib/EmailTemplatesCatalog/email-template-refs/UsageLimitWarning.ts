import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { UsageLimitWarningEmailProps } from "@/email-templates/usage-limit-warning";

export class UsageLimitWarning extends EmailTemplatesCatalogEntry<UsageLimitWarningEmailProps> {
  public id = "usage-limit-warning" as const satisfies string;

  public description =
    "Quota warning email sent when an account approaches or reaches a metered usage limit (API requests, storage, seats, etc.). Header uses the @schemavaults/theme `--warning` (amber) token by default and escalates to `--destructive` (red) when usage is at or above 95%. Includes a visual progress bar, a percent-used badge, a metadata table (resource, usage, percent, plan, resets, upgrade limit), an optional 'What you can do' recommendations callout, and a primary upgrade CTA with an optional 'manage billing' link. Props: { resourceName: string, usageAmount: number, usageLimit: number, upgradeUrl: string, recipientName?: string, usageUnit?: string, periodLabel?: string, resetsAt?: string, currentPlan?: string, upgradePlanName?: string, upgradePlanLimit?: string, manageBillingUrl?: string, recommendations?: string[], productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is UsageLimitWarningEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredNumberKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "usageAmount",
      "usageLimit",
    ];
    for (const key of requiredNumberKeys) {
      if (!(key in val)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' is missing required prop '${key}' (expected finite number).`,
        );
      }
      const raw = (val as Record<string, unknown>)[key];
      if (typeof raw !== "number") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected prop '${key}' to be a number, but got ${typeof raw}.`,
        );
      }
      if (!Number.isFinite(raw)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected prop '${key}' to be a finite number, but got ${raw}.`,
        );
      }
    }
    if ((val as { usageLimit: number }).usageLimit <= 0) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'usageLimit' to be a positive number, but got ${(val as { usageLimit: number }).usageLimit}.`,
      );
    }
    const requiredStringKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "resourceName",
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
    const optionalStringKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "recipientName",
      "usageUnit",
      "periodLabel",
      "resetsAt",
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
    if (
      "recommendations" in val &&
      typeof (val as { recommendations?: unknown }).recommendations !==
        "undefined"
    ) {
      const recs = (val as { recommendations?: unknown }).recommendations;
      if (!Array.isArray(recs)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'recommendations' to be an array of strings when provided, but got ${typeof recs}.`,
        );
      }
      for (let i = 0; i < recs.length; i++) {
        if (typeof recs[i] !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected every entry of prop 'recommendations' to be a string, but entry at index ${i} is ${typeof recs[i]}.`,
          );
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
    const resourceName: string =
      typeof props.resourceName === "string" && props.resourceName.length > 0
        ? props.resourceName
        : "usage";
    const usageUnit: string =
      typeof props.usageUnit === "string" && props.usageUnit.length > 0
        ? props.usageUnit
        : "";
    const periodLabel: string =
      typeof props.periodLabel === "string" && props.periodLabel.length > 0
        ? props.periodLabel
        : "this billing period";
    const currentPlan: string | undefined =
      typeof props.currentPlan === "string" && props.currentPlan.length > 0
        ? props.currentPlan
        : undefined;
    const upgradePlanName: string =
      typeof props.upgradePlanName === "string" &&
      props.upgradePlanName.length > 0
        ? props.upgradePlanName
        : "the next tier";
    const upgradePlanLimit: string | undefined =
      typeof props.upgradePlanLimit === "string" &&
      props.upgradePlanLimit.length > 0
        ? props.upgradePlanLimit
        : undefined;
    const resetsAt: string | undefined =
      typeof props.resetsAt === "string" && props.resetsAt.length > 0
        ? props.resetsAt
        : undefined;
    const manageBillingUrl: string | undefined =
      typeof props.manageBillingUrl === "string" &&
      props.manageBillingUrl.length > 0
        ? props.manageBillingUrl
        : undefined;

    const safeUsage: number =
      typeof props.usageAmount === "number" &&
      Number.isFinite(props.usageAmount)
        ? Math.max(0, props.usageAmount)
        : 0;
    const safeLimit: number =
      typeof props.usageLimit === "number" &&
      Number.isFinite(props.usageLimit) &&
      props.usageLimit > 0
        ? props.usageLimit
        : 1;
    const percentUsed: number = Math.max(
      0,
      Math.min(100, Math.round((safeUsage / safeLimit) * 100)),
    );
    const overLimit: boolean = safeUsage >= safeLimit;
    const numberFormatter = new Intl.NumberFormat("en-US");
    const usageText: string = usageUnit
      ? `${numberFormatter.format(safeUsage)} of ${numberFormatter.format(
          safeLimit,
        )} ${usageUnit}`
      : `${numberFormatter.format(safeUsage)} of ${numberFormatter.format(safeLimit)}`;

    const headingText: string = overLimit
      ? `You've reached your ${resourceName} limit.`
      : percentUsed >= 95
        ? `You're almost out of ${resourceName}.`
        : `You've used ${percentUsed}% of your ${resourceName} quota.`;

    const lines: string[] = [
      headingText,
      "",
      `Hi ${greetingName},`,
      "",
    ];

    if (overLimit) {
      lines.push(
        `Your ${resourceName} usage for ${periodLabel} has reached your plan's limit${
          currentPlan ? ` on the ${currentPlan} plan` : ""
        }. New requests may be throttled until ${
          resetsAt ? `quota resets on ${resetsAt}` : "quota resets"
        }, or you can upgrade to keep going without interruption.`,
      );
    } else {
      lines.push(
        `You've used ${usageText} (${percentUsed}%) of your ${resourceName} quota for ${periodLabel}${
          currentPlan ? ` on the ${currentPlan} plan` : ""
        }. Upgrade to ${upgradePlanName} to raise your limit before you hit it.`,
      );
    }
    lines.push("");

    lines.push(`Resource: ${resourceName}`);
    lines.push(`Usage: ${usageText}`);
    lines.push(`Percent used: ${percentUsed}%`);
    if (currentPlan) {
      lines.push(`Current plan: ${currentPlan}`);
    }
    if (resetsAt) {
      lines.push(`Resets: ${resetsAt}`);
    }
    if (upgradePlanLimit) {
      lines.push(`${upgradePlanName} plan: ${upgradePlanLimit}`);
    }
    lines.push("");

    const recommendations: string[] = Array.isArray(props.recommendations)
      ? props.recommendations.filter(
          (item): item is string =>
            typeof item === "string" && item.length > 0,
        )
      : [];
    if (recommendations.length > 0) {
      lines.push("What you can do:");
      for (const rec of recommendations) {
        lines.push(`  - ${rec}`);
      }
      lines.push("");
    }

    lines.push(`Upgrade to ${upgradePlanName}: ${props.upgradeUrl}`);
    lines.push("");

    if (manageBillingUrl) {
      lines.push(
        `Not ready to upgrade? Review usage details or change plans in your billing settings: ${manageBillingUrl}`,
      );
      lines.push("");
    }

    lines.push(
      `Questions about limits, custom quotas, or migrating data? Reply to this email or reach us at ${supportEmail}.`,
    );
    lines.push("");
    lines.push(`— ${productName}`);

    return lines.join("\n");
  }
}

export default UsageLimitWarning;
