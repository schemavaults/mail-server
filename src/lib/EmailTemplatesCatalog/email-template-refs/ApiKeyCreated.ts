import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import type { ApiKeyCreatedEmailProps } from "@/email-templates/api-key-created";

export class ApiKeyCreated extends EmailTemplatesCatalogEntry<ApiKeyCreatedEmailProps> {
  public id = "api-key-created" as const satisfies string;

  public description =
    "Sent when a new API key is issued on a user's account. Uses the SchemaVaults brand gradient header, shows the key name and public prefix in a monospace 'code pill', lists the scopes granted as chip tags, provides a metadata table (key name, created by, created at), an amber reminder callout to store the secret securely, a primary CTA to manage API keys, an optional docs link, and a 'didn't create this?' revoke prompt. Props: { name: string, keyName: string, keyPrefix: string, scopes?: string[], createdAt?: string, createdBy?: string, manageKeysUrl?: string, revokeUrl?: string, docsUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is ApiKeyCreatedEmailProps {
    if (typeof val !== "object" || !val) {
      return false;
    }
    if (!("name" in val) || typeof val.name !== "string") {
      return false;
    }
    if (!("keyName" in val) || typeof val.keyName !== "string") {
      return false;
    }
    if (!("keyPrefix" in val) || typeof val.keyPrefix !== "string") {
      return false;
    }
    if (
      "scopes" in val &&
      typeof val.scopes !== "undefined" &&
      !(
        Array.isArray(val.scopes) &&
        val.scopes.every((s) => typeof s === "string")
      )
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
      "createdBy" in val &&
      typeof val.createdBy !== "undefined" &&
      typeof val.createdBy !== "string"
    ) {
      return false;
    }
    if (
      "manageKeysUrl" in val &&
      typeof val.manageKeysUrl !== "undefined" &&
      typeof val.manageKeysUrl !== "string"
    ) {
      return false;
    }
    if (
      "revokeUrl" in val &&
      typeof val.revokeUrl !== "undefined" &&
      typeof val.revokeUrl !== "string"
    ) {
      return false;
    }
    if (
      "docsUrl" in val &&
      typeof val.docsUrl !== "undefined" &&
      typeof val.docsUrl !== "string"
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
    const manageKeysUrl: string =
      typeof props.manageKeysUrl === "string" && props.manageKeysUrl.length > 0
        ? props.manageKeysUrl
        : "https://schemavaults.com/account/api-keys";
    const createdBy: string =
      typeof props.createdBy === "string" && props.createdBy.length > 0
        ? props.createdBy
        : "you";
    const scopes: string[] = Array.isArray(props.scopes)
      ? props.scopes.filter(
          (s): s is string => typeof s === "string" && s.length > 0,
        )
      : [];

    const lines: string[] = [
      `Your new API key is ready on ${productName}.`,
      "",
      `Hi ${props.name},`,
      "",
      `A new API key named "${props.keyName}" was just created on your ${productName} account. Use it to authenticate requests from your apps, servers, and background jobs.`,
      "",
      `Key prefix: ${props.keyPrefix}`,
      "(Only the public prefix is shown here. The full secret was displayed once at creation and cannot be retrieved again.)",
      "",
    ];

    if (scopes.length > 0) {
      lines.push(`Scopes: ${scopes.join(", ")}`);
    }
    lines.push(`Key name: ${props.keyName}`);
    lines.push(`Created by: ${createdBy}`);
    if (typeof props.createdAt === "string" && props.createdAt.length > 0) {
      lines.push(`Created at: ${props.createdAt}`);
    }
    lines.push("");
    lines.push(
      "Keep it secret, keep it safe: store the full secret in a secret manager or environment variable. Never commit it to source control or ship it in a browser bundle.",
    );
    lines.push("");
    lines.push(`Manage API keys: ${manageKeysUrl}`);
    if (typeof props.docsUrl === "string" && props.docsUrl.length > 0) {
      lines.push(`Docs: ${props.docsUrl}`);
    }
    lines.push("");
    if (typeof props.revokeUrl === "string" && props.revokeUrl.length > 0) {
      lines.push(
        `Didn't create this key? Revoke it now: ${props.revokeUrl} and contact support.`,
      );
    } else {
      lines.push(
        "Didn't create this key? Revoke it immediately from your API keys page and contact support.",
      );
    }
    lines.push("");
    lines.push(
      `Questions? Reach us at ${supportEmail}. We'll never ask for your API key or password over email.`,
    );

    return lines.join("\n");
  }
}

export default ApiKeyCreated;
