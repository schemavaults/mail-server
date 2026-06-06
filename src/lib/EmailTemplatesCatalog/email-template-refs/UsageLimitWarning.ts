import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { UsageLimitWarningEmailProps } from "@/email-templates/usage-limit-warning";

function formatUsageNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return String(value);
  }
  if (Number.isInteger(value)) {
    return value.toLocaleString("en-US");
  }
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export class UsageLimitWarning extends EmailTemplatesCatalogEntry<UsageLimitWarningEmailProps> {
  public id = "usage-limit-warning" as const satisfies string;

  public description =
    "Usage-limit warning email sent when an account approaches or reaches a metered-resource quota (API requests, storage, schemas, etc.) for a billing period. Severity-tiered theming switches the header gradient and callout from amber (`--warning` token) to red (`--destructive` / brand-red token) once the limit is reached. Includes a table-based progress bar that renders reliably in Outlook/Gmail, a metadata table (resource, usage, percent used, plan, reset date), a tone-aware callout, and a primary upgrade CTA with an optional dashboard secondary link. Props: { resourceName: string, currentUsage: number, usageLimit: number, upgradeUrl: string, recipientName?: string, unit?: string, periodEndsAt?: string, planName?: string, dashboardUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is UsageLimitWarningEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }

    const requiredNumberKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "currentUsage",
      "usageLimit",
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

    if ((val as Record<string, unknown>).usageLimit === 0) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'usageLimit' to be greater than zero (cannot compute a percentage against a zero limit).`,
      );
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
      "recipientName",
      "unit",
      "periodEndsAt",
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
    const unit: string =
      typeof props.unit === "string" && props.unit.length > 0 ? props.unit : "";

    const safeLimit: number =
      typeof props.usageLimit === "number" && props.usageLimit > 0
        ? props.usageLimit
        : 1;
    const safeUsage: number =
      typeof props.currentUsage === "number" && props.currentUsage >= 0
        ? props.currentUsage
        : 0;
    const displayPercentage: number = Math.round((safeUsage / safeLimit) * 100);
    const hasExceeded: boolean = safeUsage >= safeLimit;

    const usageDisplay = unit
      ? `${formatUsageNumber(safeUsage)} ${unit} of ${formatUsageNumber(safeLimit)} ${unit}`
      : `${formatUsageNumber(safeUsage)} of ${formatUsageNumber(safeLimit)}`;

    const lines: string[] = [
      hasExceeded
        ? `You've reached your ${props.resourceName} limit on ${productName}.`
        : `You're approaching your ${props.resourceName} limit on ${productName}.`,
      "",
      `Hi ${greetingName},`,
      "",
      hasExceeded
        ? `Your account has reached its ${props.resourceName} limit for the current billing period on ${productName}. New ${props.resourceName} requests may be rejected or throttled until you upgrade or the period resets.`
        : `Your account has used ${displayPercentage}% of its ${props.resourceName} allowance for the current billing period on ${productName}. Upgrade your plan or reduce usage to avoid interruptions.`,
      "",
      `Resource: ${props.resourceName}`,
      `Usage: ${usageDisplay}`,
      `Percent used: ${displayPercentage}%`,
    ];

    if (typeof props.planName === "string" && props.planName.length > 0) {
      lines.push(`Current plan: ${props.planName}`);
    }
    if (
      typeof props.periodEndsAt === "string" &&
      props.periodEndsAt.length > 0
    ) {
      lines.push(`Resets: ${props.periodEndsAt}`);
    }

    lines.push("");
    lines.push(
      hasExceeded
        ? `Upgrade plan: ${props.upgradeUrl}`
        : `Upgrade to avoid interruption: ${props.upgradeUrl}`,
    );

    if (
      typeof props.dashboardUrl === "string" &&
      props.dashboardUrl.length > 0
    ) {
      lines.push(`Review usage: ${props.dashboardUrl}`);
    }

    lines.push("");
    lines.push(`Questions about your usage or plan? Reach us at ${supportEmail}.`);

    return lines.join("\n");
  }
}

export default UsageLimitWarning;
