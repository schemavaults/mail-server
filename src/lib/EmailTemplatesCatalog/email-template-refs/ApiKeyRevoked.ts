import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { ApiKeyRevokedEmailProps } from "@/email-templates/api-key-revoked";

const VALID_REVOKED_REASONS: ReadonlySet<string> = new Set([
  "user-initiated",
  "admin-initiated",
  "rotated",
  "expired",
  "suspected-compromise",
]);

export class ApiKeyRevoked extends EmailTemplatesCatalogEntry<ApiKeyRevokedEmailProps> {
  public id = "api-key-revoked" as const satisfies string;

  public description =
    "Transactional email sent when an API key on a user's account is revoked, rotated, expired, or flagged for suspected compromise. Header gradient and CTA color adapt to the reason (blue for routine revocations, red for suspected-compromise). Body shows the masked key with a strike-through, a 'What happens next' callout explaining 401 fallout, a metadata table (reason, revoker, timestamp, IP, location), primary 'Manage API keys' CTA plus an optional 'Create new key' secondary CTA, and a reason-specific alert callout (recommended next steps for compromise, didn't-expect-this for routine). Props: { keyName: string, manageKeysUrl: string, userName?: string, keyPrefix?: string, keyLastFour?: string, revokedReason?: 'user-initiated' | 'admin-initiated' | 'rotated' | 'expired' | 'suspected-compromise', revokedAt?: string, revokedByName?: string, revokedByEmail?: string, ipAddress?: string, location?: string, createNewKeyUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

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
      "revokedAt",
      "revokedByName",
      "revokedByEmail",
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
    if (
      "revokedReason" in val &&
      typeof (val as Record<string, unknown>).revokedReason !== "undefined"
    ) {
      const revokedReason = (val as Record<string, unknown>).revokedReason;
      if (typeof revokedReason !== "string") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'revokedReason' to be a string when provided, but got ${typeof revokedReason}.`,
        );
      }
      if (!VALID_REVOKED_REASONS.has(revokedReason)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'revokedReason' to be one of [${Array.from(VALID_REVOKED_REASONS).join(", ")}], but got '${revokedReason}'.`,
        );
      }
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<
    FC<ApiKeyRevokedEmailProps>
  > {
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

    const reason = props.revokedReason ?? "user-initiated";
    const reasonLabel: string = (() => {
      switch (reason) {
        case "user-initiated":
          return "Revoked by you";
        case "admin-initiated":
          return "Revoked by an administrator";
        case "rotated":
          return "Rotated";
        case "expired":
          return "Expired";
        case "suspected-compromise":
          return "Revoked for suspected compromise";
      }
    })();
    const reasonLede: string = (() => {
      switch (reason) {
        case "user-initiated":
          return `The API key "${props.keyName}" was revoked from your ${productName} account at your request. Any application using it will start receiving 401 Unauthorized responses immediately.`;
        case "admin-initiated":
          return `The API key "${props.keyName}" was revoked from your ${productName} account by an account administrator. Any application using it will start receiving 401 Unauthorized responses immediately.`;
        case "rotated":
          return `The API key "${props.keyName}" was rotated on your ${productName} account. The old credential is now invalid — make sure every deployed service has switched to the replacement key.`;
        case "expired":
          return `The API key "${props.keyName}" on your ${productName} account has reached its expiration date and has been deactivated. Any application using it will start receiving 401 Unauthorized responses immediately.`;
        case "suspected-compromise":
          return `The API key "${props.keyName}" was revoked from your ${productName} account because it was flagged as potentially compromised. We strongly recommend rotating any other credentials that may have been exposed at the same time.`;
      }
    })();

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

    const lines: string[] = [
      `The API key "${props.keyName}" was revoked on your ${productName} account.`,
      "",
      `Hi ${greetingName},`,
      "",
      reasonLede,
      "",
    ];

    if (maskedKey) {
      lines.push(`Revoked key: ${maskedKey}`);
    }
    lines.push(`Reason: ${reasonLabel}`);
    if (revokedByLine) {
      lines.push(`Revoked by: ${revokedByLine}`);
    }
    if (typeof props.revokedAt === "string" && props.revokedAt.length > 0) {
      lines.push(`Revoked at: ${props.revokedAt}`);
    }
    if (typeof props.ipAddress === "string" && props.ipAddress.length > 0) {
      lines.push(`IP address: ${props.ipAddress}`);
    }
    if (typeof props.location === "string" && props.location.length > 0) {
      lines.push(`Location: ${props.location}`);
    }
    lines.push("");
    lines.push(
      "What happens next: any service still using this key will start failing with 401 Unauthorized on its next request. If you still need API access, create a replacement key and update your deployed environments.",
    );
    lines.push("");
    lines.push(`Manage API keys: ${props.manageKeysUrl}`);
    if (
      typeof props.createNewKeyUrl === "string" &&
      props.createNewKeyUrl.length > 0
    ) {
      lines.push(`Create a new key: ${props.createNewKeyUrl}`);
    }
    lines.push("");
    if (reason === "suspected-compromise") {
      lines.push("Recommended next steps:");
      lines.push(
        "Rotate any credentials that lived in the same environment, review recent activity logs for the affected account, and re-issue a new key only after the source of the leak has been addressed.",
      );
    } else {
      lines.push("Didn't expect this?");
      lines.push(
        `If you didn't revoke this key and don't recognize who did, review your account's recent activity, change your password, and contact us at ${supportEmail}.`,
      );
    }
    lines.push("");
    lines.push(
      `Questions? Reach us at ${supportEmail}. We'll never ask for your API key or password over email.`,
    );

    return lines.join("\n");
  }
}

export default ApiKeyRevoked;
