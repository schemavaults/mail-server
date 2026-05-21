import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { ApiKeyRevokedEmailProps } from "@/email-templates/api-key-revoked";

export class ApiKeyRevoked extends EmailTemplatesCatalogEntry<ApiKeyRevokedEmailProps> {
  public id = "api-key-revoked" as const satisfies string;

  public description =
    "Confirmation email sent when an API key is revoked on a user's account (whether by the user themselves, a workspace admin, or an automated rotation). Uses the SchemaVaults brand red gradient header to signal a security-relevant action, includes a masked key identifier, the granted scopes, an optional revocation reason callout, a metadata table (who, when, where), primary CTAs to manage keys / create a replacement, and an alert block with support contact for unrecognized revocations. Props: { keyName: string, manageKeysUrl: string, userName?: string, keyPrefix?: string, keyLastFour?: string, scopes?: string[], createdAt?: string, revokedAt?: string, revokedByName?: string, revokedByEmail?: string, revocationReason?: string, ipAddress?: string, location?: string, createNewKeyUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is ApiKeyRevokedEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof ApiKeyRevokedEmailProps)[] = [
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
    const optionalStringKeys: readonly (keyof ApiKeyRevokedEmailProps)[] = [
      "userName",
      "keyPrefix",
      "keyLastFour",
      "createdAt",
      "revokedAt",
      "revokedByName",
      "revokedByEmail",
      "revocationReason",
      "ipAddress",
      "location",
      "createNewKeyUrl",
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
    if ("scopes" in val && typeof (val as Record<string, unknown>).scopes !== "undefined") {
      const scopes = (val as Record<string, unknown>).scopes;
      if (!Array.isArray(scopes)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'scopes' to be an array of strings when provided, but got ${typeof scopes}.`,
        );
      }
      for (const entry of scopes) {
        if (typeof entry !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected every entry in 'scopes' to be a string, but found a ${typeof entry}.`,
          );
        }
      }
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<FC<ApiKeyRevokedEmailProps>> {
    const component = await import("@/email-templates/api-key-revoked").then(
      (mod) => mod.default,
    );
    return component;
  }

  public async renderPlainTextVersion(
    props: ApiKeyRevokedEmailProps,
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
    const revokedByLine: string | undefined =
      typeof props.revokedByName === "string" && props.revokedByName.length > 0
        ? typeof props.revokedByEmail === "string" &&
          props.revokedByEmail.length > 0
          ? `${props.revokedByName} (${props.revokedByEmail})`
          : props.revokedByName
        : typeof props.revokedByEmail === "string" &&
            props.revokedByEmail.length > 0
          ? props.revokedByEmail
          : undefined;
    const keyPrefix =
      typeof props.keyPrefix === "string" && props.keyPrefix.length > 0
        ? props.keyPrefix
        : "";
    const keyLastFour =
      typeof props.keyLastFour === "string" && props.keyLastFour.length > 0
        ? props.keyLastFour
        : "";
    const maskedKey =
      keyPrefix || keyLastFour
        ? `${keyPrefix}${keyPrefix ? "_" : ""}********${keyLastFour}`
        : undefined;

    const lines: string[] = [
      `An API key was revoked on your ${productName} account.`,
      "",
      `Hi ${greetingName},`,
      "",
      `The API key "${props.keyName}" has been revoked. Any requests it was authorizing will now fail with 401 Unauthorized. Update any integrations that depended on this key.`,
      "",
    ];

    lines.push(`Key name: ${props.keyName}`);
    if (maskedKey) {
      lines.push(`Key: ${maskedKey}`);
    }
    if (revokedByLine) {
      lines.push(`Revoked by: ${revokedByLine}`);
    }
    if (typeof props.revokedAt === "string" && props.revokedAt.length > 0) {
      lines.push(`Revoked at: ${props.revokedAt}`);
    }
    if (typeof props.createdAt === "string" && props.createdAt.length > 0) {
      lines.push(`Originally created: ${props.createdAt}`);
    }
    if (typeof props.ipAddress === "string" && props.ipAddress.length > 0) {
      lines.push(`IP address: ${props.ipAddress}`);
    }
    if (typeof props.location === "string" && props.location.length > 0) {
      lines.push(`Location: ${props.location}`);
    }
    if (
      typeof props.revocationReason === "string" &&
      props.revocationReason.length > 0
    ) {
      lines.push("");
      lines.push(`Reason: ${props.revocationReason}`);
    }
    if (Array.isArray(props.scopes) && props.scopes.length > 0) {
      lines.push("");
      lines.push(`Scopes that were granted: ${props.scopes.join(", ")}`);
    }

    lines.push("");
    lines.push(`Manage API keys: ${props.manageKeysUrl}`);
    if (
      typeof props.createNewKeyUrl === "string" &&
      props.createNewKeyUrl.length > 0
    ) {
      lines.push(`Create a new key: ${props.createNewKeyUrl}`);
    }

    lines.push("");
    lines.push(
      "If you didn't revoke this key and don't recognize who did, someone else may have access to your account. Review your active sessions, rotate other credentials right away, and contact support.",
    );
    lines.push(`Questions? Reach us at ${supportEmail}.`);

    return lines.join("\n");
  }
}

export default ApiKeyRevoked;
