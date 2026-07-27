import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import type { UsageLimitWarningEmailProps } from "@/email-templates/usage-limit-warning";

export class UsageLimitWarning extends EmailTemplatesCatalogEntry<UsageLimitWarningEmailProps> {
  public id = "usage-limit-warning" as const satisfies string;

  public description =
    "Usage-limit warning email sent when a customer's account is approaching, has reached, or has exceeded a quota-based limit (API requests, storage, seats, outbound emails, etc.). Severity — approaching (<90%), reached (>=90%), or exceeded (>=100%) — is derived from the used/limit ratio and drives the header gradient (mirroring the theme's `--warning` and `--destructive` tokens), the progress bar fill, and a status chip. Includes a primary usage bar with percentage, a metadata table (used/limit/remaining or overage, plan name, reset date), an optional exceeded-state callout explaining what happens next, an optional list of secondary metric bars, a primary upgrade CTA, and optional links to a usage dashboard and billing settings. Props: { metricLabel: string, used: number, limit: number, upgradeUrl: string, recipientName?: string, unit?: string, planName?: string, resetAt?: string, manageBillingUrl?: string, viewUsageUrl?: string, additionalMetrics?: Array<{ label: string, used: number, limit: number, unit?: string }>, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is UsageLimitWarningEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "metricLabel",
      "upgradeUrl",
    ];
    for (const key of requiredStringKeys) {
      if (!(key in val)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' is missing required prop '${key}' (expected string).`,
        );
      }
      const value = (val as Record<string, unknown>)[key];
      if (typeof value !== "string") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected prop '${key}' to be a string, but got ${typeof value}.`,
        );
      }
      if (value.length === 0) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected prop '${key}' to be a non-empty string.`,
        );
      }
    }
    const requiredNumberKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "used",
      "limit",
    ];
    for (const key of requiredNumberKeys) {
      if (!(key in val)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' is missing required prop '${key}' (expected finite number).`,
        );
      }
      const value = (val as Record<string, unknown>)[key];
      if (typeof value !== "number") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected prop '${key}' to be a number, but got ${typeof value}.`,
        );
      }
      if (!Number.isFinite(value)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected prop '${key}' to be a finite number, but got ${value}.`,
        );
      }
      if (value < 0) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected prop '${key}' to be non-negative, but got ${value}.`,
        );
      }
    }
    const optionalStringKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "recipientName",
      "unit",
      "planName",
      "resetAt",
      "manageBillingUrl",
      "viewUsageUrl",
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
      "additionalMetrics" in val &&
      typeof val.additionalMetrics !== "undefined"
    ) {
      if (!Array.isArray(val.additionalMetrics)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'additionalMetrics' to be an array of {label,used,limit,unit?} when provided, but got ${typeof val.additionalMetrics}.`,
        );
      }
      for (let i = 0; i < val.additionalMetrics.length; i++) {
        const entry = val.additionalMetrics[i];
        if (typeof entry !== "object" || entry === null) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'additionalMetrics[${i}]' to be an object, but got ${entry === null ? "null" : typeof entry}.`,
          );
        }
        const label = (entry as Record<string, unknown>).label;
        if (typeof label !== "string" || label.length === 0) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'additionalMetrics[${i}].label' to be a non-empty string.`,
          );
        }
        for (const numKey of ["used", "limit"] as const) {
          const numVal = (entry as Record<string, unknown>)[numKey];
          if (typeof numVal !== "number" || !Number.isFinite(numVal)) {
            throw new BadEmailTemplatePropsError(
              `Template '${this.id}' expected 'additionalMetrics[${i}].${numKey}' to be a finite number, but got ${typeof numVal === "number" ? numVal : typeof numVal}.`,
            );
          }
          if (numVal < 0) {
            throw new BadEmailTemplatePropsError(
              `Template '${this.id}' expected 'additionalMetrics[${i}].${numKey}' to be non-negative, but got ${numVal}.`,
            );
          }
        }
        const entryUnit = (entry as Record<string, unknown>).unit;
        if (
          typeof entryUnit !== "undefined" &&
          typeof entryUnit !== "string"
        ) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'additionalMetrics[${i}].unit' to be a string when provided, but got ${typeof entryUnit}.`,
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
    const brand = getEmailBrand();
    const productName: string =
      typeof props.productName === "string" && props.productName.length > 0
        ? props.productName
        : brand.productName;
    const supportEmail: string =
      typeof props.supportEmail === "string" && props.supportEmail.length > 0
        ? props.supportEmail
        : brand.supportEmail;
    const greetingName: string =
      typeof props.recipientName === "string" && props.recipientName.length > 0
        ? props.recipientName
        : "there";
    const metricLabel: string =
      typeof props.metricLabel === "string" && props.metricLabel.length > 0
        ? props.metricLabel
        : "usage";
    const unit: string | undefined =
      typeof props.unit === "string" && props.unit.length > 0
        ? props.unit
        : undefined;

    const used =
      typeof props.used === "number" && Number.isFinite(props.used)
        ? props.used
        : 0;
    const limit =
      typeof props.limit === "number" && Number.isFinite(props.limit)
        ? props.limit
        : 0;
    const percent =
      limit > 0
        ? Math.max(0, Math.min(999, Math.round((used / limit) * 100)))
        : 0;

    const formatQuantity = (value: number, u: string | undefined): string => {
      const rounded = Number.isInteger(value)
        ? value
        : Math.round(value * 100) / 100;
      const withCommas = rounded.toLocaleString("en-US");
      return u && u.length > 0 ? `${withCommas} ${u}` : withCommas;
    };

    const remaining = Math.max(0, limit - used);
    const overage = Math.max(0, used - limit);

    const severity: "approaching" | "reached" | "exceeded" =
      percent >= 100 ? "exceeded" : percent >= 90 ? "reached" : "approaching";

    const headingText: string =
      severity === "exceeded"
        ? `You've exceeded your ${metricLabel} limit.`
        : severity === "reached"
          ? `You've reached your ${metricLabel} limit.`
          : `You're approaching your ${metricLabel} limit.`;

    const lines: string[] = [
      headingText,
      "",
      `Hi ${greetingName},`,
      "",
      `Your ${productName} account has used ${formatQuantity(used, unit)} of your ${formatQuantity(limit, unit)} ${metricLabel} allowance${
        typeof props.planName === "string" && props.planName.length > 0
          ? ` on the ${props.planName} plan`
          : ""
      }${
        typeof props.resetAt === "string" && props.resetAt.length > 0
          ? ` before it resets on ${props.resetAt}`
          : ""
      }.`,
      "",
      `Usage: ${formatQuantity(used, unit)} / ${formatQuantity(limit, unit)} (${percent}%)`,
    ];

    if (severity === "exceeded") {
      lines.push(`Overage: ${formatQuantity(overage, unit)}`);
    } else {
      lines.push(`Remaining: ${formatQuantity(remaining, unit)}`);
    }

    if (typeof props.planName === "string" && props.planName.length > 0) {
      lines.push(`Current plan: ${props.planName}`);
    }
    if (typeof props.resetAt === "string" && props.resetAt.length > 0) {
      lines.push(`Resets on: ${props.resetAt}`);
    }
    lines.push("");

    if (severity === "exceeded") {
      lines.push(
        `New ${metricLabel} requests may be throttled or rejected until your usage resets${
          typeof props.resetAt === "string" && props.resetAt.length > 0
            ? ` on ${props.resetAt}`
            : ""
        }, or until you raise your limit by upgrading your plan.`,
      );
      lines.push("");
    }

    const additionalMetrics = Array.isArray(props.additionalMetrics)
      ? props.additionalMetrics.filter(
          (
            m,
          ): m is {
            label: string;
            used: number;
            limit: number;
            unit?: string;
          } =>
            typeof m === "object" &&
            m !== null &&
            typeof (m as { label: unknown }).label === "string" &&
            typeof (m as { used: unknown }).used === "number" &&
            Number.isFinite((m as { used: number }).used) &&
            typeof (m as { limit: unknown }).limit === "number" &&
            Number.isFinite((m as { limit: number }).limit),
        )
      : [];

    if (additionalMetrics.length > 0) {
      lines.push("Other metrics this period:");
      for (const metric of additionalMetrics) {
        const metricUnit =
          typeof metric.unit === "string" && metric.unit.length > 0
            ? metric.unit
            : undefined;
        const p =
          metric.limit > 0
            ? Math.max(
                0,
                Math.min(999, Math.round((metric.used / metric.limit) * 100)),
              )
            : 0;
        lines.push(
          `  - ${metric.label}: ${formatQuantity(metric.used, metricUnit)} / ${formatQuantity(metric.limit, metricUnit)} (${p}%)`,
        );
      }
      lines.push("");
    }

    lines.push(`Upgrade plan: ${props.upgradeUrl}`);
    lines.push("");

    if (
      typeof props.viewUsageUrl === "string" &&
      props.viewUsageUrl.length > 0
    ) {
      lines.push(
        `See a detailed breakdown in your usage dashboard: ${props.viewUsageUrl}`,
      );
    }
    if (
      typeof props.manageBillingUrl === "string" &&
      props.manageBillingUrl.length > 0
    ) {
      lines.push(
        `Manage plans, seats, and payment in your billing settings: ${props.manageBillingUrl}`,
      );
    }
    if (
      (typeof props.viewUsageUrl === "string" &&
        props.viewUsageUrl.length > 0) ||
      (typeof props.manageBillingUrl === "string" &&
        props.manageBillingUrl.length > 0)
    ) {
      lines.push("");
    }

    lines.push(
      `Questions about limits, overage pricing, or the right plan for your workload? Reply to this email or reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default UsageLimitWarning;
