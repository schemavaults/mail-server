import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { WelcomeEmailProps } from "@/email-templates/welcome";

export class Welcome extends EmailTemplatesCatalogEntry<WelcomeEmailProps> {
  public id = "welcome" as const satisfies string;

  public description =
    "Onboarding welcome email sent after account creation. Uses SchemaVaults brand colors with a hero header, CTA button, and quick-start bullet list. Props: { name: string, productName?: string, ctaUrl?: string, ctaLabel?: string, highlights?: string[], supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is WelcomeEmailProps {
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
    const optionalStringKeys: readonly (keyof WelcomeEmailProps)[] = [
      "productName",
      "ctaUrl",
      "ctaLabel",
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
    if ("highlights" in val && typeof val.highlights !== "undefined") {
      if (!Array.isArray(val.highlights)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'highlights' to be an array of strings when provided, but got ${typeof val.highlights}.`,
        );
      }
      for (let i = 0; i < val.highlights.length; i++) {
        if (typeof val.highlights[i] !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected every entry of prop 'highlights' to be a string, but entry at index ${i} is ${typeof val.highlights[i]}.`,
          );
        }
      }
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<FC<WelcomeEmailProps>> {
    const component = await import("@/email-templates/welcome").then(
      (mod) => mod.default,
    );
    return component;
  }

  public async renderPlainTextVersion(
    props: WelcomeEmailProps,
  ): Promise<string> {
    const productName: string =
      typeof props.productName === "string" && props.productName.length > 0
        ? props.productName
        : "SchemaVaults";
    const ctaUrl: string =
      typeof props.ctaUrl === "string" && props.ctaUrl.length > 0
        ? props.ctaUrl
        : "https://schemavaults.com";
    const ctaLabel: string =
      typeof props.ctaLabel === "string" && props.ctaLabel.length > 0
        ? props.ctaLabel
        : "Open your dashboard";
    const highlights: readonly string[] =
      Array.isArray(props.highlights) && props.highlights.length > 0
        ? props.highlights
        : [
            "Browse curated schemas in the SchemaVaults library",
            "Vault your own schemas to share with your team",
            "Plug the schemas into your pipeline via the SchemaVaults SDK",
          ];
    const supportEmail: string =
      typeof props.supportEmail === "string" && props.supportEmail.length > 0
        ? props.supportEmail
        : "support@schemavaults.com";

    const lines: string[] = [
      `Welcome, ${props.name}.`,
      "",
      `Thanks for joining ${productName}. Your account is ready — the dashboard is one click away, and the quick-start guide below walks through what most teams do first.`,
      "",
      `${ctaLabel}: ${ctaUrl}`,
      "",
      "Quick start:",
      ...highlights.map((h) => `  - ${h}`),
      "",
      `Questions or feedback? Reply to this email or reach us at ${supportEmail}.`,
    ];

    return lines.join("\n");
  }
}

export default Welcome;
