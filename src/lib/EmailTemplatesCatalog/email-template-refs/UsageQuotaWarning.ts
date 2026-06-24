import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { UsageQuotaWarningEmailProps } from "@/email-templates/usage-quota-warning";

export class UsageQuotaWarning extends EmailTemplatesCatalogEntry<UsageQuotaWarningEmailProps> {
  public id = "usage-quota-warning" as const satisfies string;

  public description =
    "Usage quota / plan-limit warning email sent when a workspace's metered usage (API requests, storage, vaults, etc.) crosses an alert threshold. Uses the @schemavaults/theme `--warning` amber palette for the standard warning state and the `--schemavaults-brand-red` palette for the critical state (>=95%). Includes a gradient header that switches color with severity, a labeled progress bar built from HTML tables for email-client compatibility, a metadata table (metric, current plan, recommended plan, reset date), a severity-tinted callout that previews what happens if usage keeps climbing, a primary upgrade CTA (red in the critical state), an optional usage-dashboard link, and a 'tips to stay under the cap' panel. Props: { metricName: string, currentUsage: string, usageLimit: string, usagePercent: number, upgradeUrl: string, recipientName?: string, unit?: string, planName?: string, resetDate?: string, recommendedPlan?: string, upgradeLabel?: string, usageDashboardUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is UsageQuotaWarningEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    if (!("usagePercent" in val)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' is missing required prop 'usagePercent' (expected finite number).`,
      );
    }
    if (typeof (val as Record<string, unknown>).usagePercent !== "number") {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'usagePercent' to be a number, but got ${typeof (val as Record<string, unknown>).usagePercent}.`,
      );
    }
    if (
      !Number.isFinite((val as Record<string, unknown>).usagePercent as number)
    ) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'usagePercent' to be a finite number, but got ${(val as Record<string, unknown>).usagePercent}.`,
      );
    }
    const requiredStringKeys: readonly (keyof UsageQuotaWarningEmailProps)[] = [
      "metricName",
      "currentUsage",
      "usageLimit",
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
    const optionalStringKeys: readonly (keyof UsageQuotaWarningEmailProps)[] = [
      "recipientName",
      "unit",
      "planName",
      "resetDate",
      "recommendedPlan",
      "upgradeLabel",
      "usageDashboardUrl",
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
    FC<UsageQuotaWarningEmailProps>
  > {
    const component = await import(
      "@/email-templates/usage-quota-warning"
    ).then((mod) => mod.default);
    return component;
  }

  public async renderPlainTextVersion(
    props: UsageQuotaWarningEmailProps,
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
    const unit: string =
      typeof props.unit === "string" && props.unit.length > 0
        ? props.unit
        : "";
    const usageWithUnit = (value: string): string =>
      unit.length > 0 ? `${value} ${unit}` : value;

    const safePercent: number =
      typeof props.usagePercent === "number" &&
      Number.isFinite(props.usagePercent)
        ? Math.max(0, Math.min(100, props.usagePercent))
        : 0;
    const displayPercent: number = Math.round(safePercent);
    const isCritical: boolean = safePercent >= 95;
    const upgradeLabel: string =
      typeof props.upgradeLabel === "string" && props.upgradeLabel.length > 0
        ? props.upgradeLabel
        : "Upgrade your plan";

    const headingText: string = isCritical
      ? `You've used ${displayPercent}% of your ${productName} ${props.metricName} quota.`
      : `Heads up: you're at ${displayPercent}% of your ${productName} ${props.metricName} quota.`;

    const lines: string[] = [
      headingText,
      "",
      `Hi ${greetingName},`,
      "",
      isCritical
        ? `Your ${productName} workspace is at ${displayPercent}% of its ${props.metricName} quota for the current billing period. Once you hit 100%, new ${props.metricName} requests will be rejected until the quota resets or you upgrade.`
        : `Your ${productName} workspace has used ${displayPercent}% of its ${props.metricName} quota for the current billing period. You're still under the limit — this is a heads-up so you can upgrade or adjust usage before it becomes a blocker.`,
      "",
      `${props.metricName}: ${usageWithUnit(props.currentUsage)} of ${usageWithUnit(props.usageLimit)} (${displayPercent}%)`,
    ];

    if (typeof props.planName === "string" && props.planName.length > 0) {
      lines.push(`Current plan: ${props.planName}`);
    }
    if (
      typeof props.recommendedPlan === "string" &&
      props.recommendedPlan.length > 0
    ) {
      lines.push(`Recommended plan: ${props.recommendedPlan}`);
    }
    if (typeof props.resetDate === "string" && props.resetDate.length > 0) {
      lines.push(`Quota resets: ${props.resetDate}`);
    }
    lines.push("");

    lines.push(`${upgradeLabel}: ${props.upgradeUrl}`);
    lines.push("");

    if (
      typeof props.usageDashboardUrl === "string" &&
      props.usageDashboardUrl.length > 0
    ) {
      lines.push(`View your usage dashboard: ${props.usageDashboardUrl}`);
      lines.push("");
    }

    lines.push(
      "Tips to stay under the cap: batch repeated requests, cache hot schema reads on your side, or rotate non-critical jobs to off-peak windows. The usage dashboard breaks consumption down by API key so you can spot the biggest contributors.",
    );
    lines.push("");
    lines.push(
      `Questions about plans or limits? Reply to this email or reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default UsageQuotaWarning;
