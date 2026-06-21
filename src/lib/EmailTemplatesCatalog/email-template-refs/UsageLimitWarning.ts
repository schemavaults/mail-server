import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { UsageLimitWarningEmailProps } from "@/email-templates/usage-limit-warning";

export class UsageLimitWarning extends EmailTemplatesCatalogEntry<UsageLimitWarningEmailProps> {
  public id = "usage-limit-warning" as const satisfies string;

  public description =
    "Usage / quota warning email sent when a customer is approaching or has exceeded a plan limit (API requests, storage, schemas, seats, etc.). The header gradient, accent color, and CTA shift through four severity tiers driven by `usagePercent`: <75% uses the SchemaVaults brand blue, 75–89% the @schemavaults/theme `--warning` amber, 90–99% the brand red, and ≥100% the brand red 'limit reached' variant. Includes a percent-used pill, an inline progress bar, a metadata table (resource, used, plan, resets), a severity callout explaining what happens at 100%, an upgrade CTA, and an optional usage-dashboard link. Props: { resourceName: string, usagePercent: number, recipientName?: string, currentUsage?: string, usageLimit?: string, periodResetDate?: string, planName?: string, upgradeUrl?: string, manageUsageUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is UsageLimitWarningEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    if (!("resourceName" in val)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' is missing required prop 'resourceName' (expected string).`,
      );
    }
    if (typeof (val as Record<string, unknown>).resourceName !== "string") {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'resourceName' to be a string, but got ${typeof (val as Record<string, unknown>).resourceName}.`,
      );
    }
    if (!("usagePercent" in val)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' is missing required prop 'usagePercent' (expected finite number in [0, 100]).`,
      );
    }
    if (typeof (val as Record<string, unknown>).usagePercent !== "number") {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'usagePercent' to be a number, but got ${typeof (val as Record<string, unknown>).usagePercent}.`,
      );
    }
    const usagePercent: number = (val as { usagePercent: number }).usagePercent;
    if (!Number.isFinite(usagePercent)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'usagePercent' to be a finite number, but got ${usagePercent}.`,
      );
    }
    if (usagePercent < 0 || usagePercent > 100) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'usagePercent' to be between 0 and 100 (inclusive), but got ${usagePercent}.`,
      );
    }
    const optionalStringKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "recipientName",
      "currentUsage",
      "usageLimit",
      "periodResetDate",
      "planName",
      "upgradeUrl",
      "manageUsageUrl",
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
    const planName: string =
      typeof props.planName === "string" && props.planName.length > 0
        ? props.planName
        : "your current plan";

    const safePercent: number =
      typeof props.usagePercent === "number" &&
      Number.isFinite(props.usagePercent)
        ? Math.max(0, Math.min(100, props.usagePercent))
        : 0;
    const displayPercent: number = Math.round(safePercent);

    const usageSummary: string | undefined =
      typeof props.currentUsage === "string" &&
      props.currentUsage.length > 0 &&
      typeof props.usageLimit === "string" &&
      props.usageLimit.length > 0
        ? `${props.currentUsage} of ${props.usageLimit}`
        : typeof props.currentUsage === "string" &&
            props.currentUsage.length > 0
          ? props.currentUsage
          : typeof props.usageLimit === "string" && props.usageLimit.length > 0
            ? props.usageLimit
            : undefined;

    const headingText: string =
      safePercent >= 100
        ? `You've hit your ${resourceName} limit on ${productName}.`
        : safePercent >= 90
          ? `You're almost out of ${resourceName} on ${productName} (${displayPercent}% used).`
          : safePercent >= 75
            ? `You're close to your ${resourceName} limit on ${productName} (${displayPercent}% used).`
            : `You're approaching your ${resourceName} limit on ${productName} (${displayPercent}% used).`;

    const lines: string[] = [
      headingText,
      "",
      `Hi ${greetingName},`,
      "",
    ];

    if (safePercent >= 100) {
      lines.push(
        `Your ${productName} account has reached its ${resourceName} cap for this billing period. New ${resourceName} requests will be rejected until the period resets or you upgrade.`,
      );
    } else if (safePercent >= 90) {
      lines.push(
        `Your ${productName} account has nearly exhausted its ${resourceName} allowance. New requests will start failing once you reach the limit — upgrade now to keep things running smoothly.`,
      );
    } else if (safePercent >= 75) {
      lines.push(
        `Your ${productName} account has used most of its ${resourceName} allowance for this billing period. To avoid hitting the cap, consider upgrading or tuning usage now.`,
      );
    } else {
      lines.push(
        `You're on track to hit your ${productName} ${resourceName} limit before the end of this billing period. We wanted to give you a heads-up so nothing breaks unexpectedly.`,
      );
    }

    lines.push("");
    lines.push(`Resource: ${resourceName}`);
    if (usageSummary) {
      lines.push(`Used: ${usageSummary} (${displayPercent}%)`);
    } else {
      lines.push(`Used: ${displayPercent}%`);
    }
    lines.push(`Plan: ${planName}`);
    if (
      typeof props.periodResetDate === "string" &&
      props.periodResetDate.length > 0
    ) {
      lines.push(`Resets: ${props.periodResetDate}`);
    }
    lines.push("");

    if (typeof props.upgradeUrl === "string" && props.upgradeUrl.length > 0) {
      const ctaLabel: string =
        safePercent >= 90
          ? "Upgrade now"
          : planName === "Pro"
            ? "Upgrade to a higher tier"
            : `Upgrade from ${planName}`;
      lines.push(`${ctaLabel}: ${props.upgradeUrl}`);
      lines.push("");
    }

    if (
      typeof props.manageUsageUrl === "string" &&
      props.manageUsageUrl.length > 0
    ) {
      lines.push(
        `Prefer to tune usage instead? Review per-key and per-vault consumption in your usage dashboard: ${props.manageUsageUrl}`,
      );
      lines.push("");
    }

    lines.push(
      `Questions about plan limits, custom quotas, or overage pricing? Reply to this email or reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default UsageLimitWarning;
