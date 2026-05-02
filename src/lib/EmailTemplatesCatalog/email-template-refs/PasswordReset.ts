import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";

interface PasswordResetProps {
  resetLink: string;
  expiresInMinutes: number;
}

export class PasswordReset extends EmailTemplatesCatalogEntry<PasswordResetProps> {
  public id = "password-reset" as const satisfies string;

  public description =
    "Password reset email with a magic link. Props: { resetLink: string, expiresInMinutes: number }" as const satisfies string;

  public validateProps(val: unknown): val is PasswordResetProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    if (!("resetLink" in val)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' is missing required prop 'resetLink' (expected string).`,
      );
    }
    if (typeof val.resetLink !== "string") {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'resetLink' to be a string, but got ${typeof val.resetLink}.`,
      );
    }
    if (!("expiresInMinutes" in val)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' is missing required prop 'expiresInMinutes' (expected number).`,
      );
    }
    if (typeof val.expiresInMinutes !== "number") {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'expiresInMinutes' to be a number, but got ${typeof val.expiresInMinutes}.`,
      );
    }
    return true;
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
