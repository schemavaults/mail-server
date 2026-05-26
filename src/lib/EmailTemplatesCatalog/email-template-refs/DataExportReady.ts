import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Data export ready notification sent when an async data-export job finishes and an archive is available for download (typically a GDPR/CCPA right-to-portability flow). Uses the SchemaVaults brand gradient header, an 'What's included' callout listing the data categories in the archive, a metadata table (file, format, size, requested-at, expires-at), a primary download CTA with fallback link, and a red 'keep safe / link expires' warning panel. Props: { name: string, downloadUrl: string, archiveName?: string, format?: string, fileSize?: string, requestedAt?: string, expiresAt?: string, dataIncluded?: string[], productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is DataExportReadyEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof DataExportReadyEmailProps)[] = [
      "name",
      "downloadUrl",
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
      "archiveName",
      "format",
      "fileSize",
      "requestedAt",
      "expiresAt",
      "productName",
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
    if (
      "dataIncluded" in val &&
      typeof (val as Record<string, unknown>).dataIncluded !== "undefined"
    ) {
      const di = (val as Record<string, unknown>).dataIncluded;
      if (!Array.isArray(di)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'dataIncluded' to be an array of strings when provided, but got ${typeof di}.`,
        );
      }
      for (let i = 0; i < di.length; i++) {
        if (typeof di[i] !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected every entry of prop 'dataIncluded' to be a string, but entry at index ${i} is ${typeof di[i]}.`,
          );
        }
      }
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<
    FC<DataExportReadyEmailProps>
  > {
    const component = await import(
      "@/email-templates/data-export-ready"
    ).then((mod) => mod.default);
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
    const dataIncluded: readonly string[] =
      Array.isArray(props.dataIncluded) && props.dataIncluded.length > 0
        ? props.dataIncluded
        : [
            "Account profile and settings",
            "Schemas and vaults you own",
            "Mailing list memberships",
          ];

    const lines: string[] = [
      `Your ${productName} data export is ready.`,
      "",
      `Hi ${props.name},`,
      "",
      `We've packaged the data you requested from your ${productName} account into a single archive. Use the link below to download it.`,
      "",
    ];

    if (typeof props.archiveName === "string" && props.archiveName.length > 0) {
      lines.push(`File: ${props.archiveName}`);
    }
    if (typeof props.format === "string" && props.format.length > 0) {
      lines.push(`Format: ${props.format}`);
    }
    if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
      lines.push(`Size: ${props.fileSize}`);
    }
    if (typeof props.requestedAt === "string" && props.requestedAt.length > 0) {
      lines.push(`Requested: ${props.requestedAt}`);
    }
    if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
      lines.push(`Expires: ${props.expiresAt}`);
    }
    lines.push("");

    lines.push("What's included:");
    for (const item of dataIncluded) {
      lines.push(`  - ${item}`);
    }
    lines.push("");

    lines.push(`Download archive: ${props.downloadUrl}`);
    lines.push("");

    const expiresLine: string =
      typeof props.expiresAt === "string" && props.expiresAt.length > 0
        ? `The download link expires on ${props.expiresAt}.`
        : "The download link will expire soon.";
    lines.push(
      `${expiresLine} Treat the archive like a password — it contains personal data tied to your ${productName} account.`,
    );
    lines.push("");
    lines.push(
      `Didn't request this export? Reach us right away at ${supportEmail} so we can secure your account.`,
    );

    return lines.join("\n");
  }
}

export default DataExportReady;
