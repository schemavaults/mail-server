import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import type { MagicLinkSignInEmailProps } from "@/email-templates/magic-link-sign-in";

export class MagicLinkSignIn extends EmailTemplatesCatalogEntry<MagicLinkSignInEmailProps> {
  public id = "magic-link-sign-in" as const satisfies string;

  public description =
    "Passwordless magic-link sign-in email sent when a user requests to sign in via email. Features a SchemaVaults brand-blue gradient header, a primary 'Sign in' CTA button, a copy-paste fallback URL, an optional one-time code panel for environments where the link cannot be clicked, an optional sign-in attempt context table (requested time, device, browser, location, IP), and a security footer with a 'didn't request this' reassurance. Props: { magicLinkUrl: string, recipientEmail?: string, recipientName?: string, oneTimeCode?: string, expiresInMinutes?: number, device?: string, browser?: string, location?: string, ipAddress?: string, requestedAt?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is MagicLinkSignInEmailProps {
    if (typeof val !== "object" || !val) {
      return false;
    }
    if (!("magicLinkUrl" in val) || typeof val.magicLinkUrl !== "string") {
      return false;
    }
    if (
      "recipientEmail" in val &&
      typeof val.recipientEmail !== "undefined" &&
      typeof val.recipientEmail !== "string"
    ) {
      return false;
    }
    if (
      "recipientName" in val &&
      typeof val.recipientName !== "undefined" &&
      typeof val.recipientName !== "string"
    ) {
      return false;
    }
    if (
      "oneTimeCode" in val &&
      typeof val.oneTimeCode !== "undefined" &&
      typeof val.oneTimeCode !== "string"
    ) {
      return false;
    }
    if (
      "expiresInMinutes" in val &&
      typeof val.expiresInMinutes !== "undefined" &&
      typeof val.expiresInMinutes !== "number"
    ) {
      return false;
    }
    if (
      "device" in val &&
      typeof val.device !== "undefined" &&
      typeof val.device !== "string"
    ) {
      return false;
    }
    if (
      "browser" in val &&
      typeof val.browser !== "undefined" &&
      typeof val.browser !== "string"
    ) {
      return false;
    }
    if (
      "location" in val &&
      typeof val.location !== "undefined" &&
      typeof val.location !== "string"
    ) {
      return false;
    }
    if (
      "ipAddress" in val &&
      typeof val.ipAddress !== "undefined" &&
      typeof val.ipAddress !== "string"
    ) {
      return false;
    }
    if (
      "requestedAt" in val &&
      typeof val.requestedAt !== "undefined" &&
      typeof val.requestedAt !== "string"
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
    const productName: string =
      typeof props.productName === "string" && props.productName.length > 0
        ? props.productName
        : "SchemaVaults";
    const supportEmail: string =
      typeof props.supportEmail === "string" && props.supportEmail.length > 0
        ? props.supportEmail
        : "support@schemavaults.com";
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
