import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";

export class MyTestEmail extends EmailTemplatesCatalogEntry<{ name: string }> {
  public id = "my-test-email" as const satisfies string;

  public description =
    "Simple test email. Props: { name: string }" as const satisfies string;

  public validateProps(val: unknown): val is { name: string } {
    if (typeof val !== "object" || !val) {
      return false;
    }
    if (!("name" in val)) {
      return false;
    }

    if (typeof val.name === "string") {
      return true;
    }

    return false;
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
