import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type {
  UsageQuotaMetric,
  UsageQuotaWarningEmailProps,
} from "@/email-templates/usage-quota-warning";

export class UsageQuotaWarning extends EmailTemplatesCatalogEntry<UsageQuotaWarningEmailProps> {
  public id = "usage-quota-warning" as const satisfies string;

  public description =
    "Usage-quota warning email sent when a user crosses a soft (80%) or hard (100%) plan limit. Uses an amber gradient header for soft warnings and a red gradient header for at-limit usage (mirroring the @schemavaults/theme `--warning` and `--destructive`/`--schemavaults-brand-red` tokens). Renders per-metric cards with a colored progress bar, a status pill (On track / Approaching / At limit), a `used / limit` line, an optional billing-period-reset pill, a contextual callout, a primary upgrade CTA, and an optional billing-settings link. Props: { planName: string, upgradeUrl: string, metrics: Array<{ label: string, used: number, limit: number, unit?: string }>, recipientName?: string, upgradePlanName?: string, billingPeriodEndsAt?: string, manageBillingUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is UsageQuotaWarningEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof UsageQuotaWarningEmailProps)[] = [
      "planName",
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
    if (!("metrics" in val)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' is missing required prop 'metrics' (expected array of { label, used, limit, unit? }).`,
      );
    }
    if (!Array.isArray((val as Record<string, unknown>).metrics)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'metrics' to be an array, but got ${typeof (val as Record<string, unknown>).metrics}.`,
      );
    }
    const metrics = (val as { metrics: unknown[] }).metrics;
    for (let i = 0; i < metrics.length; i++) {
      const m = metrics[i];
      if (typeof m !== "object" || m === null) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected each entry of 'metrics' to be an object, but entry at index ${i} is ${m === null ? "null" : typeof m}.`,
        );
      }
      const metric = m as Record<string, unknown>;
      if (typeof metric.label !== "string" || metric.label.length === 0) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected 'metrics[${i}].label' to be a non-empty string, but got ${typeof metric.label}.`,
        );
      }
      if (typeof metric.used !== "number" || !Number.isFinite(metric.used)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected 'metrics[${i}].used' to be a finite number, but got ${typeof metric.used === "number" ? metric.used : typeof metric.used}.`,
        );
      }
      if (typeof metric.limit !== "number" || !Number.isFinite(metric.limit)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected 'metrics[${i}].limit' to be a finite number, but got ${typeof metric.limit === "number" ? metric.limit : typeof metric.limit}.`,
        );
      }
      if (
        "unit" in metric &&
        typeof metric.unit !== "undefined" &&
        typeof metric.unit !== "string"
      ) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected 'metrics[${i}].unit' to be a string when provided, but got ${typeof metric.unit}.`,
        );
      }
    }
    const optionalStringKeys: readonly (keyof UsageQuotaWarningEmailProps)[] = [
      "recipientName",
      "upgradePlanName",
      "billingPeriodEndsAt",
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
    const upgradePlanName: string =
      typeof props.upgradePlanName === "string" &&
      props.upgradePlanName.length > 0
        ? props.upgradePlanName
        : "the next tier";

    const metrics: UsageQuotaMetric[] = Array.isArray(props.metrics)
      ? props.metrics.filter(
          (m): m is UsageQuotaMetric =>
            typeof m === "object" &&
            m !== null &&
            typeof m.label === "string" &&
            m.label.length > 0 &&
            typeof m.used === "number" &&
            Number.isFinite(m.used) &&
            typeof m.limit === "number" &&
            Number.isFinite(m.limit),
        )
      : [];

    const renderedMetrics = metrics.map((m) => {
      const safeLimit: number = m.limit > 0 ? m.limit : 0;
      const safeUsed: number = Math.max(0, m.used);
      const rawPercent: number =
        safeLimit > 0 ? (safeUsed / safeLimit) * 100 : safeUsed > 0 ? 100 : 0;
      const percent: number = Math.min(
        100,
        Math.max(0, Math.round(rawPercent)),
      );
      const severity: "ok" | "warn" | "critical" =
        rawPercent >= 100 ? "critical" : rawPercent >= 80 ? "warn" : "ok";
      const status: string =
        severity === "critical"
          ? "AT LIMIT"
          : severity === "warn"
            ? "APPROACHING"
            : "ON TRACK";
      const unitSuffix: string =
        typeof m.unit === "string" && m.unit.length > 0 ? ` ${m.unit}` : "";
      return { ...m, percent, status, unitSuffix };
    });

    const hasCritical: boolean = renderedMetrics.some(
      (m) => m.status === "AT LIMIT",
    );

    const headingText: string = hasCritical
      ? `You've hit a limit on the ${props.planName} plan on ${productName}.`
      : `You're approaching a limit on the ${props.planName} plan on ${productName}.`;

    const lines: string[] = [
      headingText,
      "",
      `Hi ${greetingName},`,
      "",
      hasCritical
        ? `One or more usage metrics on your ${props.planName} plan have reached 100%. New work may be blocked until you upgrade or your billing period resets.`
        : `One or more usage metrics on your ${props.planName} plan have crossed 80%. Upgrade to ${upgradePlanName} to avoid hitting a hard limit before your billing period resets.`,
      "",
    ];

    if (
      typeof props.billingPeriodEndsAt === "string" &&
      props.billingPeriodEndsAt.length > 0
    ) {
      lines.push(`Billing period resets: ${props.billingPeriodEndsAt}`);
      lines.push("");
    }

    if (renderedMetrics.length > 0) {
      lines.push("Current usage:");
      for (const m of renderedMetrics) {
        lines.push(
          `  - ${m.label}: ${m.used}${m.unitSuffix} of ${m.limit}${m.unitSuffix} (${m.percent}%) — ${m.status}`,
        );
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
        `Prefer to manage your plan yourself? Visit your billing settings to change plans, raise limits, or review past invoices: ${props.manageBillingUrl}`,
      );
      lines.push("");
    }

    lines.push(
      `Questions about which plan fits your workload, custom limits, or enterprise pricing? Reply to this email or reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default UsageQuotaWarning;
