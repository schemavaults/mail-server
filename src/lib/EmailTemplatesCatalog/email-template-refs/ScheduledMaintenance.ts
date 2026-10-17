import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import {
  isScheduledMaintenanceImpactLevel,
  SCHEDULED_MAINTENANCE_IMPACT_BADGES,
  SCHEDULED_MAINTENANCE_IMPACT_DESCRIPTIONS,
  SCHEDULED_MAINTENANCE_IMPACT_HEADLINES,
  SCHEDULED_MAINTENANCE_IMPACT_LEVELS,
} from "@/email-templates/scheduled-maintenance";
import type {
  ScheduledMaintenanceEmailProps,
  ScheduledMaintenanceImpactLevel,
  ScheduledMaintenanceService,
} from "@/email-templates/scheduled-maintenance";

export class ScheduledMaintenance extends EmailTemplatesCatalogEntry<ScheduledMaintenanceEmailProps> {
  public id = "scheduled-maintenance" as const satisfies string;

  public description =
    "Scheduled maintenance / planned downtime notice announcing an upcoming maintenance window. The hero gradient and status badge follow the impact level ('none' keeps the configured brand accent, 'degraded' uses the theme warning palette, 'downtime' the destructive palette), followed by a maintenance-window panel (starts, ends, duration, reference), an expected-impact callout, an affected-services table, an optional 'Action required' callout, and a CTA to the status page. Props: { startsAt: string, endsAt: string, recipientName?: string, maintenanceTitle?: string, summary?: string, durationLabel?: string, impactLevel?: 'none' | 'degraded' | 'downtime', impactDescription?: string, affectedServices?: Array<{ name: string, impact?: string }>, actionRequired?: string, statusPageUrl?: string, referenceId?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is ScheduledMaintenanceEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof ScheduledMaintenanceEmailProps)[] =
      ["startsAt", "endsAt"];
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
    const optionalStringKeys: readonly (keyof ScheduledMaintenanceEmailProps)[] =
      [
        "recipientName",
        "maintenanceTitle",
        "summary",
        "durationLabel",
        "impactDescription",
        "actionRequired",
        "statusPageUrl",
        "referenceId",
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
      "impactLevel" in val &&
      typeof (val as Record<string, unknown>).impactLevel !== "undefined"
    ) {
      const impactLevel = (val as Record<string, unknown>).impactLevel;
      if (typeof impactLevel !== "string") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'impactLevel' to be a string when provided, but got ${typeof impactLevel}.`,
        );
      }
      if (!isScheduledMaintenanceImpactLevel(impactLevel)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'impactLevel' to be one of ${SCHEDULED_MAINTENANCE_IMPACT_LEVELS.map((level) => `'${level}'`).join(", ")}, but got '${impactLevel}'.`,
        );
      }
    }
    if (
      "affectedServices" in val &&
      typeof (val as Record<string, unknown>).affectedServices !== "undefined"
    ) {
      const services = (val as Record<string, unknown>).affectedServices;
      if (!Array.isArray(services)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'affectedServices' to be an array when provided, but got ${typeof services}.`,
        );
      }
      services.forEach((service, idx) => {
        if (typeof service !== "object" || service === null) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'affectedServices[${idx}]' to be an object, but got ${service === null ? "null" : typeof service}.`,
          );
        }
        const entry = service as Record<string, unknown>;
        if (typeof entry.name !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'affectedServices[${idx}].name' to be a string, but got ${typeof entry.name}.`,
          );
        }
        if (
          "impact" in entry &&
          typeof entry.impact !== "undefined" &&
          typeof entry.impact !== "string"
        ) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'affectedServices[${idx}].impact' to be a string when provided, but got ${typeof entry.impact}.`,
          );
        }
      });
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<
    FC<ScheduledMaintenanceEmailProps>
  > {
    const component = await import(
      "@/email-templates/scheduled-maintenance"
    ).then((mod) => mod.default);
    return component;
  }

  public async renderPlainTextVersion(
    props: ScheduledMaintenanceEmailProps,
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
    const impactLevel: ScheduledMaintenanceImpactLevel =
      isScheduledMaintenanceImpactLevel(props.impactLevel)
        ? props.impactLevel
        : "degraded";
    const maintenanceTitle: string =
      typeof props.maintenanceTitle === "string" &&
      props.maintenanceTitle.length > 0
        ? props.maintenanceTitle
        : SCHEDULED_MAINTENANCE_IMPACT_HEADLINES[impactLevel];
    const impactDescription: string =
      typeof props.impactDescription === "string" &&
      props.impactDescription.length > 0
        ? props.impactDescription
        : SCHEDULED_MAINTENANCE_IMPACT_DESCRIPTIONS[impactLevel];

    const lines: string[] = [
      `${productName} — ${maintenanceTitle}`,
      "",
      `Hi ${greetingName},`,
      "",
      typeof props.summary === "string" && props.summary.length > 0
        ? props.summary
        : `We have scheduled a maintenance window for ${productName}. Here is what is happening and when, so you can plan around it.`,
      "",
      "Maintenance window:",
      `  Starts: ${props.startsAt}`,
      `  Ends: ${props.endsAt}`,
    ];

    if (
      typeof props.durationLabel === "string" &&
      props.durationLabel.length > 0
    ) {
      lines.push(`  Duration: ${props.durationLabel}`);
    }
    if (typeof props.referenceId === "string" && props.referenceId.length > 0) {
      lines.push(`  Reference: ${props.referenceId}`);
    }

    lines.push("");
    lines.push(`Expected impact (${SCHEDULED_MAINTENANCE_IMPACT_BADGES[impactLevel]}):`);
    lines.push(`  ${impactDescription}`);

    const affectedServices: ScheduledMaintenanceService[] = Array.isArray(
      props.affectedServices,
    )
      ? props.affectedServices
      : [];
    if (affectedServices.length > 0) {
      lines.push("");
      lines.push("Affected services:");
      for (const service of affectedServices) {
        const impact: string =
          typeof service.impact === "string" && service.impact.length > 0
            ? service.impact
            : SCHEDULED_MAINTENANCE_IMPACT_BADGES[impactLevel];
        lines.push(`  - ${service.name}: ${impact}`);
      }
    }

    if (
      typeof props.actionRequired === "string" &&
      props.actionRequired.length > 0
    ) {
      lines.push("");
      lines.push("Action required:");
      lines.push(`  ${props.actionRequired}`);
    }

    if (
      typeof props.statusPageUrl === "string" &&
      props.statusPageUrl.length > 0
    ) {
      lines.push("");
      lines.push(`Follow live status: ${props.statusPageUrl}`);
    }

    lines.push("");
    lines.push(
      "No action is needed unless stated above — we will send a follow-up once the window closes.",
    );
    lines.push(`Questions about this maintenance? Reach us at ${supportEmail}.`);

    return lines.join("\n");
  }
}

export default ScheduledMaintenance;
