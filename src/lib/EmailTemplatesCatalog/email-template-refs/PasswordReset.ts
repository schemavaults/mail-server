import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";

interface PasswordResetProps {
  resetLink: string;
  expiresInMinutes: number;
}

export class PasswordReset extends EmailTemplatesCatalogEntry<PasswordResetProps> {
  public id = "password-reset" as const satisfies string;

  public validateProps(val: unknown): val is PasswordResetProps {
    if (typeof val !== "object" || !val) {
      return false;
    }
    if (!("resetLink" in val) || !("expiresInMinutes" in val)) {
      return false;
    }

    return (
      typeof val.resetLink === "string" &&
      typeof val.expiresInMinutes === "number"
    );
  }

  public async loadReactEmailTemplate(): Promise<FC<PasswordResetProps>> {
    const component = await import("@/email-templates/password-reset").then(
      (mod) => mod.default,
    );
    return component;
  }

  public async renderPlainTextVersion(
    props: PasswordResetProps,
  ): Promise<string> {
    return `We received a request to reset your password.\n\nReset your password: ${props.resetLink}\n\nThis link will expire in ${props.expiresInMinutes} minutes. If you did not request a password reset, you can safely ignore this email.`;
  }
}

export default PasswordReset;
