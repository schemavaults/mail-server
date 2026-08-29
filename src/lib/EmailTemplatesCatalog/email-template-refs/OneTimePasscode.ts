import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import type { OneTimePasscodeEmailProps } from "@/email-templates/one-time-passcode";

export class OneTimePasscode extends EmailTemplatesCatalogEntry<OneTimePasscodeEmailProps> {
  public id = "one-time-passcode" as const satisfies string;

  public description =
    "One-time passcode (OTP) email for two-factor authentication, passwordless sign-in, and step-up verification. Uses the configured brand gradient header, a large per-character monospace code display, an expiry note, an optional CTA to the page where the code is entered, a request-details table (time, device, location, IP), and a 'never share this code' security notice. Props: { code: string, recipientName?: string, purpose?: string, expiresInMinutes?: string, requestedAt?: string, device?: string, location?: string, ipAddress?: string, verifyUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is OneTimePasscodeEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof OneTimePasscodeEmailProps)[] = [
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
    if ((val as Record<string, unknown>)["code"] === "") {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'code' to be a non-empty string.`,
      );
    }
    const optionalStringKeys: readonly (keyof OneTimePasscodeEmailProps)[] = [
      "recipientName",
      "purpose",
      "expiresInMinutes",
      "requestedAt",
      "device",
      "location",
      "ipAddress",
      "verifyUrl",
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
    FC<OneTimePasscodeEmailProps>
  > {
    const component = await import("@/email-templates/one-time-passcode").then(
      (mod) => mod.default,
    );
    return component;
  }

  public async renderPlainTextVersion(
    props: OneTimePasscodeEmailProps,
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
    const purpose: string =
      typeof props.purpose === "string" && props.purpose.length > 0
        ? props.purpose
        : "signing in to your account";

    const lines: string[] = [
      `${props.code} is your ${productName} verification code.`,
      "",
      `Hi ${greetingName},`,
      "",
      `Use the passcode below to finish ${purpose} on ${productName}.`,
      "",
      `Your passcode: ${props.code}`,
    ];

    if (
      typeof props.expiresInMinutes === "string" &&
      props.expiresInMinutes.length > 0
    ) {
      lines.push(
        `This code expires in ${props.expiresInMinutes} minutes and can only be used once.`,
      );
    } else {
      lines.push("This code can only be used once.");
    }
    lines.push("");

    if (typeof props.verifyUrl === "string" && props.verifyUrl.length > 0) {
      lines.push(`Enter the code: ${props.verifyUrl}`);
      lines.push("");
    }

    const metaLines: string[] = [];
    if (typeof props.requestedAt === "string" && props.requestedAt.length > 0) {
      metaLines.push(`Requested: ${props.requestedAt}`);
    }
    if (typeof props.device === "string" && props.device.length > 0) {
      metaLines.push(`Device: ${props.device}`);
    }
    if (typeof props.location === "string" && props.location.length > 0) {
      metaLines.push(`Location: ${props.location}`);
    }
    if (typeof props.ipAddress === "string" && props.ipAddress.length > 0) {
      metaLines.push(`IP address: ${props.ipAddress}`);
    }
    if (metaLines.length > 0) {
      lines.push("Request details:");
      for (const metaLine of metaLines) {
        lines.push(`  ${metaLine}`);
      }
      lines.push("");
    }

    lines.push(
      `Never share this code. ${productName} staff will never ask you for it by email, chat, or phone. If someone is asking you for this passcode, they are trying to access your account.`,
    );
    lines.push("");
    lines.push(
      "Didn't request this code? You can safely ignore this email — the code expires on its own and nothing changes unless it is used.",
    );
    lines.push(
      `If you keep receiving codes you didn't ask for, contact us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default OneTimePasscode;
