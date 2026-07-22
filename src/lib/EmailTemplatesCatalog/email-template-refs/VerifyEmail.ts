import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";

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
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    if (!("url" in val)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' is missing required prop 'url' (expected string).`,
      );
    }
    if (typeof val.url !== "string") {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'url' to be a string, but got ${typeof val.url}.`,
      );
    }
    if (
      "welcomeMessage" in val &&
      typeof val.welcomeMessage !== "undefined" &&
      typeof val.welcomeMessage !== "string"
    ) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected optional prop 'welcomeMessage' to be a string when provided, but got ${typeof val.welcomeMessage}.`,
      );
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
    const brand = getEmailBrand();
    const greeting =
      typeof props.welcomeMessage === "string" &&
      props.welcomeMessage.length > 0
        ? props.welcomeMessage
        : `Welcome to ${brand.productName}! Please verify your email address to get started.`;
    return `${greeting}\n\nVerify your email: ${props.url}\n\nIf you did not create an account, you can safely ignore this email.`;
  }
}

export default VerifyEmail;
