import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { UsageLimitWarningEmailProps } from "@/email-templates/usage-limit-warning";

const VALID_SEVERITIES: readonly NonNullable<
  UsageLimitWarningEmailProps["severity"]
>[] = ["approaching", "critical", "exceeded"];

export class UsageLimitWarning extends EmailTemplatesCatalogEntry<UsageLimitWarningEmailProps> {
  public id = "usage-limit-warning" as const satisfies string;

  public description =
    "Usage limit / quota alert sent when an account approaches, nearly reaches, or exceeds a metered resource limit (API requests, storage, vaults, schemas, seats, etc.) for the current billing period. Uses the SchemaVaults brand gradient header, a severity badge that adapts color based on threshold (amber for approaching/critical, red for exceeded), an inline visual progress bar with percentage and absolute usage, a metadata table (resource, usage, period, current plan, reset time), a contextual callout with next-step guidance, and a primary CTA to review or upgrade plans with an optional secondary 'manage usage' link. Props: { resourceName: string, currentUsage: number, limit: number, recipientName?: string, unit?: string, severity?: 'approaching'|'critical'|'exceeded', periodLabel?: string, resetsAt?: string, currentPlan?: string, upgradePlanName?: string, upgradeUrl?: string, manageUsageUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is UsageLimitWarningEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const record = val as Record<string, unknown>;

    if (!("resourceName" in record)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' is missing required prop 'resourceName' (expected string).`,
      );
    }
    if (typeof record.resourceName !== "string") {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'resourceName' to be a string, but got ${typeof record.resourceName}.`,
      );
    }
    if (record.resourceName.length === 0) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'resourceName' to be a non-empty string.`,
      );
    }

    const requiredNumberKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "currentUsage",
      "limit",
    ];
    for (const key of requiredNumberKeys) {
      if (!(key in record)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' is missing required prop '${key}' (expected finite number).`,
        );
      }
      const value = record[key as string];
      if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected prop '${key}' to be a finite number, but got ${typeof value === "number" ? "non-finite number" : typeof value}.`,
        );
      }
      if (value < 0) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected prop '${key}' to be non-negative, but got ${value}.`,
        );
      }
    }

    if ((record.limit as number) <= 0) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'limit' to be greater than 0, but got ${String(record.limit)}.`,
      );
    }

    if (
      "severity" in record &&
      typeof record.severity !== "undefined" &&
      !VALID_SEVERITIES.includes(
        record.severity as NonNullable<
          UsageLimitWarningEmailProps["severity"]
        >,
      )
    ) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected optional prop 'severity' to be one of ${VALID_SEVERITIES.map((s) => `'${s}'`).join(", ")} when provided, but got ${typeof record.severity === "string" ? `'${record.severity}'` : typeof record.severity}.`,
      );
    }

    const optionalStringKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "recipientName",
      "unit",
      "periodLabel",
      "resetsAt",
      "currentPlan",
      "upgradePlanName",
      "upgradeUrl",
      "manageUsageUrl",
      "productName",
      "supportEmail",
    ];
    for (const key of optionalStringKeys) {
      if (
        key in record &&
        typeof record[key as string] !== "undefined" &&
        typeof record[key as string] !== "string"
      ) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop '${key}' to be a string when provided, but got ${typeof record[key as string]}.`,
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
    const periodLabel: string =
      typeof props.periodLabel === "string" && props.periodLabel.length > 0
        ? props.periodLabel
        : "current billing period";
    const upgradeUrl: string =
      typeof props.upgradeUrl === "string" && props.upgradeUrl.length > 0
        ? props.upgradeUrl
        : "https://schemavaults.com/billing/plans";

    const pct: number =
      Number.isFinite(props.currentUsage) &&
      Number.isFinite(props.limit) &&
      props.limit > 0
        ? Math.min(
            100,
            Math.max(0, Math.round((props.currentUsage / props.limit) * 100)),
          )
        : 0;
    const severity: NonNullable<UsageLimitWarningEmailProps["severity"]> =
      props.severity ??
      (pct >= 100 ? "exceeded" : pct >= 90 ? "critical" : "approaching");

    const usageDisplay: string = unit
      ? `${props.currentUsage.toLocaleString("en-US")} ${unit} of ${props.limit.toLocaleString("en-US")} ${unit}`
      : `${props.currentUsage.toLocaleString("en-US")} of ${props.limit.toLocaleString("en-US")}`;

    const headlines: Record<
      NonNullable<UsageLimitWarningEmailProps["severity"]>,
      string
    > = {
      approaching: `You're approaching your ${props.resourceName} limit on ${productName}.`,
      critical: `You've nearly used all of your ${props.resourceName} on ${productName}.`,
      exceeded: `Your ${props.resourceName} limit has been reached on ${productName}.`,
    };

    const ledes: Record<
      NonNullable<UsageLimitWarningEmailProps["severity"]>,
      string
    > = {
      approaching: `Your account has used ${pct}% of its ${props.resourceName} allotment for the ${periodLabel}. You won't be interrupted yet, but it's a good time to plan ahead.`,
      critical: `Your account has used ${pct}% of its ${props.resourceName} allotment for the ${periodLabel}. New requests will start being rejected once the limit is reached.`,
      exceeded: `Your account has hit its ${props.resourceName} limit for the ${periodLabel}. Further requests will be rejected until the period resets or you upgrade.`,
    };

    const lines: string[] = [
      headlines[severity],
      "",
      `Hi ${greetingName},`,
      "",
      ledes[severity],
      "",
      `${props.resourceName}: ${pct}%`,
      `Usage: ${usageDisplay}`,
      `Period: ${periodLabel}`,
    ];

    if (typeof props.currentPlan === "string" && props.currentPlan.length > 0) {
      lines.push(`Current plan: ${props.currentPlan}`);
    }
    if (typeof props.resetsAt === "string" && props.resetsAt.length > 0) {
      lines.push(`Resets: ${props.resetsAt}`);
    }
    if (
      typeof props.upgradePlanName === "string" &&
      props.upgradePlanName.length > 0
    ) {
      lines.push(`Suggested plan: ${props.upgradePlanName}`);
    }

    lines.push("");
    lines.push(
      severity === "exceeded"
        ? `Upgrade now to immediately restore access: ${upgradeUrl}`
        : `Review plans / upgrade: ${upgradeUrl}`,
    );

    if (
      typeof props.manageUsageUrl === "string" &&
      props.manageUsageUrl.length > 0
    ) {
      lines.push(`Review or adjust usage: ${props.manageUsageUrl}`);
    }

    lines.push("");
    lines.push(`Questions about usage or billing? Reach us at ${supportEmail}.`);

    return lines.join("\n");
  }
}

export default UsageLimitWarning;
