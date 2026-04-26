import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import type { MagicLinkSignInEmailProps } from "@/email-templates/magic-link-sign-in";

export class MagicLinkSignIn extends EmailTemplatesCatalogEntry<MagicLinkSignInEmailProps> {
  public id = "magic-link-sign-in" as const satisfies string;

  public description =
    "Passwordless sign-in email containing a single-use magic link. Uses the SchemaVaults brand gradient header, an accent-tinted expiration callout, a primary CTA, a visible fallback URL, and an optional 'Request details' panel (account, device, browser, location, IP, timestamp) so the recipient can recognize unfamiliar requests. Props: { signInUrl: string, recipientName?: string, recipientEmail?: string, expiresInMinutes?: number, requestedFromDevice?: string, requestedFromBrowser?: string, requestedFromLocation?: string, requestedFromIp?: string, requestedAt?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is MagicLinkSignInEmailProps {
    if (typeof val !== "object" || !val) {
      return false;
    }
    if (!("signInUrl" in val) || typeof val.signInUrl !== "string") {
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
      "recipientEmail" in val &&
      typeof val.recipientEmail !== "undefined" &&
      typeof val.recipientEmail !== "string"
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
      "requestedFromDevice" in val &&
      typeof val.requestedFromDevice !== "undefined" &&
      typeof val.requestedFromDevice !== "string"
    ) {
      return false;
    }
    if (
      "requestedFromBrowser" in val &&
      typeof val.requestedFromBrowser !== "undefined" &&
      typeof val.requestedFromBrowser !== "string"
    ) {
      return false;
    }
    if (
      "requestedFromLocation" in val &&
      typeof val.requestedFromLocation !== "undefined" &&
      typeof val.requestedFromLocation !== "string"
    ) {
      return false;
    }
    if (
      "requestedFromIp" in val &&
      typeof val.requestedFromIp !== "undefined" &&
      typeof val.requestedFromIp !== "string"
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
    const component = await import(
      "@/email-templates/magic-link-sign-in"
    ).then((mod) => mod.default);
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
    const greetingName: string =
      typeof props.recipientName === "string" &&
      props.recipientName.length > 0
        ? props.recipientName
        : "there";
    const expiresInMinutes: number =
      typeof props.expiresInMinutes === "number" &&
      Number.isFinite(props.expiresInMinutes) &&
      props.expiresInMinutes > 0
        ? Math.floor(props.expiresInMinutes)
        : 15;

    const lines: string[] = [
      `Your one-time sign-in link for ${productName}`,
      "",
      `Hi ${greetingName},`,
      "",
      `You requested a sign-in link for ${productName}. Open the link below to sign in — no password required. This link is single-use and expires in ${expiresInMinutes} ${expiresInMinutes === 1 ? "minute" : "minutes"}.`,
      "",
      `Sign in: ${props.signInUrl}`,
      "",
    ];

    const metaRows: Array<[string, string]> = [];
    if (
      typeof props.recipientEmail === "string" &&
      props.recipientEmail.length > 0
    ) {
      metaRows.push(["Account", props.recipientEmail]);
    }
    if (typeof props.requestedAt === "string" && props.requestedAt.length > 0) {
      metaRows.push(["Requested", props.requestedAt]);
    }
    if (
      typeof props.requestedFromDevice === "string" &&
      props.requestedFromDevice.length > 0
    ) {
      metaRows.push(["Device", props.requestedFromDevice]);
    }
    if (
      typeof props.requestedFromBrowser === "string" &&
      props.requestedFromBrowser.length > 0
    ) {
      metaRows.push(["Browser", props.requestedFromBrowser]);
    }
    if (
      typeof props.requestedFromLocation === "string" &&
      props.requestedFromLocation.length > 0
    ) {
      metaRows.push(["Location", props.requestedFromLocation]);
    }
    if (
      typeof props.requestedFromIp === "string" &&
      props.requestedFromIp.length > 0
    ) {
      metaRows.push(["IP address", props.requestedFromIp]);
    }

    if (metaRows.length > 0) {
      lines.push("Request details:");
      for (const [label, value] of metaRows) {
        lines.push(`  ${label}: ${value}`);
      }
      lines.push("");
    }

    lines.push(
      "Didn't request this? You can safely ignore this email — the link will expire on its own and your account stays untouched.",
    );
    lines.push(`Questions? Reach us at ${supportEmail}.`);

    return lines.join("\n");
  }
}

export default MagicLinkSignIn;
