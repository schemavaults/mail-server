import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { UsageLimitWarningEmailProps } from "@/email-templates/usage-limit-warning";

export class UsageLimitWarning extends EmailTemplatesCatalogEntry<UsageLimitWarningEmailProps> {
  public id = "usage-limit-warning" as const satisfies string;

  public description =
    "Usage / quota threshold alert sent when a customer crosses a usage tier (informational < 80%, warning 80-94%, critical >= 95%) for a metered resource such as API requests, storage, schemas, or seats. Header gradient, badge label, callout, and CTA dynamically shift between brand-blue, amber (warning), and red (destructive) based on `percentUsed`. Includes a visual progress bar, a metadata table (resource, period, plan, reset date), an 'Upgrade' CTA with copy-paste fallback link, and an optional dashboard panel. Props: { resourceName: string, currentUsage: string, usageLimit: string, percentUsed: number, upgradeUrl: string, recipientName?: string, periodLabel?: string, resetsAt?: string, planName?: string, dashboardUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is UsageLimitWarningEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "resourceName",
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
    if (!("percentUsed" in val)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' is missing required prop 'percentUsed' (expected number between 0 and 100).`,
      );
    }
    const percentUsedRaw = (val as Record<string, unknown>).percentUsed;
    if (typeof percentUsedRaw !== "number" || !Number.isFinite(percentUsedRaw)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'percentUsed' to be a finite number, but got ${typeof percentUsedRaw}.`,
      );
    }
    if (percentUsedRaw < 0 || percentUsedRaw > 100) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'percentUsed' to be between 0 and 100, but got ${percentUsedRaw}.`,
      );
    }
    const optionalStringKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "recipientName",
      "periodLabel",
      "resetsAt",
      "planName",
      "dashboardUrl",
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
    const periodLabel: string =
      typeof props.periodLabel === "string" && props.periodLabel.length > 0
        ? props.periodLabel
        : "this billing period";

    const safePercentUsed: number =
      typeof props.percentUsed === "number" &&
      Number.isFinite(props.percentUsed)
        ? Math.max(0, Math.min(100, Math.round(props.percentUsed)))
        : 0;

    const severity: "info" | "warning" | "critical" =
      safePercentUsed >= 95
        ? "critical"
        : safePercentUsed >= 80
          ? "warning"
          : "info";

    const headingText: string =
      severity === "critical"
        ? `You've reached your ${props.resourceName} limit.`
        : severity === "warning"
          ? `You're approaching your ${props.resourceName} limit.`
          : `${props.resourceName} usage update.`;

    const calloutBody: string =
      severity === "critical"
        ? `New ${props.resourceName.toLowerCase()} requests will be rejected until your usage resets${
            typeof props.resetsAt === "string" && props.resetsAt.length > 0
              ? ` on ${props.resetsAt}`
              : ""
          } or you upgrade your plan.`
        : severity === "warning"
          ? `At your current rate you'll exhaust your ${props.resourceName.toLowerCase()} allowance before${
              typeof props.resetsAt === "string" && props.resetsAt.length > 0
                ? ` ${props.resetsAt}`
                : " the period resets"
            }. Upgrade now to avoid interruption.`
          : `Track your ${props.resourceName.toLowerCase()} usage in the dashboard. We'll keep you posted as you approach your plan limit.`;

    const lines: string[] = [
      headingText,
      "",
      `Hi ${greetingName},`,
      "",
      `You've used ${props.currentUsage} of your ${props.usageLimit} ${props.resourceName} allowance for ${periodLabel}${
        typeof props.planName === "string" && props.planName.length > 0
          ? ` on the ${props.planName} plan`
          : ""
      } (${safePercentUsed}%).`,
      "",
      calloutBody,
      "",
      `${props.resourceName}: ${props.currentUsage} / ${props.usageLimit}`,
      `Period: ${periodLabel}`,
    ];
    if (typeof props.planName === "string" && props.planName.length > 0) {
      lines.push(`Current plan: ${props.planName}`);
    }
    if (typeof props.resetsAt === "string" && props.resetsAt.length > 0) {
      lines.push(`Resets: ${props.resetsAt}`);
    }
    lines.push("");
    lines.push(`Upgrade your plan: ${props.upgradeUrl}`);
    if (
      typeof props.dashboardUrl === "string" &&
      props.dashboardUrl.length > 0
    ) {
      lines.push(`Usage dashboard: ${props.dashboardUrl}`);
    }
    lines.push("");
    lines.push(
      `Questions about plan limits, overage pricing, or custom quotas? Reply to this email or reach us at ${supportEmail}.`,
    );
    lines.push("");
    lines.push(
      `© ${new Date().getFullYear()} ${productName}. You are receiving this email because usage on your account crossed an alert threshold.`,
    );

    return lines.join("\n");
  }
}

export default UsageLimitWarning;
