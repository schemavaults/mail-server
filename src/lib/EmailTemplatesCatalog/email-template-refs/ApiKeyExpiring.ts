import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { ApiKeyExpiringEmailProps } from "@/email-templates/api-key-expiring";

export class ApiKeyExpiring extends EmailTemplatesCatalogEntry<ApiKeyExpiringEmailProps> {
  public id = "api-key-expiring" as const satisfies string;

  public description =
    "Transactional email warning a user that an API key on their account is approaching its expiration date (or has just expired). Uses the SchemaVaults brand gradient header, an urgency ribbon that escalates from a yellow 'expiring soon' badge to a red 'expired' / 'expires in N days' alert when daysUntilExpiration <= 3, a dark code-style 'Key identifier' panel showing a masked key (prefix + last-4), an optional 'Scopes on this key' callout, a metadata table (key name, expires at, last used), a primary 'Rotate this key' CTA, an optional secondary 'Manage API keys' link, and a numbered 'How to rotate without downtime' panel with an optional link to docs. Props: { keyName: string, expiresAt: string, rotateKeyUrl: string, userName?: string, daysUntilExpiration?: number, keyPrefix?: string, keyLastFour?: string, scopes?: string[], lastUsedAt?: string, manageKeysUrl?: string, productName?: string, supportEmail?: string, docsUrl?: string }" as const satisfies string;

  public validateProps(val: unknown): val is ApiKeyExpiringEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof ApiKeyExpiringEmailProps)[] = [
      "keyName",
      "expiresAt",
      "rotateKeyUrl",
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
    const optionalStringKeys: readonly (keyof ApiKeyExpiringEmailProps)[] = [
      "userName",
      "keyPrefix",
      "keyLastFour",
      "lastUsedAt",
      "manageKeysUrl",
      "productName",
      "supportEmail",
      "docsUrl",
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
      "daysUntilExpiration" in val &&
      typeof (val as Record<string, unknown>).daysUntilExpiration !== "undefined"
    ) {
      const days = (val as Record<string, unknown>).daysUntilExpiration;
      if (typeof days !== "number" || !Number.isFinite(days)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'daysUntilExpiration' to be a finite number when provided, but got ${typeof days}.`,
        );
      }
    }
    if (
      "scopes" in val &&
      typeof (val as Record<string, unknown>).scopes !== "undefined"
    ) {
      const scopes = (val as Record<string, unknown>).scopes;
      if (!Array.isArray(scopes)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'scopes' to be a string[] when provided, but got ${typeof scopes}.`,
        );
      }
      for (let i = 0; i < scopes.length; i++) {
        if (typeof scopes[i] !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected every entry in 'scopes' to be a string, but scopes[${i}] is ${typeof scopes[i]}.`,
          );
        }
      }
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<
    FC<ApiKeyExpiringEmailProps>
  > {
    const component = await import("@/email-templates/api-key-expiring").then(
      (mod) => mod.default,
    );
    return component;
  }

  public async renderPlainTextVersion(
    props: ApiKeyExpiringEmailProps,
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

    const prefix =
      typeof props.keyPrefix === "string" && props.keyPrefix.length > 0
        ? props.keyPrefix
        : undefined;
    const lastFour =
      typeof props.keyLastFour === "string" && props.keyLastFour.length > 0
        ? props.keyLastFour
        : undefined;
    const maskedKey =
      prefix || lastFour
        ? `${prefix ?? ""}${prefix ? "_" : ""}••••••••${lastFour ?? ""}`
        : undefined;

    const days =
      typeof props.daysUntilExpiration === "number" &&
      Number.isFinite(props.daysUntilExpiration)
        ? Math.floor(props.daysUntilExpiration)
        : undefined;
    const ribbon =
      days !== undefined
        ? days <= 0
          ? "EXPIRED"
          : days === 1
            ? "EXPIRES IN 1 DAY"
            : `EXPIRES IN ${days} DAYS`
        : "EXPIRING SOON";
    const headingLine =
      days !== undefined && days <= 0
        ? `Your ${productName} API key "${props.keyName}" has expired.`
        : `Your ${productName} API key "${props.keyName}" is expiring soon.`;
    const lede =
      days !== undefined && days <= 0
        ? `Your ${productName} API key "${props.keyName}" has reached its expiration date and is no longer accepted by the API. Issue a replacement now to restore traffic.`
        : days !== undefined && days <= 3
          ? `Your ${productName} API key "${props.keyName}" stops working in the next few days. Rotate it now to avoid downtime in any integration that depends on it.`
          : `Your ${productName} API key "${props.keyName}" will expire shortly. Rotate it ahead of the deadline so production traffic isn't interrupted.`;

    const lines: string[] = [
      headingLine,
      "",
      `[${ribbon}] Expiration date: ${props.expiresAt}`,
      "",
      `Hi ${greetingName},`,
      "",
      `${lede} Generating a new key gives you a short overlap window — you can roll out the replacement to every integration before revoking the old one.`,
      "",
      `Key name: ${props.keyName}`,
    ];

    if (maskedKey) {
      lines.push(`Key identifier: ${maskedKey}`);
    }
    if (Array.isArray(props.scopes) && props.scopes.length > 0) {
      lines.push(`Scopes on this key: ${props.scopes.join(", ")}`);
    }
    lines.push(`Expires: ${props.expiresAt}`);
    if (typeof props.lastUsedAt === "string" && props.lastUsedAt.length > 0) {
      lines.push(`Last used: ${props.lastUsedAt}`);
    }
    lines.push("");
    lines.push(`Rotate this key: ${props.rotateKeyUrl}`);
    if (
      typeof props.manageKeysUrl === "string" &&
      props.manageKeysUrl.length > 0
    ) {
      lines.push(`Manage API keys: ${props.manageKeysUrl}`);
    }
    lines.push("");
    lines.push("How to rotate without downtime:");
    lines.push(
      "  1. Generate a replacement key with the same scopes from the API keys page.",
    );
    lines.push(
      "  2. Roll the new key out to every integration and confirm traffic with it.",
    );
    lines.push("  3. Revoke the old key once nothing depends on it.");
    if (typeof props.docsUrl === "string" && props.docsUrl.length > 0) {
      lines.push(`Step-by-step guide: ${props.docsUrl}`);
    }
    lines.push("");
    lines.push(
      `Questions? Reach us at ${supportEmail}. We'll never ask for your API key or password over email.`,
    );

    return lines.join("\n");
  }
}

export default ApiKeyExpiring;
