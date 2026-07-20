import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Transactional email sent when a user-requested data export has finished packaging and is available to download. Uses the SchemaVaults brand-blue gradient header, an emerald 'Ready to download' success callout, a metadata table (export type, format, size, requested time, expiration), a prominent download CTA, a copy-link fallback, and an amber expiration warning callout when the download link is time-limited. Props: { downloadUrl: string, name?: string, exportType?: string, format?: string, fileSize?: string, requestedAt?: string, expiresAt?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is DataExportReadyEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof DataExportReadyEmailProps)[] = [
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
      "name",
      "exportType",
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
    const greetingName: string =
      typeof props.name === "string" && props.name.length > 0
        ? props.name
        : "there";
    const exportType: string =
      typeof props.exportType === "string" && props.exportType.length > 0
        ? props.exportType
        : "Data export";

    const lines: string[] = [
      `Your ${exportType.toLowerCase()} from ${productName} is ready to download.`,
      "",
      `Hi ${greetingName},`,
      "",
      `The ${exportType.toLowerCase()} you requested from ${productName} has finished processing. Use the link below to download it — the archive is served over a signed, single-use URL scoped to your account.`,
      "",
      `Export: ${exportType}`,
    ];

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
      lines.push(`Link expires: ${props.expiresAt}`);
    }

    lines.push("");
    lines.push(`Download: ${props.downloadUrl}`);
    lines.push("");

    if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
      lines.push(
        `Heads up: this download link expires on ${props.expiresAt}. After that you'll need to request a new export from your account.`,
      );
      lines.push("");
    }

    lines.push(
      `Didn't request this export? Someone with access to your account may have started it. Reach us at ${supportEmail} and we'll help you review recent activity.`,
    );

    return lines.join("\n");
  }
}

export default DataExportReady;
