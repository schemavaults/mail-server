import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { UsageThresholdWarningEmailProps } from "@/email-templates/usage-threshold-warning";

export class UsageThresholdWarning extends EmailTemplatesCatalogEntry<UsageThresholdWarningEmailProps> {
  public id = "usage-threshold-warning" as const satisfies string;

  public description =
    "Usage-quota notification sent when an account approaches (≥75%), nears critical (≥90%), or has exceeded (≥100%) a metered resource limit such as API requests, storage, schemas, or team seats. Severity drives the header gradient, progress-bar fill, and callout color — amber/warning at approaching levels and red/destructive once critical or exceeded — mirroring the @schemavaults/theme `--warning` and `--destructive` tokens. Includes a visual progress bar, a metadata table (resource, current usage, utilization, period, plan), a 'what this means'/'what happens next' callout, an optional free-form context block, a primary CTA (upgrade or view usage), and an optional billing-management link. Props: { resourceName: string, currentUsage: number, usageLimit: number, usageUrl: string, recipientName?: string, unit?: string, periodLabel?: string, planName?: string, upgradeUrl?: string, manageBillingUrl?: string, additionalContext?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is UsageThresholdWarningEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredNumberKeys: readonly (keyof UsageThresholdWarningEmailProps)[] =
      ["currentUsage", "usageLimit"];
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
    if ((val as Record<string, unknown>).usageLimit as number <= 0) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'usageLimit' to be greater than 0, but got ${(val as Record<string, unknown>).usageLimit}.`,
      );
    }
    if (((val as Record<string, unknown>).currentUsage as number) < 0) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'currentUsage' to be greater than or equal to 0, but got ${(val as Record<string, unknown>).currentUsage}.`,
      );
    }
    const requiredStringKeys: readonly (keyof UsageThresholdWarningEmailProps)[] =
      ["resourceName", "usageUrl"];
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
    const optionalStringKeys: readonly (keyof UsageThresholdWarningEmailProps)[] =
      [
        "recipientName",
        "unit",
        "periodLabel",
        "planName",
        "upgradeUrl",
        "manageBillingUrl",
        "additionalContext",
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
    FC<UsageThresholdWarningEmailProps>
  > {
    const component = await import(
      "@/email-templates/usage-threshold-warning"
    ).then((mod) => mod.default);
    return component;
  }

  public async renderPlainTextVersion(
    props: UsageThresholdWarningEmailProps,
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
    const periodLabel: string | undefined =
      typeof props.periodLabel === "string" && props.periodLabel.length > 0
        ? props.periodLabel
        : undefined;
    const planName: string | undefined =
      typeof props.planName === "string" && props.planName.length > 0
        ? props.planName
        : undefined;
    const upgradeUrl: string | undefined =
      typeof props.upgradeUrl === "string" && props.upgradeUrl.length > 0
        ? props.upgradeUrl
        : undefined;
    const manageBillingUrl: string | undefined =
      typeof props.manageBillingUrl === "string" &&
      props.manageBillingUrl.length > 0
        ? props.manageBillingUrl
        : undefined;
    const additionalContext: string | undefined =
      typeof props.additionalContext === "string" &&
      props.additionalContext.length > 0
        ? props.additionalContext
        : undefined;

    const safeCurrent: number =
      typeof props.currentUsage === "number" &&
      Number.isFinite(props.currentUsage)
        ? Math.max(0, props.currentUsage)
        : 0;
    const safeLimit: number =
      typeof props.usageLimit === "number" &&
      Number.isFinite(props.usageLimit) &&
      props.usageLimit > 0
        ? props.usageLimit
        : 1;

    const rawPercent = (safeCurrent / safeLimit) * 100;
    const percent = Math.max(0, rawPercent);
    const percentLabel = `${percent >= 10 ? Math.round(percent) : percent.toFixed(1)}%`;

    const formatN = (n: number): string =>
      Number.isFinite(n) ? new Intl.NumberFormat("en-US").format(n) : "0";

    const usageDisplay = unit
      ? `${formatN(safeCurrent)} ${unit} of ${formatN(safeLimit)} ${unit}`
      : `${formatN(safeCurrent)} of ${formatN(safeLimit)}`;

    const exceeded = percent >= 100;
    const critical = !exceeded && percent >= 90;

    const headingText = exceeded
      ? `You've exceeded your ${props.resourceName} limit.`
      : critical
        ? `You're nearly out of ${props.resourceName}.`
        : `You're approaching your ${props.resourceName} limit.`;

    const calloutHeading = exceeded ? "What happens next" : "What this means";
    const calloutBody = exceeded
      ? `Further ${props.resourceName.toLowerCase()} consumption may be blocked or throttled until usage falls below the limit or you upgrade your plan. Existing data is unaffected.`
      : critical
        ? `At your current pace, you'll hit the ${props.resourceName.toLowerCase()} limit soon. Once exceeded, additional ${props.resourceName.toLowerCase()} usage may be blocked or throttled.`
        : `You still have headroom, but you may want to plan ahead. Upgrading or freeing unused ${props.resourceName.toLowerCase()} now avoids any service interruption.`;

    const lines: string[] = [
      headingText,
      "",
      `Hi ${greetingName},`,
      "",
      `Your ${productName} account has used ${usageDisplay}${
        periodLabel ? ` ${periodLabel}` : ""
      } of your ${props.resourceName} allowance — that's ${percentLabel} of your current limit.`,
      "",
      `Resource: ${props.resourceName}`,
      `Current usage: ${usageDisplay}`,
      `Utilization: ${percentLabel}`,
    ];
    if (periodLabel) {
      lines.push(`Period: ${periodLabel}`);
    }
    if (planName) {
      lines.push(`Current plan: ${planName}`);
    }
    lines.push("");
    lines.push(`${calloutHeading}:`);
    lines.push(`  ${calloutBody}`);
    lines.push("");

    if (additionalContext) {
      lines.push(additionalContext);
      lines.push("");
    }

    if (upgradeUrl) {
      lines.push(`Upgrade plan: ${upgradeUrl}`);
      lines.push(`Or review your current usage first: ${props.usageUrl}`);
    } else {
      lines.push(`View usage details: ${props.usageUrl}`);
    }
    lines.push("");

    if (manageBillingUrl) {
      lines.push(
        `Need to change plans or update billing details? Visit your billing settings: ${manageBillingUrl}`,
      );
      lines.push("");
    }

    lines.push(
      `Questions about plan limits, overage policies, or how this is measured? Reply to this email or reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default UsageThresholdWarning;
