import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { UsageLimitWarningEmailProps } from "@/email-templates/usage-limit-warning";

export class UsageLimitWarning extends EmailTemplatesCatalogEntry<UsageLimitWarningEmailProps> {
  public id = "usage-limit-warning" as const satisfies string;

  public description =
    "Usage/quota limit warning email sent when an account approaches or reaches an included usage limit (API requests, storage, seats, etc.). The header gradient and usage-meter bar shift color by severity — brand blue (`--schemavaults-brand-blue`) under 80%, amber near the limit, brand red (`--schemavaults-brand-red`) at/over 100% — and the body shows a visual usage meter, a metadata table (plan, used, included, remaining, resets), an optional 'what's driving usage' breakdown, a primary upgrade CTA, and an optional usage-dashboard link. Props: { resourceName: string, usedAmount: number, limitAmount: number, upgradeUrl: string, unit?: string, recipientName?: string, planName?: string, resetAt?: string, topConsumers?: string[], manageUsageUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is UsageLimitWarningEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredNumberKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "usedAmount",
      "limitAmount",
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
      "unit",
      "recipientName",
      "planName",
      "resetAt",
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
    if ("topConsumers" in val && typeof val.topConsumers !== "undefined") {
      if (!Array.isArray(val.topConsumers)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'topConsumers' to be an array of strings when provided, but got ${typeof val.topConsumers}.`,
        );
      }
      for (let i = 0; i < val.topConsumers.length; i++) {
        if (typeof val.topConsumers[i] !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected every entry of prop 'topConsumers' to be a string, but entry at index ${i} is ${typeof val.topConsumers[i]}.`,
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
        : "plan usage";
    const unit: string | undefined =
      typeof props.unit === "string" && props.unit.length > 0
        ? props.unit
        : undefined;
    const planName: string | undefined =
      typeof props.planName === "string" && props.planName.length > 0
        ? props.planName
        : undefined;
    const resetAt: string | undefined =
      typeof props.resetAt === "string" && props.resetAt.length > 0
        ? props.resetAt
        : undefined;

    const formatAmount = (value: number): string => {
      const rounded: number = Number.isInteger(value)
        ? value
        : Math.round(value * 100) / 100;
      const formatted: string = rounded.toLocaleString("en-US");
      return unit ? `${formatted} ${unit}` : formatted;
    };

    const safeUsed: number =
      typeof props.usedAmount === "number" && Number.isFinite(props.usedAmount)
        ? Math.max(0, props.usedAmount)
        : 0;
    const safeLimit: number =
      typeof props.limitAmount === "number" &&
      Number.isFinite(props.limitAmount)
        ? Math.max(0, props.limitAmount)
        : 0;

    const rawPercent: number = safeLimit > 0 ? (safeUsed / safeLimit) * 100 : 0;
    const displayPercent: number = Math.round(rawPercent);
    const remainingAmount: number = Math.max(0, safeLimit - safeUsed);
    const overLimit: boolean = rawPercent >= 100;

    const headingText: string = overLimit
      ? `You've reached your ${resourceName} limit.`
      : `You've used ${displayPercent}% of your ${resourceName}.`;

    const introText: string = overLimit
      ? `You've used all of your included ${resourceName}${planName ? ` on the ${planName} plan` : ""}. Until your quota resets${resetAt ? ` on ${resetAt}` : ""} or you upgrade, new requests against this resource may be throttled or rejected.`
      : `You're getting close to your included ${resourceName}${planName ? ` on the ${planName} plan` : ""}. Upgrade now to raise your limit and avoid any interruption${resetAt ? ` before your quota resets on ${resetAt}` : ""}.`;

    const lines: string[] = [
      headingText,
      "",
      `Hi ${greetingName},`,
      "",
      introText,
      "",
      `Usage: ${formatAmount(safeUsed)} of ${formatAmount(safeLimit)} (${displayPercent}%)`,
    ];

    if (planName) {
      lines.push(`Current plan: ${planName}`);
    }
    lines.push(`Remaining: ${formatAmount(remainingAmount)}`);
    if (resetAt) {
      lines.push(`Resets: ${resetAt}`);
    }
    lines.push("");

    const topConsumers: string[] = Array.isArray(props.topConsumers)
      ? props.topConsumers.filter(
          (item): item is string => typeof item === "string" && item.length > 0,
        )
      : [];

    if (topConsumers.length > 0) {
      lines.push("What's driving usage:");
      for (const item of topConsumers) {
        lines.push(`  - ${item}`);
      }
      lines.push("");
    }

    lines.push(
      `${overLimit ? "Upgrade to restore access" : "Upgrade plan"}: ${props.upgradeUrl}`,
    );
    lines.push("");

    if (
      typeof props.manageUsageUrl === "string" &&
      props.manageUsageUrl.length > 0
    ) {
      lines.push(
        `Want a full breakdown of where your ${resourceName} is going? View your usage dashboard: ${props.manageUsageUrl}`,
      );
      lines.push("");
    }

    lines.push(
      `Questions about your limits, usage, or the right plan for your team? Reply to this email or reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default UsageLimitWarning;
