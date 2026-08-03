import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Data export ready email sent when a user's requested data export has finished processing and is available for download. Features the configured brand gradient header, a metadata table (export type, format, file size, record count, request time), an optional 'What's included' contents list, a primary download CTA with a visible fallback link, a prominent amber 'link expires' warning, an optional SHA-256 checksum in a monospace code block, and an optional encryption note. Props: { exportType: string, expiresAt: string, downloadUrl: string, userName?: string, exportFormat?: string, fileSize?: string, recordCount?: string, requestedAt?: string, checksumSha256?: string, encryptionNote?: string, manageExportsUrl?: string, includedItems?: readonly string[], productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is DataExportReadyEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof DataExportReadyEmailProps)[] = [
      "exportType",
      "expiresAt",
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
      "userName",
      "exportFormat",
      "fileSize",
      "recordCount",
      "requestedAt",
      "checksumSha256",
      "encryptionNote",
      "manageExportsUrl",
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
      "includedItems" in val &&
      typeof (val as Record<string, unknown>)["includedItems"] !== "undefined"
    ) {
      const items = (val as Record<string, unknown>)["includedItems"];
      if (!Array.isArray(items)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'includedItems' to be an array of strings when provided, but got ${typeof items}.`,
        );
      }
      for (let i = 0; i < items.length; i++) {
        if (typeof items[i] !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'includedItems[${i}]' to be a string, but got ${typeof items[i]}.`,
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
    const brand = getEmailBrand();
    const productName: string =
      typeof props.productName === "string" && props.productName.length > 0
        ? props.productName
        : brand.productName;
    const supportEmail: string =
      typeof props.supportEmail === "string" && props.supportEmail.length > 0
        ? props.supportEmail
        : brand.supportEmail;
    const greetingName: string =
      typeof props.userName === "string" && props.userName.length > 0
        ? props.userName
        : "there";

    const lines: string[] = [
      `Your ${props.exportType} export is ready to download.`,
      "",
      `Hi ${greetingName},`,
      "",
      `The ${props.exportType} export you requested on ${productName} has finished processing and is ready for you to download. For your security, the download link is single-use per session and will expire.`,
      "",
      `Export: ${props.exportType}`,
    ];

    if (
      typeof props.exportFormat === "string" &&
      props.exportFormat.length > 0
    ) {
      lines.push(`Format: ${props.exportFormat}`);
    }
    if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
      lines.push(`File size: ${props.fileSize}`);
    }
    if (typeof props.recordCount === "string" && props.recordCount.length > 0) {
      lines.push(`Records: ${props.recordCount}`);
    }
    if (typeof props.requestedAt === "string" && props.requestedAt.length > 0) {
      lines.push(`Requested: ${props.requestedAt}`);
    }
    lines.push("");

    if (Array.isArray(props.includedItems) && props.includedItems.length > 0) {
      lines.push("What's included:");
      for (const item of props.includedItems) {
        if (typeof item === "string" && item.length > 0) {
          lines.push(`  - ${item}`);
        }
      }
      lines.push("");
    }

    lines.push(`Download: ${props.downloadUrl}`);
    lines.push("");
    lines.push(`⚠ Link expires ${props.expiresAt}.`);
    lines.push(
      `After expiration, this export is permanently deleted from our servers. If you need it again, request a fresh export from your ${productName} account.`,
    );

    if (
      typeof props.checksumSha256 === "string" &&
      props.checksumSha256.length > 0
    ) {
      lines.push("");
      lines.push(`SHA-256 checksum: ${props.checksumSha256}`);
    }

    if (
      typeof props.encryptionNote === "string" &&
      props.encryptionNote.length > 0
    ) {
      lines.push("");
      lines.push(`Encryption: ${props.encryptionNote}`);
    }

    if (
      typeof props.manageExportsUrl === "string" &&
      props.manageExportsUrl.length > 0
    ) {
      lines.push("");
      lines.push(
        `View past exports or request another anytime: ${props.manageExportsUrl}`,
      );
    }

    lines.push("");
    lines.push(
      `Didn't request this export? Reply to this email or reach us at ${supportEmail} so we can investigate.`,
    );

    return lines.join("\n");
  }
}

export default DataExportReady;
