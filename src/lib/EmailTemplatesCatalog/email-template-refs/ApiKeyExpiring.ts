import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import type { ApiKeyExpiringEmailProps } from "@/email-templates/api-key-expiring";

export class ApiKeyExpiring extends EmailTemplatesCatalogEntry<ApiKeyExpiringEmailProps> {
  public id = "api-key-expiring" as const satisfies string;

  public description =
    "API key expiration warning email sent when a user's API key is approaching its expiration date. Uses SchemaVaults brand gradient header, an amber 'expiring soon' urgency callout (tied to @schemavaults/theme --warning token), a metadata table (key name, prefix, expires, last used), a primary CTA to rotate the key with a visible fallback link, and a numbered 'how to rotate safely' checklist. Props: { keyName: string, expiresAt: string, rotateKeyUrl: string, name?: string, keyPrefix?: string, daysUntilExpiration?: number, lastUsedAt?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is ApiKeyExpiringEmailProps {
    if (typeof val !== "object" || !val) {
      return false;
    }
    if (!("keyName" in val) || typeof val.keyName !== "string") {
      return false;
    }
    if (!("expiresAt" in val) || typeof val.expiresAt !== "string") {
      return false;
    }
    if (!("rotateKeyUrl" in val) || typeof val.rotateKeyUrl !== "string") {
      return false;
    }
    if (
      "name" in val &&
      typeof val.name !== "undefined" &&
      typeof val.name !== "string"
    ) {
      return false;
    }
    if (
      "keyPrefix" in val &&
      typeof val.keyPrefix !== "undefined" &&
      typeof val.keyPrefix !== "string"
    ) {
      return false;
    }
    if (
      "daysUntilExpiration" in val &&
      typeof val.daysUntilExpiration !== "undefined" &&
      typeof val.daysUntilExpiration !== "number"
    ) {
      return false;
    }
    if (
      "lastUsedAt" in val &&
      typeof val.lastUsedAt !== "undefined" &&
      typeof val.lastUsedAt !== "string"
    ) {
      return false;
    }
    if (
      "productName" in val &&
      typeof val.productName !== "undefined" &&
      typeof val.productName !== "string"
    ) {
      return false;
    }
    if (
      "supportEmail" in val &&
      typeof val.supportEmail !== "undefined" &&
      typeof val.supportEmail !== "string"
    ) {
      return false;
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
      typeof props.name === "string" && props.name.length > 0
        ? props.name
        : "there";

    const hasDaysLeft: boolean =
      typeof props.daysUntilExpiration === "number" &&
      Number.isFinite(props.daysUntilExpiration);
    const daysLeft: number = hasDaysLeft
      ? Math.max(0, Math.floor(props.daysUntilExpiration as number))
      : 0;
    const urgencyLabel: string = hasDaysLeft
      ? daysLeft <= 0
        ? "Expires today"
        : daysLeft === 1
          ? "1 day left"
          : `${daysLeft} days left`
      : "Expiring soon";

    const lines: string[] = [
      `Your ${productName} API key is expiring soon.`,
      "",
      `Hi ${greetingName},`,
      "",
      `One of your ${productName} API keys is approaching its expiration date. Rotate it before it expires to avoid interrupting any integrations or scheduled jobs that depend on it.`,
      "",
      `Status: ${urgencyLabel}`,
      "After the expiration date, requests using this key will be rejected with 401 Unauthorized.",
      "",
      `Key name: ${props.keyName}`,
    ];

    if (typeof props.keyPrefix === "string" && props.keyPrefix.length > 0) {
      lines.push(`Prefix: ${props.keyPrefix}`);
    }
    lines.push(`Expires: ${props.expiresAt}`);
    if (typeof props.lastUsedAt === "string" && props.lastUsedAt.length > 0) {
      lines.push(`Last used: ${props.lastUsedAt}`);
    }

    lines.push("");
    lines.push(`Rotate this key: ${props.rotateKeyUrl}`);
    lines.push("");
    lines.push("How to rotate safely:");
    lines.push(
      "  1. Create a new API key with the same scopes from the dashboard.",
    );
    lines.push(
      "  2. Deploy the new key to your applications, CI, and secrets stores.",
    );
    lines.push(
      "  3. Revoke the old key once you've confirmed traffic has moved over.",
    );
    lines.push("");
    lines.push(
      `Didn't create this key or need help rotating? Reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default ApiKeyExpiring;
