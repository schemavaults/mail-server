import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { UsageLimitWarningEmailProps } from "@/email-templates/usage-limit-warning";

export class UsageLimitWarning extends EmailTemplatesCatalogEntry<UsageLimitWarningEmailProps> {
  public id = "usage-limit-warning" as const satisfies string;

  public description =
    "Quota/usage alert email sent when an account approaches or reaches a plan limit (API requests, storage, seats, etc.). Severity (info/warning/critical) is derived from usagePercent and drives the header gradient, progress-bar fill color, and headline copy — under 75% uses the SchemaVaults brand-blue gradient, 75-95% uses the theme warning amber, 95%+ uses the destructive red. Includes a visual progress bar, a metadata callout (metric, usage, period, plan, reset time), and an Upgrade CTA with a dashboard fallback link. Props: { metricName: string, usagePercent: string, currentUsage: string, usageLimit: string, userName?: string, unit?: string, periodLabel?: string, resetAt?: string, planName?: string, upgradeUrl?: string, manageUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is UsageLimitWarningEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "metricName",
      "usagePercent",
      "currentUsage",
      "usageLimit",
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
      "userName",
      "unit",
      "periodLabel",
      "resetAt",
      "planName",
      "upgradeUrl",
      "manageUrl",
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
      typeof props.userName === "string" && props.userName.length > 0
        ? props.userName
        : "there";
    const unit: string | undefined =
      typeof props.unit === "string" && props.unit.length > 0
        ? props.unit
        : undefined;
    const periodLabel: string =
      typeof props.periodLabel === "string" && props.periodLabel.length > 0
        ? props.periodLabel
        : "this billing period";

    const parsedPercent = Number.parseFloat(props.usagePercent);
    const clampedPercent: number = !Number.isFinite(parsedPercent)
      ? 0
      : parsedPercent < 0
        ? 0
        : parsedPercent > 100
          ? 100
          : parsedPercent;
    const isCritical = clampedPercent >= 95;
    const percentDisplay = `${
      Number.isInteger(clampedPercent)
        ? clampedPercent.toString()
        : clampedPercent.toFixed(1)
    }%`;
    const usageDisplay = `${props.currentUsage}${unit ? ` ${unit}` : ""} of ${props.usageLimit}${unit ? ` ${unit}` : ""}`;

    const lines: string[] = [
      isCritical
        ? `${props.metricName} limit reached on ${productName} (${percentDisplay} of ${props.usageLimit}${unit ? ` ${unit}` : ""}).`
        : `${productName}: ${percentDisplay} of your ${props.metricName} used ${periodLabel}.`,
      "",
      `Hi ${greetingName},`,
      "",
      isCritical
        ? `Your account has reached its ${props.metricName} limit for ${periodLabel}. Further usage may be throttled or rejected until your quota resets${typeof props.resetAt === "string" && props.resetAt.length > 0 ? ` on ${props.resetAt}` : ""}.`
        : `Your account is at ${percentDisplay} of its ${props.metricName} allowance for ${periodLabel}. No action is required yet — this is a heads-up so you can upgrade or adjust before hitting the cap.`,
      "",
      `Metric: ${props.metricName}`,
      `Usage: ${usageDisplay} (${percentDisplay})`,
      `Period: ${periodLabel}`,
    ];

    if (typeof props.planName === "string" && props.planName.length > 0) {
      lines.push(`Plan: ${props.planName}`);
    }
    if (typeof props.resetAt === "string" && props.resetAt.length > 0) {
      lines.push(`Resets: ${props.resetAt}`);
    }
    lines.push("");

    if (typeof props.upgradeUrl === "string" && props.upgradeUrl.length > 0) {
      lines.push(
        `${isCritical ? "Upgrade now" : "Upgrade plan"}: ${props.upgradeUrl}`,
      );
    }
    if (typeof props.manageUrl === "string" && props.manageUrl.length > 0) {
      lines.push(`View detailed usage: ${props.manageUrl}`);
    }
    lines.push("");
    lines.push(
      `Need a custom limit or have questions about your plan? Reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default UsageLimitWarning;
