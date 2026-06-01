import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { UsageLimitWarningEmailProps } from "@/email-templates/usage-limit-warning";

export class UsageLimitWarning extends EmailTemplatesCatalogEntry<UsageLimitWarningEmailProps> {
  public id = "usage-limit-warning" as const satisfies string;

  public description =
    "Usage / quota warning email sent when an account is approaching (or exceeding) a plan-imposed resource limit (API requests, storage, seats, etc.). Header color shifts automatically by severity tier: blue informational (<80%), amber warning (80–94%), and red critical (95%+), all sourced from the @schemavaults/theme brand and warning palette. Includes a visual usage progress bar, a metadata table (resource, plan, used / limit, percent, reset date), an optional 'what happens at the limit' callout, an optional recommended-plan callout, and a primary upgrade CTA with a visible fallback link. Props: { resourceName: string, currentUsage: string, usageLimit: string, percentUsed: number, upgradeUrl: string, recipientName?: string, currentPlan?: string, recommendedPlanName?: string, recommendedPlanLimit?: string, recommendedPlanPrice?: string, resetDate?: string, overageBehavior?: string, manageUsageUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is UsageLimitWarningEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const record = val as Record<string, unknown>;

    const requiredStringKeys: readonly (keyof UsageLimitWarningEmailProps)[] =
      ["resourceName", "currentUsage", "usageLimit", "upgradeUrl"];
    for (const key of requiredStringKeys) {
      if (!(key in record)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' is missing required prop '${key}' (expected string).`,
        );
      }
      if (typeof record[key] !== "string") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected prop '${key}' to be a string, but got ${typeof record[key]}.`,
        );
      }
    }

    if (!("percentUsed" in record)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' is missing required prop 'percentUsed' (expected number).`,
      );
    }
    if (typeof record.percentUsed !== "number") {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'percentUsed' to be a number, but got ${typeof record.percentUsed}.`,
      );
    }
    if (!Number.isFinite(record.percentUsed)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'percentUsed' to be a finite number, but got ${String(record.percentUsed)}.`,
      );
    }

    const optionalStringKeys: readonly (keyof UsageLimitWarningEmailProps)[] =
      [
        "recipientName",
        "currentPlan",
        "recommendedPlanName",
        "recommendedPlanLimit",
        "recommendedPlanPrice",
        "resetDate",
        "overageBehavior",
        "manageUsageUrl",
        "productName",
        "supportEmail",
      ];
    for (const key of optionalStringKeys) {
      if (
        key in record &&
        typeof record[key] !== "undefined" &&
        typeof record[key] !== "string"
      ) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop '${key}' to be a string when provided, but got ${typeof record[key]}.`,
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
    const currentPlan: string =
      typeof props.currentPlan === "string" && props.currentPlan.length > 0
        ? props.currentPlan
        : "your current plan";
    const recommendedPlanName: string =
      typeof props.recommendedPlanName === "string" &&
      props.recommendedPlanName.length > 0
        ? props.recommendedPlanName
        : "a higher tier";

    const rawPercent: number =
      typeof props.percentUsed === "number" &&
      Number.isFinite(props.percentUsed)
        ? props.percentUsed
        : 0;
    const clampedPercent: number = Math.max(0, Math.min(100, rawPercent));
    const displayPercent: number = Math.round(clampedPercent);

    const severityLabel: string =
      clampedPercent >= 95
        ? "CRITICAL"
        : clampedPercent >= 80
          ? "WARNING"
          : "HEADS UP";

    const headingLine: string =
      clampedPercent >= 95
        ? `You've nearly exhausted your ${props.resourceName} quota.`
        : clampedPercent >= 80
          ? `You're approaching your ${props.resourceName} limit.`
          : `Usage update for ${props.resourceName}.`;

    const lines: string[] = [
      `[${severityLabel}] ${headingLine}`,
      "",
      `Hi ${greetingName},`,
      "",
      `Your ${productName} account has used ${props.currentUsage} of ${props.usageLimit} ${props.resourceName} on ${currentPlan}${
        typeof props.resetDate === "string" && props.resetDate.length > 0
          ? ` for the period ending ${props.resetDate}`
          : ""
      }.`,
      "",
      `Resource: ${props.resourceName}`,
      `Current plan: ${currentPlan}`,
      `Used: ${props.currentUsage} of ${props.usageLimit}`,
      `Percent used: ${displayPercent}%`,
    ];

    if (typeof props.resetDate === "string" && props.resetDate.length > 0) {
      lines.push(`Resets: ${props.resetDate}`);
    }

    if (
      typeof props.overageBehavior === "string" &&
      props.overageBehavior.length > 0
    ) {
      lines.push("");
      lines.push("What happens if you hit the limit:");
      lines.push(`  ${props.overageBehavior}`);
    }

    if (
      typeof props.recommendedPlanLimit === "string" &&
      props.recommendedPlanLimit.length > 0
    ) {
      lines.push("");
      lines.push(`Recommended plan: ${recommendedPlanName}`);
      lines.push(
        `  Includes ${props.recommendedPlanLimit} of ${props.resourceName}.`,
      );
      if (
        typeof props.recommendedPlanPrice === "string" &&
        props.recommendedPlanPrice.length > 0
      ) {
        lines.push(`  Starting at ${props.recommendedPlanPrice}.`);
      }
    } else if (
      typeof props.recommendedPlanPrice === "string" &&
      props.recommendedPlanPrice.length > 0
    ) {
      lines.push("");
      lines.push(
        `Recommended plan: ${recommendedPlanName} (${props.recommendedPlanPrice}).`,
      );
    }

    lines.push("");
    lines.push(
      `Upgrade ${recommendedPlanName !== "a higher tier" ? `to ${recommendedPlanName}` : "your plan"}: ${props.upgradeUrl}`,
    );

    if (
      typeof props.manageUsageUrl === "string" &&
      props.manageUsageUrl.length > 0
    ) {
      lines.push("");
      lines.push(`View your usage dashboard: ${props.manageUsageUrl}`);
    }

    lines.push("");
    lines.push(
      `Questions about plan limits or overage policy? Reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default UsageLimitWarning;
