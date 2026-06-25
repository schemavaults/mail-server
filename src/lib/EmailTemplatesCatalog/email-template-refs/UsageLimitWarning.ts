import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { UsageLimitWarningEmailProps } from "@/email-templates/usage-limit-warning";

export class UsageLimitWarning extends EmailTemplatesCatalogEntry<UsageLimitWarningEmailProps> {
  public id = "usage-limit-warning" as const satisfies string;

  public description =
    "Usage-limit warning email sent when a customer is approaching or has exceeded a plan quota (API requests, schemas, storage, seats, etc.). Renders an accent-themed header that escalates from amber 'warning' to red 'critical' (mirroring the @schemavaults/theme `--warning` and `--destructive` tokens), a progress bar visualizing the metric, a stat panel with the percent used, a metadata table (metric, current usage, plan, reset date), and a brand-blue upgrade CTA with an optional manage-billing panel. Severity auto-infers from the usage ratio (≥95% → critical) when not explicitly provided. Props: { metricName: string, currentUsage: number, limit: number, upgradeUrl: string, recipientName?: string, unit?: string, planName?: string, periodEndsAt?: string, severity?: 'warning' | 'critical', manageBillingUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is UsageLimitWarningEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const numericKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "currentUsage",
      "limit",
    ];
    for (const key of numericKeys) {
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
      if (raw < 0) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected prop '${key}' to be non-negative, but got ${raw}.`,
        );
      }
    }
    if ((val as Record<string, unknown>)["limit"] === 0) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'limit' to be greater than zero (cannot divide by zero), but got 0.`,
      );
    }
    const requiredStringKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "metricName",
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
      "unit",
      "planName",
      "periodEndsAt",
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
      "severity" in val &&
      typeof (val as Record<string, unknown>)["severity"] !== "undefined"
    ) {
      const sev = (val as Record<string, unknown>)["severity"];
      if (sev !== "warning" && sev !== "critical") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'severity' to be 'warning' or 'critical' when provided, but got ${typeof sev === "string" ? `'${sev}'` : typeof sev}.`,
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
    const planName: string =
      typeof props.planName === "string" && props.planName.length > 0
        ? props.planName
        : "current plan";
    const unit: string =
      typeof props.unit === "string" && props.unit.length > 0
        ? ` ${props.unit}`
        : "";

    const safeCurrent: number =
      typeof props.currentUsage === "number" &&
      Number.isFinite(props.currentUsage)
        ? Math.max(0, props.currentUsage)
        : 0;
    const safeLimit: number =
      typeof props.limit === "number" &&
      Number.isFinite(props.limit) &&
      props.limit > 0
        ? props.limit
        : 1;
    const rawRatio = safeCurrent / safeLimit;
    const percentDisplay = Math.round(
      Math.min(1.5, Math.max(0, rawRatio)) * 100,
    );
    const isOverLimit = rawRatio >= 1;

    const inferredSeverity: "warning" | "critical" =
      rawRatio >= 0.95 ? "critical" : "warning";
    const severity: "warning" | "critical" =
      props.severity === "warning" || props.severity === "critical"
        ? props.severity
        : inferredSeverity;
    const isCritical = severity === "critical";

    const formatNumber = (n: number): string =>
      Number.isFinite(n)
        ? Number.isInteger(n)
          ? n.toLocaleString("en-US")
          : n.toLocaleString("en-US", { maximumFractionDigits: 2 })
        : String(n);

    const headingText: string = isOverLimit
      ? `You've exceeded your ${planName} ${props.metricName} limit.`
      : isCritical
        ? `You're about to hit your ${props.metricName} limit.`
        : `You've used ${percentDisplay}% of your ${props.metricName} limit.`;

    const lines: string[] = [
      headingText,
      "",
      `Hi ${greetingName},`,
      "",
    ];

    if (isOverLimit) {
      lines.push(
        `Your ${planName} has exceeded its ${props.metricName} limit on ${productName}. To avoid service interruption, upgrade your plan or wait until the limit resets${typeof props.periodEndsAt === "string" && props.periodEndsAt.length > 0 ? ` on ${props.periodEndsAt}` : ""}.`,
      );
    } else {
      lines.push(
        `Your ${planName} is at ${percentDisplay}% of its ${props.metricName} limit${typeof props.periodEndsAt === "string" && props.periodEndsAt.length > 0 ? ` for the period ending ${props.periodEndsAt}` : ""}. We're letting you know early so you can keep things running smoothly.`,
      );
    }

    lines.push("");
    lines.push(`Metric: ${props.metricName}`);
    lines.push(
      `Current usage: ${formatNumber(safeCurrent)}${unit} of ${formatNumber(safeLimit)}${unit} (${percentDisplay}%)`,
    );
    lines.push(`Plan: ${planName}`);
    if (
      typeof props.periodEndsAt === "string" &&
      props.periodEndsAt.length > 0
    ) {
      lines.push(`Resets: ${props.periodEndsAt}`);
    }
    lines.push("");
    lines.push(
      `${isOverLimit ? "Upgrade to restore service" : "Upgrade your plan"}: ${props.upgradeUrl}`,
    );

    if (
      typeof props.manageBillingUrl === "string" &&
      props.manageBillingUrl.length > 0
    ) {
      lines.push("");
      lines.push(
        `Manage billing & usage: ${props.manageBillingUrl}`,
      );
    }

    lines.push("");
    lines.push(
      `Questions about your usage, plan limits, or pricing? Reply to this email or reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default UsageLimitWarning;
