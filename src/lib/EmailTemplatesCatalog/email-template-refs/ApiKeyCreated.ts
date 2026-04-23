import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import type { ApiKeyCreatedEmailProps } from "@/email-templates/api-key-created";

export class ApiKeyCreated extends EmailTemplatesCatalogEntry<ApiKeyCreatedEmailProps> {
  public id = "api-key-created" as const satisfies string;

  public description =
    "Security notification sent whenever a new API key is issued on a user's account. Uses the SchemaVaults brand gradient header, a dark monospace panel for the key prefix, a metadata table (key name, created-at, device, IP, location, expiration), an optional scopes callout, a primary CTA to review keys, and a red outlined 'Revoke this key' CTA for unauthorized activity. Props: { keyName: string, keyPrefix: string, manageKeysUrl: string, userName?: string, createdAt?: string, createdFromDevice?: string, createdFromIpAddress?: string, createdFromLocation?: string, expiresAt?: string, scopes?: string[], revokeUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is ApiKeyCreatedEmailProps {
    if (typeof val !== "object" || !val) {
      return false;
    }
    if (!("keyName" in val) || typeof val.keyName !== "string") {
      return false;
    }
    if (!("keyPrefix" in val) || typeof val.keyPrefix !== "string") {
      return false;
    }
    if (!("manageKeysUrl" in val) || typeof val.manageKeysUrl !== "string") {
      return false;
    }
    if (
      "userName" in val &&
      typeof val.userName !== "undefined" &&
      typeof val.userName !== "string"
    ) {
      return false;
    }
    if (
      "createdAt" in val &&
      typeof val.createdAt !== "undefined" &&
      typeof val.createdAt !== "string"
    ) {
      return false;
    }
    if (
      "createdFromDevice" in val &&
      typeof val.createdFromDevice !== "undefined" &&
      typeof val.createdFromDevice !== "string"
    ) {
      return false;
    }
    if (
      "createdFromIpAddress" in val &&
      typeof val.createdFromIpAddress !== "undefined" &&
      typeof val.createdFromIpAddress !== "string"
    ) {
      return false;
    }
    if (
      "createdFromLocation" in val &&
      typeof val.createdFromLocation !== "undefined" &&
      typeof val.createdFromLocation !== "string"
    ) {
      return false;
    }
    if (
      "expiresAt" in val &&
      typeof val.expiresAt !== "undefined" &&
      typeof val.expiresAt !== "string"
    ) {
      return false;
    }
    if ("scopes" in val && typeof val.scopes !== "undefined") {
      if (!Array.isArray(val.scopes)) {
        return false;
      }
      if (!val.scopes.every((s) => typeof s === "string")) {
        return false;
      }
    }
    if (
      "revokeUrl" in val &&
      typeof val.revokeUrl !== "undefined" &&
      typeof val.revokeUrl !== "string"
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
    FC<ApiKeyCreatedEmailProps>
  > {
    const component = await import("@/email-templates/api-key-created").then(
      (mod) => mod.default,
    );
    return component;
  }

  public async renderPlainTextVersion(
    props: ApiKeyCreatedEmailProps,
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
    const revokeUrl: string =
      typeof props.revokeUrl === "string" && props.revokeUrl.length > 0
        ? props.revokeUrl
        : props.manageKeysUrl;

    const lines: string[] = [
      `A new API key was issued on your ${productName} account.`,
      "",
      `Hi ${greetingName},`,
      "",
      `A new API key named "${props.keyName}" was just created on your ${productName} account. We're letting you know so you can confirm it was you — and quickly rotate it if it wasn't.`,
      "",
      `Key prefix: ${props.keyPrefix}…`,
      `Key name: ${props.keyName}`,
    ];

    if (typeof props.createdAt === "string" && props.createdAt.length > 0) {
      lines.push(`Created: ${props.createdAt}`);
    }
    if (
      typeof props.createdFromDevice === "string" &&
      props.createdFromDevice.length > 0
    ) {
      lines.push(`Device: ${props.createdFromDevice}`);
    }
    if (
      typeof props.createdFromIpAddress === "string" &&
      props.createdFromIpAddress.length > 0
    ) {
      lines.push(`IP address: ${props.createdFromIpAddress}`);
    }
    if (
      typeof props.createdFromLocation === "string" &&
      props.createdFromLocation.length > 0
    ) {
      lines.push(`Location: ${props.createdFromLocation}`);
    }
    if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
      lines.push(`Expires: ${props.expiresAt}`);
    }
    if (Array.isArray(props.scopes) && props.scopes.length > 0) {
      lines.push(`Scopes: ${props.scopes.join(", ")}`);
    }

    lines.push("");
    lines.push(`Review your API keys: ${props.manageKeysUrl}`);
    lines.push("");
    lines.push(
      "Didn't create this key? Revoke it immediately and rotate any credentials shared with it.",
    );
    lines.push(`Revoke this key: ${revokeUrl}`);
    lines.push("");
    lines.push(`Questions? Reach us at ${supportEmail}.`);

    return lines.join("\n");
  }
}

export default ApiKeyCreated;
