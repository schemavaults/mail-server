import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { TwoFactorCodeEmailProps } from "@/email-templates/two-factor-code";

export class TwoFactorCode extends EmailTemplatesCatalogEntry<TwoFactorCodeEmailProps> {
  public id = "two-factor-code" as const satisfies string;

  public description =
    "Two-factor authentication (2FA) one-time code delivery email sent when a user requests a verification code to complete sign-in. Uses SchemaVaults brand gradient header, a prominent large-monospace centered code panel (auto-formatted with spacing for 6/8-digit codes), an optional request-details table (time, location, IP, device), and a red-accented security callout warning users not to share the code. Props: { code: string, userName?: string, expiresInMinutes?: string, requestIp?: string, requestLocation?: string, requestUserAgent?: string, requestTime?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is TwoFactorCodeEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof TwoFactorCodeEmailProps)[] = [
      "code",
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
    const optionalStringKeys: readonly (keyof TwoFactorCodeEmailProps)[] = [
      "userName",
      "expiresInMinutes",
      "requestIp",
      "requestLocation",
      "requestUserAgent",
      "requestTime",
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
    return true;
  }

  public async loadReactEmailTemplate(): Promise<
    FC<TwoFactorCodeEmailProps>
  > {
    const component = await import("@/email-templates/two-factor-code").then(
      (mod) => mod.default,
    );
    return component;
  }

  public async renderPlainTextVersion(
    props: TwoFactorCodeEmailProps,
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
    const expiresInMinutes: string =
      typeof props.expiresInMinutes === "string" &&
      props.expiresInMinutes.length > 0
        ? props.expiresInMinutes
        : "10 minutes";

    const lines: string[] = [
      `Your ${productName} verification code`,
      "",
      `Hi ${greetingName},`,
      "",
      `Enter this code to complete your sign-in to ${productName}. It expires in ${expiresInMinutes}.`,
      "",
      `    ${props.code}`,
      "",
    ];

    const requestRows: Array<[string, string]> = [];
    if (
      typeof props.requestTime === "string" &&
      props.requestTime.length > 0
    ) {
      requestRows.push(["Requested", props.requestTime]);
    }
    if (
      typeof props.requestLocation === "string" &&
      props.requestLocation.length > 0
    ) {
      requestRows.push(["Location", props.requestLocation]);
    }
    if (typeof props.requestIp === "string" && props.requestIp.length > 0) {
      requestRows.push(["IP address", props.requestIp]);
    }
    if (
      typeof props.requestUserAgent === "string" &&
      props.requestUserAgent.length > 0
    ) {
      requestRows.push(["Device", props.requestUserAgent]);
    }

    if (requestRows.length > 0) {
      lines.push("Request details:");
      for (const [label, value] of requestRows) {
        lines.push(`  ${label}: ${value}`);
      }
      lines.push("");
    }

    lines.push(
      `Didn't try to sign in? Ignore this email and consider changing your password. ${productName} will never ask you to share this code with anyone.`,
    );
    lines.push("");
    lines.push(`Questions? Reach us at ${supportEmail}.`);

    return lines.join("\n");
  }
}

export default TwoFactorCode;
