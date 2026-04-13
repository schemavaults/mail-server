import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";

interface VerifyEmailProps {
  url: string;
  welcomeMessage?: string;
}

export class VerifyEmail extends EmailTemplatesCatalogEntry<VerifyEmailProps> {
  public id = "verify-email" as const satisfies string;

  public description =
    "Email verification email with a magic link. Props: { url: string, welcomeMessage?: string }" as const satisfies string;

  public validateProps(val: unknown): val is VerifyEmailProps {
    if (typeof val !== "object" || !val) {
      return false;
    }
    if (!("url" in val)) {
      return false;
    }
    if (typeof val.url !== "string") {
      return false;
    }
    if ("welcomeMessage" in val) {
      if (
        typeof val.welcomeMessage !== "undefined" &&
        typeof val.welcomeMessage !== "string"
      ) {
        return false;
      }
    }

    return true;
  }

  public async loadReactEmailTemplate(): Promise<FC<VerifyEmailProps>> {
    const component = await import("@/email-templates/verify-email").then(
      (mod) => mod.default,
    );
    return component;
  }

  public async renderPlainTextVersion(
    props: VerifyEmailProps,
  ): Promise<string> {
    const greeting =
      typeof props.welcomeMessage === "string" &&
      props.welcomeMessage.length > 0
        ? props.welcomeMessage
        : "Welcome! Please verify your email address to get started.";
    return `${greeting}\n\nVerify your email: ${props.url}\n\nIf you did not create an account, you can safely ignore this email.`;
  }
}

export default VerifyEmail;
