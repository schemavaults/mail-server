import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import type { UsageLimitWarningEmailProps } from "@/email-templates/usage-limit-warning";
import { BadEmailTemplatePropsError } from "@/lib/error/BadEmailTemplatePropsError";

export class UsageLimitWarning extends EmailTemplatesCatalogEntry<UsageLimitWarningEmailProps> {
  public id = "usage-limit-warning" as const satisfies string;

  public description =
    "Notifies a user that they are approaching or have reached a usage/quota limit on their plan, with a progress bar and an upgrade call to action. Props: { resourceName: string, usedAmount: number, limitAmount: number, recipientName?: string, planName?: string, unit?: string, percentUsed?: number, periodResetDate?: string, upgradeUrl?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is UsageLimitWarningEmailProps {
    if (typeof val !== "object" || val === null) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object.`,
      );
    }
    const obj = val as Record<string, unknown>;

    if (typeof obj.resourceName !== "string" || obj.resourceName.length === 0) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' requires a non-empty string 'resourceName' prop.`,
      );
    }

    const requiredNumberKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "usedAmount",
      "limitAmount",
    ];
    for (const key of requiredNumberKeys) {
      const v = obj[key];
      if (typeof v !== "number" || !Number.isFinite(v)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' requires a finite number '${String(key)}' prop.`,
        );
      }
    }

    if (
      typeof obj.percentUsed !== "undefined" &&
      (typeof obj.percentUsed !== "number" || !Number.isFinite(obj.percentUsed))
    ) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected optional prop 'percentUsed' to be a finite number when provided.`,
      );
    }

    const optionalStringKeys: readonly (keyof UsageLimitWarningEmailProps)[] = [
      "recipientName",
      "planName",
      "unit",
      "periodResetDate",
      "upgradeUrl",
      "supportEmail",
    ];
    for (const key of optionalStringKeys) {
      const v = obj[key];
      if (typeof v !== "undefined" && typeof v !== "string") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop '${String(key)}' to be a string when provided.`,
        );
      }
    }

    return true;
  }

  public async loadReactEmailTemplate(): Promise<
    FC<UsageLimitWarningEmailProps>
  > {
    const component = await import("@/email-templates/usage-limit-warning").then(
      (mod) => mod.default,
    );
    return component;
  }

  public async renderPlainTextVersion(
    props: UsageLimitWarningEmailProps,
  ): Promise<string> {
    const recipientName =
      typeof props.recipientName === "string" && props.recipientName.length > 0
        ? props.recipientName
        : "there";
    const resourceName =
      typeof props.resourceName === "string" && props.resourceName.length > 0
        ? props.resourceName
        : "usage";
    const unit =
      typeof props.unit === "string" && props.unit.length > 0 ? props.unit : "";
    const upgradeUrl =
      typeof props.upgradeUrl === "string" && props.upgradeUrl.length > 0
        ? props.upgradeUrl
        : "https://schemavaults.com/account/billing";
    const supportEmail =
      typeof props.supportEmail === "string" && props.supportEmail.length > 0
        ? props.supportEmail
        : "support@schemavaults.com";

    const usedAmount =
      typeof props.usedAmount === "number" && Number.isFinite(props.usedAmount)
        ? props.usedAmount
        : 0;
    const limitAmount =
      typeof props.limitAmount === "number" &&
      Number.isFinite(props.limitAmount) &&
      props.limitAmount > 0
        ? props.limitAmount
        : 0;
    const rawPercent =
      typeof props.percentUsed === "number" &&
      Number.isFinite(props.percentUsed)
        ? props.percentUsed
        : limitAmount > 0
          ? (usedAmount / limitAmount) * 100
          : 0;
    const percent = Math.max(0, Math.round(rawPercent));
    const atLimit = percent >= 100;

    const format = (n: number): string =>
      new Intl.NumberFormat("en-US").format(n);
    const usedLabel = unit ? `${format(usedAmount)} ${unit}` : format(usedAmount);
    const limitLabel = unit
      ? `${format(limitAmount)} ${unit}`
      : format(limitAmount);

    const lines: string[] = [
      atLimit
        ? `You've reached your ${resourceName} limit`
        : `You're approaching your ${resourceName} limit`,
      "",
      `Hi ${recipientName},`,
      "",
      atLimit
        ? `You've used all of the ${resourceName} included in your current plan.`
        : `You've used most of the ${resourceName} included in your current plan.`,
      "",
      `Usage: ${usedLabel} of ${limitLabel} (${percent}%)`,
    ];

    if (
      typeof props.periodResetDate === "string" &&
      props.periodResetDate.length > 0
    ) {
      lines.push(`Usage resets on ${props.periodResetDate}.`);
    }

    lines.push(
      "",
      `Upgrade your plan: ${upgradeUrl}`,
      "",
      `Questions? Reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default UsageLimitWarning;
