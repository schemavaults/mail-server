import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import type { MagicLinkSignInEmailProps } from "@/email-templates/magic-link-sign-in";

export class MagicLinkSignIn extends EmailTemplatesCatalogEntry<MagicLinkSignInEmailProps> {
  public id = "magic-link-sign-in" as const satisfies string;

  public description =
    "Passwordless magic-link sign-in email sent when a user requests to sign in via email. Features a gradient header in the configured brand colors, a primary 'Sign in' CTA button, a copy-paste fallback URL, an optional one-time code panel for environments where the link cannot be clicked, an optional sign-in attempt context table (requested time, device, browser, location, IP), and a security footer with a 'didn't request this' reassurance. Props: { magicLinkUrl: string, recipientEmail?: string, recipientName?: string, oneTimeCode?: string, expiresInMinutes?: number, device?: string, browser?: string, location?: string, ipAddress?: string, requestedAt?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is MagicLinkSignInEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    if (!("magicLinkUrl" in val)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' is missing required prop 'magicLinkUrl' (expected string).`,
      );
    }
    if (typeof val.magicLinkUrl !== "string") {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'magicLinkUrl' to be a string, but got ${typeof val.magicLinkUrl}.`,
      );
    }
    const optionalStringKeys: readonly (keyof MagicLinkSignInEmailProps)[] = [
      "recipientEmail",
      "recipientName",
      "oneTimeCode",
      "device",
      "browser",
      "location",
      "ipAddress",
      "requestedAt",
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
      "expiresInMinutes" in val &&
      typeof val.expiresInMinutes !== "undefined" &&
      typeof val.expiresInMinutes !== "number"
    ) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected optional prop 'expiresInMinutes' to be a number when provided, but got ${typeof val.expiresInMinutes}.`,
      );
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<
    FC<MagicLinkSignInEmailProps>
  > {
    const component = await import("@/email-templates/magic-link-sign-in").then(
      (mod) => mod.default,
    );
    return component;
  }

  public async renderPlainTextVersion(
    props: MagicLinkSignInEmailProps,
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
    const recipientName: string =
      typeof props.recipientName === "string" && props.recipientName.length > 0
        ? props.recipientName
        : "there";
    const expiresInMinutes: number =
      typeof props.expiresInMinutes === "number" &&
      Number.isFinite(props.expiresInMinutes) &&
      props.expiresInMinutes > 0
        ? Math.floor(props.expiresInMinutes)
        : 15;
    const recipientEmailLine: string =
      typeof props.recipientEmail === "string" &&
      props.recipientEmail.length > 0
        ? ` as ${props.recipientEmail}`
        : "";

    const lines: string[] = [
      `Your ${productName} sign-in link — expires in ${expiresInMinutes} minutes.`,
      "",
      `Hi ${recipientName},`,
      "",
      `Click the link below to securely sign in to ${productName}${recipientEmailLine}. This link will expire in ${expiresInMinutes} minutes and can only be used once.`,
      "",
      `Sign in: ${props.magicLinkUrl}`,
      "",
    ];

    if (typeof props.oneTimeCode === "string" && props.oneTimeCode.length > 0) {
      lines.push("Or paste this one-time code:");
      lines.push(`  ${props.oneTimeCode}`);
      lines.push("");
    }

    const contextRows: Array<[string, string]> = [];
    if (typeof props.requestedAt === "string" && props.requestedAt.length > 0) {
      contextRows.push(["Requested", props.requestedAt]);
    }
    if (typeof props.device === "string" && props.device.length > 0) {
      contextRows.push(["Device", props.device]);
    }
    if (typeof props.browser === "string" && props.browser.length > 0) {
      contextRows.push(["Browser", props.browser]);
    }
    if (typeof props.location === "string" && props.location.length > 0) {
      contextRows.push(["Location", props.location]);
    }
    if (typeof props.ipAddress === "string" && props.ipAddress.length > 0) {
      contextRows.push(["IP address", props.ipAddress]);
    }

    if (contextRows.length > 0) {
      lines.push("Sign-in attempt details:");
      for (const [label, value] of contextRows) {
        lines.push(`  ${label}: ${value}`);
      }
      lines.push("");
    }

    lines.push(
      "Didn't request this email? You can safely ignore it — your account stays secure as long as the link is not used.",
    );
    lines.push(
      `If you're worried about unauthorized access, please contact us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default MagicLinkSignIn;
