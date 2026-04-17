import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import type { WelcomeEmailProps } from "@/email-templates/welcome";

export class Welcome extends EmailTemplatesCatalogEntry<WelcomeEmailProps> {
  public id = "welcome" as const satisfies string;

  public description =
    "Onboarding welcome email sent after account creation. Uses SchemaVaults brand colors with a hero header, CTA button, and quick-start bullet list. Props: { name: string, productName?: string, ctaUrl?: string, ctaLabel?: string, highlights?: string[], supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is WelcomeEmailProps {
    if (typeof val !== "object" || !val) {
      return false;
    }
    if (!("name" in val) || typeof val.name !== "string") {
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
      "ctaUrl" in val &&
      typeof val.ctaUrl !== "undefined" &&
      typeof val.ctaUrl !== "string"
    ) {
      return false;
    }
    if (
      "ctaLabel" in val &&
      typeof val.ctaLabel !== "undefined" &&
      typeof val.ctaLabel !== "string"
    ) {
      return false;
    }
    if ("highlights" in val && typeof val.highlights !== "undefined") {
      if (!Array.isArray(val.highlights)) {
        return false;
      }
      if (!val.highlights.every((h) => typeof h === "string")) {
        return false;
      }
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
