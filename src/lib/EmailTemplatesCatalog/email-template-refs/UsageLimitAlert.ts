import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type {
  UsageLimitAlertEmailProps,
  UsageLimitAlertSeverity,
} from "@/email-templates/usage-limit-alert";

const ALLOWED_SEVERITIES: readonly UsageLimitAlertSeverity[] = [
  "warning",
  "critical",
  "exceeded",
];

export class UsageLimitAlert extends EmailTemplatesCatalogEntry<UsageLimitAlertEmailProps> {
  public id = "usage-limit-alert" as const satisfies string;

  public description =
    "Usage-limit alert email sent when an account approaches or exceeds a plan quota (API requests, vaults, storage, seats, etc.). Header gradient and progress-bar color are driven by severity: amber/warning for `warning`, brand-red for `critical`/`exceeded` (mirroring the @schemavaults/theme `--warning` and `--schemavaults-brand-red` tokens). Includes a visual progress bar, percent-used pill, metric/plan/period/reset metadata table, recommended next steps callout, and a primary upgrade CTA with an optional usage-dashboard link. Severity is inferred from `currentUsage / usageLimit` (>=100% → exceeded, >=90% → critical, otherwise warning) when not explicitly provided. Props: { metricLabel: string, currentUsage: number, usageLimit: number, upgradeUrl: string, recipientName?: string, unit?: string, usagePeriod?: string, resetAt?: string, severity?: 'warning' | 'critical' | 'exceeded', currentPlan?: string, recommendedActions?: string[], manageUsageUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is UsageLimitAlertEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredNumberKeys: readonly (keyof UsageLimitAlertEmailProps)[] = [
      "currentUsage",
      "usageLimit",
    ];
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
        `Template '${this.id}' expected prop 'usageLimit' to be greater than zero, but got 0.`,
      );
    }
    const requiredStringKeys: readonly (keyof UsageLimitAlertEmailProps)[] = [
      "metricLabel",
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
    const optionalStringKeys: readonly (keyof UsageLimitAlertEmailProps)[] = [
      "recipientName",
      "unit",
      "usagePeriod",
      "resetAt",
      "currentPlan",
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
    if (
      "severity" in val &&
      typeof (val as Record<string, unknown>).severity !== "undefined"
    ) {
      const sev = (val as Record<string, unknown>).severity;
      if (typeof sev !== "string") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'severity' to be a string when provided, but got ${typeof sev}.`,
        );
      }
      if (
        !ALLOWED_SEVERITIES.includes(sev as UsageLimitAlertSeverity)
      ) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'severity' to be one of ${ALLOWED_SEVERITIES.map((s) => `'${s}'`).join(", ")} when provided, but got '${sev}'.`,
        );
      }
    }
    if (
      "recommendedActions" in val &&
      typeof (val as Record<string, unknown>).recommendedActions !== "undefined"
    ) {
      const arr = (val as Record<string, unknown>).recommendedActions;
      if (!Array.isArray(arr)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'recommendedActions' to be an array of strings when provided, but got ${typeof arr}.`,
        );
      }
      for (let i = 0; i < arr.length; i++) {
        if (typeof arr[i] !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected every entry of prop 'recommendedActions' to be a string, but entry at index ${i} is ${typeof arr[i]}.`,
          );
        }
      }
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<
    FC<UsageLimitAlertEmailProps>
  > {
    const component = await import(
      "@/email-templates/usage-limit-alert"
    ).then((mod) => mod.default);
    return component;
  }

  public async renderPlainTextVersion(
    props: UsageLimitAlertEmailProps,
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
    const metricLabel: string =
      typeof props.metricLabel === "string" && props.metricLabel.length > 0
        ? props.metricLabel
        : "usage";
    const unit: string =
      typeof props.unit === "string" && props.unit.length > 0 ? props.unit : "";
    const usagePeriod: string =
      typeof props.usagePeriod === "string" && props.usagePeriod.length > 0
        ? props.usagePeriod
        : "this billing period";
    const currentPlan: string | undefined =
      typeof props.currentPlan === "string" && props.currentPlan.length > 0
        ? props.currentPlan
        : undefined;
    const manageUsageUrl: string | undefined =
      typeof props.manageUsageUrl === "string" &&
      props.manageUsageUrl.length > 0
        ? props.manageUsageUrl
        : undefined;
    const resetAt: string | undefined =
      typeof props.resetAt === "string" && props.resetAt.length > 0
        ? props.resetAt
        : undefined;

    const safeCurrentUsage: number =
      typeof props.currentUsage === "number" &&
      Number.isFinite(props.currentUsage)
        ? Math.max(0, Math.floor(props.currentUsage))
        : 0;
    const safeUsageLimit: number =
      typeof props.usageLimit === "number" &&
      Number.isFinite(props.usageLimit) &&
      props.usageLimit > 0
        ? Math.floor(props.usageLimit)
        : 1;
    const percentRaw: number = (safeCurrentUsage / safeUsageLimit) * 100;
    const percentDisplay: string = `${Math.max(0, Math.min(percentRaw, 999)).toFixed(percentRaw >= 100 ? 0 : 1)}%`;
    const unitSuffix: string = unit.length > 0 ? ` ${unit}` : "";
    const usageString: string = `${safeCurrentUsage.toLocaleString("en-US")} / ${safeUsageLimit.toLocaleString("en-US")}${unitSuffix}`;

    const severity: UsageLimitAlertSeverity =
      props.severity && ALLOWED_SEVERITIES.includes(props.severity)
        ? props.severity
        : percentRaw >= 100
          ? "exceeded"
          : percentRaw >= 90
            ? "critical"
            : "warning";

    const headingText: string =
      severity === "exceeded"
        ? `You've hit your ${metricLabel} limit.`
        : severity === "critical"
          ? `You're close to your ${metricLabel} limit.`
          : `Heads up on your ${metricLabel} usage.`;

    const introCopy: string =
      severity === "exceeded"
        ? `Your ${productName} account has hit its ${metricLabel} limit for ${usagePeriod}. Further ${metricLabel.toLowerCase()} may be throttled or rejected until the quota resets${resetAt ? ` on ${resetAt}` : ""}.`
        : severity === "critical"
          ? `Your ${productName} account is within 10% of its ${metricLabel} limit for ${usagePeriod}. Acting now avoids interruption${resetAt ? ` before usage resets on ${resetAt}` : ""}.`
          : `Your ${productName} account has used a significant share of its ${metricLabel} quota for ${usagePeriod}.${resetAt ? ` Usage resets on ${resetAt}.` : ""}`;

    const recommendedActions: string[] = Array.isArray(props.recommendedActions)
      ? props.recommendedActions.filter(
          (item): item is string => typeof item === "string" && item.length > 0,
        )
      : [];
    const finalRecommendedActions: readonly string[] =
      recommendedActions.length > 0
        ? recommendedActions
        : [
            "Upgrade your plan to raise the limit",
            "Review which integrations are driving the highest usage",
            "Throttle non-essential jobs until the quota resets",
          ];

    const lines: string[] = [
      headingText,
      "",
      `Hi ${greetingName},`,
      "",
      introCopy,
      "",
      `${metricLabel}: ${usageString} (${percentDisplay} used)`,
    ];

    if (currentPlan) {
      lines.push(`Plan: ${currentPlan}`);
    }
    lines.push(`Period: ${usagePeriod}`);
    if (resetAt) {
      lines.push(`Resets: ${resetAt}`);
    }
    lines.push("");

    lines.push("Recommended next steps:");
    for (const action of finalRecommendedActions) {
      lines.push(`  - ${action}`);
    }
    lines.push("");

    lines.push(
      `${severity === "exceeded" ? "Upgrade to restore service" : "Upgrade plan"}: ${props.upgradeUrl}`,
    );
    lines.push("");

    if (manageUsageUrl) {
      lines.push(`See what's driving usage: ${manageUsageUrl}`);
      lines.push("");
    }

    lines.push(
      `Questions about plan limits, quota calculations, or rate-limit behavior? Reply to this email or reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default UsageLimitAlert;
