import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { UsageThresholdWarningEmailProps } from "@/email-templates/usage-threshold-warning";

export class UsageThresholdWarning extends EmailTemplatesCatalogEntry<UsageThresholdWarningEmailProps> {
  public id = "usage-threshold-warning" as const satisfies string;

  public description =
    "Usage-quota threshold alert sent when a metered resource on the user's plan crosses a configurable percentage of its limit. The header gradient and CTA accent shift severity automatically — blue (<80% used, informational) → amber (80–95%, mirroring the @schemavaults/theme `--warning` token) → red (≥95% or over limit, mirroring the brand-red / `--destructive` token). Includes a percent-used progress bar, a metadata table (plan, current usage / limit, quota reset, recommended-plan limit & price), an optional severity callout describing what happens at 100% (rendered for warning/critical/over), an upgrade CTA, and an optional usage-dashboard link. Props: { metricName: string, currentUsage: number, usageLimit: number, unit: string, resetAt: string, upgradeUrl: string, recipientName?: string, planName?: string, usageDashboardUrl?: string, recommendedPlanName?: string, recommendedPlanLimitLabel?: string, recommendedPlanPrice?: string, consequences?: string[], productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is UsageThresholdWarningEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }

    const requiredNumberKeys: readonly (keyof UsageThresholdWarningEmailProps)[] =
      ["currentUsage", "usageLimit"];
    for (const key of requiredNumberKeys) {
      if (!(key in val)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' is missing required prop '${key}' (expected finite number).`,
        );
      }
      const v = (val as Record<string, unknown>)[key];
      if (typeof v !== "number") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected prop '${key}' to be a number, but got ${typeof v}.`,
        );
      }
      if (!Number.isFinite(v)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected prop '${key}' to be a finite number, but got ${v}.`,
        );
      }
    }

    if ((val as Record<string, unknown>).usageLimit === 0) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'usageLimit' to be greater than 0 (cannot compute a percentage against a zero limit).`,
      );
    }

    const requiredStringKeys: readonly (keyof UsageThresholdWarningEmailProps)[] =
      ["metricName", "unit", "resetAt", "upgradeUrl"];
    for (const key of requiredStringKeys) {
      if (!(key in val)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' is missing required prop '${key}' (expected string).`,
        );
      }
      const v = (val as Record<string, unknown>)[key];
      if (typeof v !== "string") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected prop '${key}' to be a string, but got ${typeof v}.`,
        );
      }
      if (v.length === 0) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected prop '${key}' to be a non-empty string.`,
        );
      }
    }

    const optionalStringKeys: readonly (keyof UsageThresholdWarningEmailProps)[] =
      [
        "recipientName",
        "planName",
        "usageDashboardUrl",
        "recommendedPlanName",
        "recommendedPlanLimitLabel",
        "recommendedPlanPrice",
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

    if ("consequences" in val && typeof val.consequences !== "undefined") {
      if (!Array.isArray(val.consequences)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'consequences' to be an array of strings when provided, but got ${typeof val.consequences}.`,
        );
      }
      for (let i = 0; i < val.consequences.length; i++) {
        if (typeof val.consequences[i] !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected every entry of prop 'consequences' to be a string, but entry at index ${i} is ${typeof val.consequences[i]}.`,
          );
        }
      }
    }

    return true;
  }

  public async loadReactEmailTemplate(): Promise<
    FC<UsageThresholdWarningEmailProps>
  > {
    const component = await import(
      "@/email-templates/usage-threshold-warning"
    ).then((mod) => mod.default);
    return component;
  }

  public async renderPlainTextVersion(
    props: UsageThresholdWarningEmailProps,
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
    const planName: string =
      typeof props.planName === "string" && props.planName.length > 0
        ? props.planName
        : "your current plan";

    const safeCurrentUsage: number =
      typeof props.currentUsage === "number" &&
      Number.isFinite(props.currentUsage)
        ? Math.max(0, props.currentUsage)
        : 0;
    const safeUsageLimit: number =
      typeof props.usageLimit === "number" &&
      Number.isFinite(props.usageLimit) &&
      props.usageLimit > 0
        ? props.usageLimit
        : 1;
    const rawPercent: number = safeCurrentUsage / safeUsageLimit;
    const percentLabel: number = Math.min(999, Math.round(rawPercent * 100));
    const isOver: boolean = rawPercent >= 1;

    const fmt = (n: number): string =>
      Number.isFinite(n)
        ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n)
        : String(n);

    const headingText: string = isOver
      ? `You've exceeded your ${props.metricName} quota.`
      : `You're at ${percentLabel}% of your ${props.metricName} quota.`;

    const lines: string[] = [
      `${productName} - Usage alert`,
      headingText,
      "",
      `Hi ${greetingName},`,
      "",
      isOver
        ? `Your ${props.metricName} usage on ${planName} has gone over its quota. New requests against this metric will be throttled until the quota resets on ${props.resetAt}.`
        : `Your ${props.metricName} usage on ${planName} is at ${percentLabel}% of its quota. The quota resets on ${props.resetAt}.`,
      "",
      `Plan: ${planName}`,
      `Usage: ${fmt(safeCurrentUsage)} of ${fmt(safeUsageLimit)} ${props.unit} (${percentLabel}%)`,
      `Quota resets: ${props.resetAt}`,
    ];

    if (
      typeof props.recommendedPlanName === "string" &&
      props.recommendedPlanName.length > 0 &&
      typeof props.recommendedPlanLimitLabel === "string" &&
      props.recommendedPlanLimitLabel.length > 0
    ) {
      const priceSuffix: string =
        typeof props.recommendedPlanPrice === "string" &&
        props.recommendedPlanPrice.length > 0
          ? ` - ${props.recommendedPlanPrice}`
          : "";
      lines.push(
        `${props.recommendedPlanName} limit: ${props.recommendedPlanLimitLabel}${priceSuffix}`,
      );
    }
    lines.push("");

    const consequences: string[] = Array.isArray(props.consequences)
      ? props.consequences.filter(
          (item): item is string => typeof item === "string" && item.length > 0,
        )
      : [];
    if (consequences.length > 0 && percentLabel >= 80) {
      lines.push(
        isOver
          ? "What's happening now:"
          : "What happens if you hit the limit:",
      );
      for (const c of consequences) {
        lines.push(`  - ${c}`);
      }
      lines.push("");
    }

    lines.push(
      props.recommendedPlanName
        ? `Upgrade to ${props.recommendedPlanName}: ${props.upgradeUrl}`
        : `Upgrade your plan: ${props.upgradeUrl}`,
    );
    lines.push("");

    if (
      typeof props.usageDashboardUrl === "string" &&
      props.usageDashboardUrl.length > 0
    ) {
      lines.push(
        `Want a detailed breakdown by API key, endpoint, or day? Open the usage dashboard: ${props.usageDashboardUrl}`,
      );
      lines.push("");
    }

    lines.push(
      `Questions about quotas, custom limits, or annual pricing? Reply to this email or reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default UsageThresholdWarning;
