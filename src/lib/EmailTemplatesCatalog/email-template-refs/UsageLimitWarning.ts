import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { UsageLimitWarningEmailProps } from "@/email-templates/usage-limit-warning";

export class UsageLimitWarning extends EmailTemplatesCatalogEntry<UsageLimitWarningEmailProps> {
  public id = "usage-limit-warning" as const satisfies string;

  public description =
    "Usage / quota limit warning email sent when an account approaches or exceeds a plan resource limit (API requests, storage, schema definitions, seats, etc.). The header gradient and usage progress bar escalate by severity using @schemavaults/theme brand tokens — brand-blue for a notice, amber for a warning (>=75%), and brand-red for a critical/over-limit state (>=90%). Includes a percentage progress bar, a metadata table (resource, used/limit, plan, reset date), an optional 'what happens at the limit' callout, a primary upgrade CTA, and an optional usage-dashboard link. Props: { resourceName: string, usedAmount: string, limitAmount: string, upgradeUrl: string, usagePercent?: number, userName?: string, planName?: string, resetDate?: string, overageConsequence?: string, dashboardUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is UsageLimitWarningEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "resourceName",
      "usedAmount",
      "limitAmount",
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
    if (
      "usagePercent" in val &&
      typeof (val as Record<string, unknown>).usagePercent !== "undefined"
    ) {
      if (typeof (val as Record<string, unknown>).usagePercent !== "number") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'usagePercent' to be a number when provided, but got ${typeof (val as Record<string, unknown>).usagePercent}.`,
        );
      }
      if (
        !Number.isFinite((val as Record<string, number>).usagePercent)
      ) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'usagePercent' to be a finite number, but got ${(val as Record<string, number>).usagePercent}.`,
        );
      }
    }
    const optionalStringKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "userName",
      "planName",
      "resetDate",
      "overageConsequence",
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
      typeof props.userName === "string" && props.userName.length > 0
        ? props.userName
        : "there";
    const resourceName: string =
      typeof props.resourceName === "string" && props.resourceName.length > 0
        ? props.resourceName
        : "your plan resources";

    const parseNumericValue = (raw: string | undefined): number | undefined => {
      if (typeof raw !== "string") {
        return undefined;
      }
      const cleaned = raw.replace(/[^0-9.\-]/g, "");
      if (cleaned.length === 0) {
        return undefined;
      }
      const parsed = Number(cleaned);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    let effectivePercent: number;
    if (
      typeof props.usagePercent === "number" &&
      Number.isFinite(props.usagePercent)
    ) {
      effectivePercent = Math.max(0, props.usagePercent);
    } else {
      const used = parseNumericValue(props.usedAmount);
      const limit = parseNumericValue(props.limitAmount);
      if (
        typeof used === "number" &&
        typeof limit === "number" &&
        limit > 0
      ) {
        effectivePercent = Math.max(0, (used / limit) * 100);
      } else {
        effectivePercent = 90;
      }
    }
    const roundedPercent: number = Math.round(effectivePercent);
    const overLimit: boolean = effectivePercent >= 100;

    const headingText: string = overLimit
      ? `You've reached your ${resourceName} limit.`
      : `You've used ${roundedPercent}% of your ${resourceName}.`;

    const introText: string = overLimit
      ? `Your ${productName} account has hit its ${resourceName} limit for the current period. New requests against this resource may be throttled or rejected until you upgrade or the quota resets.`
      : `Your ${productName} account is approaching its ${resourceName} limit for the current period. Upgrade now to avoid interruptions when you hit the cap.`;

    const lines: string[] = [
      headingText,
      "",
      `Hi ${greetingName},`,
      "",
      introText,
      "",
      `Resource: ${resourceName}`,
      `Used: ${props.usedAmount} / ${props.limitAmount} (${roundedPercent}%)`,
    ];

    if (typeof props.planName === "string" && props.planName.length > 0) {
      lines.push(`Current plan: ${props.planName}`);
    }
    if (typeof props.resetDate === "string" && props.resetDate.length > 0) {
      lines.push(`Quota resets: ${props.resetDate}`);
    }
    lines.push("");

    if (
      typeof props.overageConsequence === "string" &&
      props.overageConsequence.length > 0
    ) {
      lines.push("What happens at the limit:");
      lines.push(`  ${props.overageConsequence}`);
      lines.push("");
    }

    lines.push(
      `${overLimit ? "Upgrade to restore access" : "Upgrade your plan"}: ${props.upgradeUrl}`,
    );
    lines.push("");

    if (
      typeof props.dashboardUrl === "string" &&
      props.dashboardUrl.length > 0
    ) {
      lines.push(
        `Want a detailed breakdown of your consumption? Open your usage dashboard: ${props.dashboardUrl}`,
      );
      lines.push("");
    }

    lines.push(
      `Questions about plan limits, usage-based pricing, or raising your quota? Reply to this email or reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default UsageLimitWarning;
