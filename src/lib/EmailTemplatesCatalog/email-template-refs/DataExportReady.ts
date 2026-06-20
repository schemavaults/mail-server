import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Data export ready email sent when a user-requested account/data export (GDPR/CCPA-style portability download) has finished processing. Uses SchemaVaults brand gradient header, a 'What's included' callout, a metadata table (requested, format, size, expiration), a primary download CTA with a visible fallback link, an amber expiration warning panel, and a prominent security contact for unauthorized requests. Props: { name: string, downloadUrl: string, expiresAt: string, requestedAt?: string, fileSize?: string, fileFormat?: string, itemsIncluded?: string[], productName?: string, supportEmail?: string, securityContactEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is DataExportReadyEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof DataExportReadyEmailProps)[] = [
      "name",
      "downloadUrl",
      "expiresAt",
    ];
    for (const key of requiredStringKeys) {
      if (!(key in val)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' is missing required prop '${key}' (expected string).`,
        );
      }
      if (typeof (val as Record<string, unknown>)[key] !== "string") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected prop '${key}' to be a string, but got ${typeof (val as Record<string, unknown>)[key]}.`,
        );
      }
    }
    const optionalStringKeys: readonly (keyof DataExportReadyEmailProps)[] = [
      "requestedAt",
      "fileSize",
      "fileFormat",
      "productName",
      "supportEmail",
      "securityContactEmail",
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
    if (
      "itemsIncluded" in val &&
      typeof (val as Record<string, unknown>).itemsIncluded !== "undefined"
    ) {
      const items = (val as Record<string, unknown>).itemsIncluded;
      if (!Array.isArray(items)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'itemsIncluded' to be a string array when provided, but got ${typeof items}.`,
        );
      }
      for (let i = 0; i < items.length; i++) {
        if (typeof items[i] !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected every entry in 'itemsIncluded' to be a string, but entry at index ${i} was ${typeof items[i]}.`,
          );
        }
      }
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<
    FC<DataExportReadyEmailProps>
  > {
    const component = await import("@/email-templates/data-export-ready").then(
      (mod) => mod.default,
    );
    return component;
  }

  public async renderPlainTextVersion(
    props: DataExportReadyEmailProps,
  ): Promise<string> {
    const productName: string =
      typeof props.productName === "string" && props.productName.length > 0
        ? props.productName
        : "SchemaVaults";
    const supportEmail: string =
      typeof props.supportEmail === "string" && props.supportEmail.length > 0
        ? props.supportEmail
        : "support@schemavaults.com";
    const securityContactEmail: string =
      typeof props.securityContactEmail === "string" &&
      props.securityContactEmail.length > 0
        ? props.securityContactEmail
        : "security@schemavaults.com";
    const itemsIncluded: readonly string[] =
      Array.isArray(props.itemsIncluded) && props.itemsIncluded.length > 0
        ? props.itemsIncluded
        : [
            "Account profile and settings",
            "Activity history and audit logs",
            "Schemas and vault contents you own",
          ];

    const lines: string[] = [
      `Your ${productName} data export is ready.`,
      "",
      `Hi ${props.name},`,
      "",
      `The export you requested from ${productName} has finished processing and is ready to download. The archive is encrypted in transit and tied to your account.`,
      "",
      "What's included:",
    ];
    for (const item of itemsIncluded) {
      lines.push(`  - ${item}`);
    }
    lines.push("");
    if (
      typeof props.requestedAt === "string" &&
      props.requestedAt.length > 0
    ) {
      lines.push(`Requested: ${props.requestedAt}`);
    }
    if (typeof props.fileFormat === "string" && props.fileFormat.length > 0) {
      lines.push(`Format: ${props.fileFormat}`);
    }
    if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
      lines.push(`Size: ${props.fileSize}`);
    }
    lines.push(`Expires: ${props.expiresAt}`);
    lines.push("");
    lines.push(`Download: ${props.downloadUrl}`);
    lines.push("");
    lines.push(
      `This link expires ${props.expiresAt}. After it expires the archive is permanently deleted from our servers. Save a copy somewhere safe before then.`,
    );
    lines.push("");
    lines.push(
      `Didn't request this export? Your account may be compromised. Contact our security team immediately at ${securityContactEmail}.`,
    );
    lines.push(`For anything else, reach us at ${supportEmail}.`);

    return lines.join("\n");
  }
}

export default DataExportReady;
