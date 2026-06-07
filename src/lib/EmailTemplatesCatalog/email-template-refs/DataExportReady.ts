import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Notification email sent when an asynchronously processed data export (account data, schemas, audit logs, etc.) has finished and is ready to download. Uses the SchemaVaults brand gradient header, a metadata table (export type, format, file count, size, requested at, link expiration), a primary CTA to download, a warning callout highlighting the link expiration for security, and a 'What's inside' panel describing the archive contents. Props: { exportType: string, downloadUrl: string, expiresAt: string, userName?: string, fileSizeFormatted?: string, fileCount?: string, format?: string, requestedAt?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is DataExportReadyEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof DataExportReadyEmailProps)[] = [
      "exportType",
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
      "userName",
      "fileSizeFormatted",
      "fileCount",
      "format",
      "requestedAt",
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
      typeof props.userName === "string" && props.userName.length > 0
        ? props.userName
        : "there";

    const lines: string[] = [
      `Your ${props.exportType} export from ${productName} is ready to download.`,
      "",
      `Hi ${greetingName},`,
      "",
      `The ${props.exportType} export you requested from ${productName} has finished processing and is ready to download. Use the secure link below to grab the archive before it expires.`,
      "",
      `Export type: ${props.exportType}`,
    ];

    if (typeof props.format === "string" && props.format.length > 0) {
      lines.push(`Format: ${props.format}`);
    }
    if (typeof props.fileCount === "string" && props.fileCount.length > 0) {
      lines.push(`Files: ${props.fileCount}`);
    }
    if (
      typeof props.fileSizeFormatted === "string" &&
      props.fileSizeFormatted.length > 0
    ) {
      lines.push(`Size: ${props.fileSizeFormatted}`);
    }
    if (
      typeof props.requestedAt === "string" &&
      props.requestedAt.length > 0
    ) {
      lines.push(`Requested: ${props.requestedAt}`);
    }
    lines.push(`Link expires: ${props.expiresAt}`);
    lines.push("");
    lines.push(`Download: ${props.downloadUrl}`);
    lines.push("");
    lines.push(
      `For your security, this download link is single-use and will expire automatically. After it expires, you can generate a new export from your account settings.`,
    );
    lines.push("");
    lines.push(
      `Didn't request this export? Your account may have been accessed without your permission. Please reset your password immediately and contact ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default DataExportReady;
