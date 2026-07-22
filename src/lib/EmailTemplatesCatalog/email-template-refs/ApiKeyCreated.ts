import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import type { ApiKeyCreatedEmailProps } from "@/email-templates/api-key-created";

export class ApiKeyCreated extends EmailTemplatesCatalogEntry<ApiKeyCreatedEmailProps> {
  public id = "api-key-created" as const satisfies string;

  public description =
    "Transactional email sent when a new API key is issued on a user's account. Uses the configured brand gradient header, a dark code-style 'Key identifier' panel showing a masked key (prefix + last-4, never the full secret), an optional 'Scopes granted' callout, a metadata table (key name, created by, created at, IP, location, expiration), a primary 'Manage API keys' CTA, and a prominent red alert with an optional 'Revoke this key' button for unrecognized issuances. Props: { keyName: string, manageKeysUrl: string, userName?: string, keyPrefix?: string, keyLastFour?: string, scopes?: string[], createdAt?: string, createdByName?: string, createdByEmail?: string, ipAddress?: string, location?: string, expiresAt?: string, revokeKeyUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is ApiKeyCreatedEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof ApiKeyCreatedEmailProps)[] = [
      "keyName",
      "manageKeysUrl",
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
    const optionalStringKeys: readonly (keyof ApiKeyCreatedEmailProps)[] = [
      "userName",
      "keyPrefix",
      "keyLastFour",
      "createdAt",
      "createdByName",
      "createdByEmail",
      "ipAddress",
      "location",
      "expiresAt",
      "revokeKeyUrl",
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

    const createdByLine: string | undefined =
      typeof props.createdByName === "string" && props.createdByName.length > 0
        ? typeof props.createdByEmail === "string" &&
          props.createdByEmail.length > 0
          ? `${props.createdByName} (${props.createdByEmail})`
          : props.createdByName
        : typeof props.createdByEmail === "string" &&
            props.createdByEmail.length > 0
          ? props.createdByEmail
          : undefined;

    const lines: string[] = [
      `A new API key "${props.keyName}" was created on your ${productName} account.`,
      "",
      `Hi ${greetingName},`,
      "",
      `A new API key named "${props.keyName}" was just issued on your ${productName} account. The full key is only displayed once — at the moment of creation — and is never sent in email. If you saved it, keep it secret like a password.`,
      "",
    ];

    if (maskedKey) {
      lines.push(`Key identifier: ${maskedKey}`);
    }
    if (Array.isArray(props.scopes) && props.scopes.length > 0) {
      lines.push(`Scopes granted: ${props.scopes.join(", ")}`);
    }
    if (createdByLine) {
      lines.push(`Created by: ${createdByLine}`);
    }
    if (typeof props.createdAt === "string" && props.createdAt.length > 0) {
      lines.push(`Created at: ${props.createdAt}`);
    }
    if (typeof props.ipAddress === "string" && props.ipAddress.length > 0) {
      lines.push(`IP address: ${props.ipAddress}`);
    }
    if (typeof props.location === "string" && props.location.length > 0) {
      lines.push(`Location: ${props.location}`);
    }
    if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
      lines.push(`Expires: ${props.expiresAt}`);
    }
    lines.push("");
    lines.push(`Manage API keys: ${props.manageKeysUrl}`);
    lines.push("");
    lines.push("Didn't create this key?");
    lines.push(
      "Revoke it right away and rotate any other credentials you think may be exposed.",
    );
    if (
      typeof props.revokeKeyUrl === "string" &&
      props.revokeKeyUrl.length > 0
    ) {
      lines.push(`Revoke this key: ${props.revokeKeyUrl}`);
    }
    lines.push("");
    lines.push(
      `Questions? Reach us at ${supportEmail}. We'll never ask for your API key or password over email.`,
    );

    return lines.join("\n");
  }
}

export default ApiKeyCreated;
