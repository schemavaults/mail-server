import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import {
  DEFAULT_ORGANIZATION_MFA_REQUIRED_REASON,
  formatOrganizationMfaDeadline,
  getOrganizationMfaRequiredCopy,
  isOrganizationMfaRequiredReason,
  ORGANIZATION_MFA_REQUIRED_REASONS,
  organizationMfaRemovalNotice,
} from "@/email-templates/organization-mfa-required";
import type {
  OrganizationMfaRequiredEmailProps,
  OrganizationMfaRequiredReason,
} from "@/email-templates/organization-mfa-required";

export class OrganizationMfaRequired extends EmailTemplatesCatalogEntry<OrganizationMfaRequiredEmailProps> {
  public id = "organization-mfa-required" as const satisfies string;

  public description =
    "Organization security notice telling a member that their organization requires multi-factor authentication and their account does not have it — either because the organization just turned the requirement on ('requirement_enabled') or because MFA was removed from their account ('mfa_removed'). Uses the configured brand gradient header, a warning-colored callout with the grace period deadline (formatted in UTC) and the consequence of missing it (automatic removal from the organization, rejoining needs a new invitation), a primary CTA to enable MFA with a visible fallback link, and an optional link to the organization page. Props: { organizationName: string, gracePeriodEndsAt: string (ISO 8601 timestamp), enableMfaUrl: string, reason?: 'requirement_enabled' | 'mfa_removed', recipientName?: string, organizationUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is OrganizationMfaRequiredEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof OrganizationMfaRequiredEmailProps)[] =
      ["organizationName", "gracePeriodEndsAt", "enableMfaUrl"];
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
    const gracePeriodEndsAt = (val as Record<string, unknown>)
      .gracePeriodEndsAt as string;
    if (Number.isNaN(Date.parse(gracePeriodEndsAt))) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'gracePeriodEndsAt' to be an ISO 8601 timestamp, but got '${gracePeriodEndsAt}'.`,
      );
    }
    const optionalStringKeys: readonly (keyof OrganizationMfaRequiredEmailProps)[] =
      ["recipientName", "organizationUrl", "productName", "supportEmail"];
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
      "reason" in val &&
      typeof (val as Record<string, unknown>).reason !== "undefined"
    ) {
      const reason = (val as Record<string, unknown>).reason;
      if (typeof reason !== "string") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'reason' to be a string when provided, but got ${typeof reason}.`,
        );
      }
      if (!isOrganizationMfaRequiredReason(reason)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'reason' to be one of ${ORGANIZATION_MFA_REQUIRED_REASONS.map((r) => `'${r}'`).join(", ")}, but got '${reason}'.`,
        );
      }
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<
    FC<OrganizationMfaRequiredEmailProps>
  > {
    const component = await import(
      "@/email-templates/organization-mfa-required"
    ).then((mod) => mod.default);
    return component;
  }

  public async renderPlainTextVersion(
    props: OrganizationMfaRequiredEmailProps,
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
    const reason: OrganizationMfaRequiredReason =
      isOrganizationMfaRequiredReason(props.reason)
        ? props.reason
        : DEFAULT_ORGANIZATION_MFA_REQUIRED_REASON;

    const deadline = formatOrganizationMfaDeadline(props.gracePeriodEndsAt);
    const copy = getOrganizationMfaRequiredCopy(
      reason,
      props.organizationName,
      productName,
    );

    const lines: string[] = [
      copy.heading,
      "",
      `Hi ${greetingName},`,
      "",
      copy.lede,
      "",
      `Enable multi-factor authentication before ${deadline} to keep your membership in ${props.organizationName}. ${organizationMfaRemovalNotice(props.organizationName)}`,
      "",
      `Enable multi-factor authentication: ${props.enableMfaUrl}`,
    ];

    if (
      typeof props.organizationUrl === "string" &&
      props.organizationUrl.length > 0
    ) {
      lines.push(
        `Review your membership on the ${props.organizationName} organization page: ${props.organizationUrl}`,
      );
    }

    lines.push("");
    lines.push(
      `If you have questions about this requirement, contact ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default OrganizationMfaRequired;
