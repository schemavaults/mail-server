import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type {
  UsageLimitWarningEmailProps,
  UsageLimitWarningStatus,
} from "@/email-templates/usage-limit-warning";

const VALID_STATUSES: readonly UsageLimitWarningStatus[] = [
  "approaching",
  "exceeded",
];

export class UsageLimitWarning extends EmailTemplatesCatalogEntry<UsageLimitWarningEmailProps> {
  public id = "usage-limit-warning" as const satisfies string;

  public description =
    "Usage/quota limit warning email sent when an account approaches or reaches a plan usage limit (API requests, storage, seats, etc.). Severity-themed header — amber/`--warning` gradient for 'approaching', `--schemavaults-brand-red` gradient for 'exceeded' — plus a usage progress bar, a metadata table (metric, plan, used/limit, reset time), an optional consequences callout, and a primary upgrade CTA with a visible fallback link. Props: { metricName: string, usedAmount: string, limitAmount: string, percentUsed: number, upgradeUrl: string, status?: \"approaching\" | \"exceeded\", recipientName?: string, planName?: string, periodLabel?: string, resetsAt?: string, manageUsageUrl?: string, consequences?: string[], productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is UsageLimitWarningEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "metricName",
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
    if (!("percentUsed" in val)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' is missing required prop 'percentUsed' (expected finite number).`,
      );
    }
    if (typeof val.percentUsed !== "number") {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'percentUsed' to be a number, but got ${typeof val.percentUsed}.`,
      );
    }
    if (!Number.isFinite(val.percentUsed)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'percentUsed' to be a finite number, but got ${val.percentUsed}.`,
      );
    }
    const optionalStringKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "recipientName",
      "planName",
      "periodLabel",
      "resetsAt",
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
    if ("status" in val && typeof val.status !== "undefined") {
      if (typeof val.status !== "string") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'status' to be a string when provided, but got ${typeof val.status}.`,
        );
      }
      if (
        !VALID_STATUSES.includes(val.status as UsageLimitWarningStatus)
      ) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'status' to be one of ${VALID_STATUSES.map((s) => `'${s}'`).join(" | ")}, but got '${val.status}'.`,
        );
      }
    }
    if ("consequences" in val && typeof val.consequences !== "undefined") {
      if (!Array.isArray(val.consequences)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'consequences' to be an array of strings when provided, but got ${typeof val.consequences}.`,
        );
      }
      for (let i = 0; i < val.consequences.length; i++) {
        if (typeof val.consequences[i] !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected every entry of prop 'consequences' to be a string, but entry at index ${i} is ${typeof val.consequences[i]}.`,
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
    const metricName: string =
      typeof props.metricName === "string" && props.metricName.length > 0
        ? props.metricName
        : "usage";
    const usedAmount: string =
      typeof props.usedAmount === "string" && props.usedAmount.length > 0
        ? props.usedAmount
        : "0";
    const limitAmount: string =
      typeof props.limitAmount === "string" && props.limitAmount.length > 0
        ? props.limitAmount
        : "0";
    const planName: string =
      typeof props.planName === "string" && props.planName.length > 0
        ? props.planName
        : "current plan";
    const periodLabel: string =
      typeof props.periodLabel === "string" && props.periodLabel.length > 0
        ? props.periodLabel
        : "this billing period";

    const rawPercent: number =
      typeof props.percentUsed === "number" &&
      Number.isFinite(props.percentUsed)
        ? props.percentUsed
        : 0;
    const displayPercent: number = Math.max(0, Math.round(rawPercent));
    const isExceeded: boolean =
      props.status === "exceeded" || rawPercent >= 100;

    const headingText: string = isExceeded
      ? `You've reached your ${metricName} limit.`
      : `You're approaching your ${metricName} limit.`;
    const introText: string = isExceeded
      ? `You've used all of your ${metricName} allowance for ${periodLabel} on your ${productName} ${planName}. New requests against this limit may be rejected until usage resets or you upgrade.`
      : `You've used most of your ${metricName} allowance for ${periodLabel} on your ${productName} ${planName}. Upgrade now to avoid any interruption before usage resets.`;

    const lines: string[] = [
      headingText,
      "",
      `Hi ${greetingName},`,
      "",
      introText,
      "",
      `Metric: ${metricName}`,
      `Plan: ${planName}`,
      `Used: ${usedAmount} of ${limitAmount} (${displayPercent}%)`,
    ];

    if (typeof props.resetsAt === "string" && props.resetsAt.length > 0) {
      lines.push(`Resets: ${props.resetsAt}`);
    }
    lines.push("");

    const consequences: string[] = Array.isArray(props.consequences)
      ? props.consequences.filter(
          (item): item is string =>
            typeof item === "string" && item.length > 0,
        )
      : [];

    if (consequences.length > 0) {
      lines.push(
        isExceeded
          ? "What happens now:"
          : "What happens when you hit the limit:",
      );
      for (const item of consequences) {
        lines.push(`  - ${item}`);
      }
      lines.push("");
    }

    lines.push(
      `${isExceeded ? "Upgrade to restore access" : "Upgrade your plan"}: ${props.upgradeUrl}`,
    );
    lines.push("");

    if (
      typeof props.manageUsageUrl === "string" &&
      props.manageUsageUrl.length > 0
    ) {
      lines.push(
        `Want to inspect your usage breakdown or set up alerts? Open your usage dashboard: ${props.manageUsageUrl}`,
      );
      lines.push("");
    }

    lines.push(
      `Questions about plan limits, overage pricing, or raising a quota? Reply to this email or reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default UsageLimitWarning;
