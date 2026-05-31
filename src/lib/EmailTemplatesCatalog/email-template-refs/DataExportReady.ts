import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Transactional email sent when a user's requested data export (e.g. GDPR / data-portability download) has finished processing and is ready to download. Uses SchemaVaults brand gradient header, a dark code-style 'Archive' panel showing the file name, a metadata table (export type, format, size, item count, date range, request origin), a primary 'Download your export' CTA with a visible fallback link, an amber 'Link expires …' warning callout, an optional password-protected-archive panel, an optional 'Manage data' link, and a red 'didn't request this?' security note. Props: { downloadUrl: string, userName?: string, exportType?: string, fileName?: string, fileSize?: string, fileFormat?: string, itemCount?: string, dateRangeStart?: string, dateRangeEnd?: string, requestedAt?: string, requestedFromIp?: string, requestedFromLocation?: string, expiresAt?: string, downloadPasswordHint?: string, manageDataUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

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
      "userName",
      "exportType",
      "fileName",
      "fileSize",
      "fileFormat",
      "itemCount",
      "dateRangeStart",
      "dateRangeEnd",
      "requestedAt",
      "requestedFromIp",
      "requestedFromLocation",
      "expiresAt",
      "downloadPasswordHint",
      "manageDataUrl",
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
    const exportType: string =
      typeof props.exportType === "string" && props.exportType.length > 0
        ? props.exportType
        : "Account data export";
    const dateRange: string | undefined =
      typeof props.dateRangeStart === "string" &&
      props.dateRangeStart.length > 0 &&
      typeof props.dateRangeEnd === "string" &&
      props.dateRangeEnd.length > 0
        ? `${props.dateRangeStart} -> ${props.dateRangeEnd}`
        : typeof props.dateRangeStart === "string" &&
            props.dateRangeStart.length > 0
          ? `from ${props.dateRangeStart}`
          : typeof props.dateRangeEnd === "string" &&
              props.dateRangeEnd.length > 0
            ? `through ${props.dateRangeEnd}`
            : undefined;

    const lines: string[] = [
      `Your ${productName} data export is ready to download.`,
      "",
      `Hi ${greetingName},`,
      "",
      `The ${exportType.toLowerCase()} you requested from ${productName} has finished processing and is ready to download. The archive contains a complete copy of your data in a portable, machine-readable format.`,
      "",
      `Export type: ${exportType}`,
    ];

    if (typeof props.fileName === "string" && props.fileName.length > 0) {
      lines.push(`File name: ${props.fileName}`);
    }
    if (typeof props.fileFormat === "string" && props.fileFormat.length > 0) {
      lines.push(`Format: ${props.fileFormat}`);
    }
    if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
      lines.push(`File size: ${props.fileSize}`);
    }
    if (typeof props.itemCount === "string" && props.itemCount.length > 0) {
      lines.push(`Items: ${props.itemCount}`);
    }
    if (dateRange) {
      lines.push(`Date range: ${dateRange}`);
    }
    if (
      typeof props.requestedAt === "string" &&
      props.requestedAt.length > 0
    ) {
      lines.push(`Requested at: ${props.requestedAt}`);
    }
    if (
      typeof props.requestedFromIp === "string" &&
      props.requestedFromIp.length > 0
    ) {
      lines.push(`Requested from: ${props.requestedFromIp}`);
    }
    if (
      typeof props.requestedFromLocation === "string" &&
      props.requestedFromLocation.length > 0
    ) {
      lines.push(`Location: ${props.requestedFromLocation}`);
    }

    lines.push("");
    lines.push(`Download your export: ${props.downloadUrl}`);
    lines.push("");

    if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
      lines.push(`Link expires: ${props.expiresAt}`);
      lines.push(
        "For your security, this download link is one-time-use and expires after the date above. After it expires, you'll need to request a new export.",
      );
      lines.push("");
    }

    if (
      typeof props.downloadPasswordHint === "string" &&
      props.downloadPasswordHint.length > 0
    ) {
      lines.push("Archive is password-protected:");
      lines.push(`  ${props.downloadPasswordHint}`);
      lines.push("");
    }

    lines.push("Handle this archive carefully:");
    lines.push(
      "The export contains a complete copy of your account data — including any personal information you've stored with us. Treat it like a backup of your password manager: store it somewhere encrypted and delete it once you're done.",
    );
    lines.push("");

    if (
      typeof props.manageDataUrl === "string" &&
      props.manageDataUrl.length > 0
    ) {
      lines.push(
        `Manage your data and privacy preferences at ${props.manageDataUrl}.`,
      );
      lines.push("");
    }

    lines.push(
      `Didn't request this export? Don't download the archive and email ${supportEmail} right away — someone may have access to your account.`,
    );

    return lines.join("\n");
  }
}

export default DataExportReady;
