import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";

export class MyTestEmail extends EmailTemplatesCatalogEntry<{ name: string }> {
  public id = "my-test-email" as const satisfies string;

  public description =
    "Simple test email. Props: { name: string }" as const satisfies string;

  public validateProps(val: unknown): val is { name: string } {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    if (!("name" in val)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' is missing required prop 'name' (expected string).`,
      );
    }
    if (typeof val.name !== "string") {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'name' to be a string, but got ${typeof val.name}.`,
      );
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<FC<{ name: string }>> {
    const component = await import("@/email-templates/my-test-email").then(
      (mod) => mod.default,
    );
    return component;
  }

  public async renderPlainTextVersion(props: {
    name: string;
  }): Promise<string> {
    return `Hello ${props.name}!`;
  }
}

export default MyTestEmail;
