import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import type { SecurityAlertEmailProps } from "@/email-templates/security-alert";

const VALID_EVENT_TYPES: readonly string[] = [
  "new-sign-in",
  "password-changed",
  "new-api-key",
  "new-device",
];

export class SecurityAlert extends EmailTemplatesCatalogEntry<SecurityAlertEmailProps> {
  public id = "security-alert" as const satisfies string;

  public description =
    "Security notification email (new sign-in, new device, password change, or new API key). Styled with SchemaVaults brand colors: blue gradient header, red-accented call-to-action and alert strip. Props: { name: string, eventType?: 'new-sign-in' | 'password-changed' | 'new-api-key' | 'new-device', device?: string, browser?: string, location?: string, ipAddress?: string, eventTime?: string, secureAccountUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is SecurityAlertEmailProps {
    if (typeof val !== "object" || !val) {
      return false;
    }
    if (!("name" in val) || typeof val.name !== "string") {
      return false;
    }
    if ("eventType" in val && typeof val.eventType !== "undefined") {
      if (
        typeof val.eventType !== "string" ||
        !VALID_EVENT_TYPES.includes(val.eventType)
      ) {
        return false;
      }
    }
    const optionalStringKeys: readonly (keyof SecurityAlertEmailProps)[] = [
      "device",
      "browser",
      "location",
      "ipAddress",
      "eventTime",
      "secureAccountUrl",
      "productName",
      "supportEmail",
    ];
    for (const key of optionalStringKeys) {
      if (
        key in val &&
        typeof (val as Record<string, unknown>)[key] !== "undefined" &&
        typeof (val as Record<string, unknown>)[key] !== "string"
      ) {
        return false;
      }
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<FC<SecurityAlertEmailProps>> {
    const component = await import("@/email-templates/security-alert").then(
      (mod) => mod.default,
    );
    return component;
  }

  public async renderPlainTextVersion(
    props: SecurityAlertEmailProps,
  ): Promise<string> {
    const productName: string =
      typeof props.productName === "string" && props.productName.length > 0
        ? props.productName
        : "SchemaVaults";
    const supportEmail: string =
      typeof props.supportEmail === "string" && props.supportEmail.length > 0
        ? props.supportEmail
        : "support@schemavaults.com";
    const secureAccountUrl: string =
      typeof props.secureAccountUrl === "string" &&
      props.secureAccountUrl.length > 0
        ? props.secureAccountUrl
        : "https://schemavaults.com/account/security";
    const eventType: NonNullable<SecurityAlertEmailProps["eventType"]> =
      props.eventType ?? "new-sign-in";

    const headings: Record<typeof eventType, string> = {
      "new-sign-in": "New sign-in detected",
      "password-changed": "Your password was changed",
      "new-api-key": "A new API key was issued",
      "new-device": "New device signed in",
    };
    const ledes: Record<typeof eventType, string> = {
      "new-sign-in": `We noticed a new sign-in to your ${productName} account. If this was you, no action is needed.`,
      "password-changed": `The password on your ${productName} account was just changed. If this was you, no action is needed.`,
      "new-api-key": `A new API key was just issued on your ${productName} account. If this was you, no action is needed.`,
      "new-device": `A device we haven't seen before just signed in to your ${productName} account. If this was you, no action is needed.`,
    };
    const ctaLabels: Record<typeof eventType, string> = {
      "new-sign-in": "Review account activity",
      "password-changed": "Secure your account",
      "new-api-key": "Manage API keys",
      "new-device": "Review devices",
    };

    const metaLines: string[] = [];
    if (typeof props.eventTime === "string" && props.eventTime.length > 0) {
      metaLines.push(`  When:       ${props.eventTime}`);
    }
    if (typeof props.device === "string" && props.device.length > 0) {
      metaLines.push(`  Device:     ${props.device}`);
    }
    if (typeof props.browser === "string" && props.browser.length > 0) {
      metaLines.push(`  Browser:    ${props.browser}`);
    }
    if (typeof props.location === "string" && props.location.length > 0) {
      metaLines.push(`  Location:   ${props.location}`);
    }
    if (typeof props.ipAddress === "string" && props.ipAddress.length > 0) {
      metaLines.push(`  IP address: ${props.ipAddress}`);
    }

    const lines: string[] = [
      `${productName} Security — ${headings[eventType]}`,
      "",
      `Hi ${props.name},`,
      "",
      ledes[eventType],
    ];
    if (metaLines.length > 0) {
      lines.push("", ...metaLines);
    }
    lines.push(
      "",
      "Didn't recognize this? Secure your account immediately — change your password and revoke any sessions you don't recognize.",
      "",
      `${ctaLabels[eventType]}: ${secureAccountUrl}`,
      "",
      `Questions? Reach us at ${supportEmail}. We'll never ask for your password over email.`,
    );

    return lines.join("\n");
  }
}

export default SecurityAlert;
