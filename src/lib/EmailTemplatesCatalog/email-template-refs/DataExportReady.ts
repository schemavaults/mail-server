import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Data export ready email sent when a user's requested account/data export has finished processing and is available to download. Uses the SchemaVaults brand gradient header, a green 'Export complete' success callout, a metadata table (export type, format, size, record count, requested/expires timestamps), a primary download CTA with a visible fallback link, and an amber 'Link expires' warning when an expiration is provided. Props: { downloadUrl: string, userName?: string, exportType?: string, fileFormat?: string, fileSize?: string, recordCount?: string, requestedAt?: string, expiresAt?: string, productName?: string, supportEmail?: string }" as const satisfies string;

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
      "fileFormat",
      "fileSize",
      "recordCount",
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
      typeof props.userName === "string" && props.userName.length > 0
        ? props.userName
        : "there";
    const exportType: string =
      typeof props.exportType === "string" && props.exportType.length > 0
        ? props.exportType
        : "Account data export";

    const lines: string[] = [
      `Your ${exportType.toLowerCase()} from ${productName} is ready to download.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We've finished packaging the data you requested from ${productName}. The link is unique to your account and will expire.`,
      "",
      `Export complete: ${exportType} is ready. Download it before the link expires and store the archive somewhere safe — we can't recover it for you once removed.`,
      "",
    ];

    lines.push(`Export: ${exportType}`);
    if (typeof props.fileFormat === "string" && props.fileFormat.length > 0) {
      lines.push(`Format: ${props.fileFormat}`);
    }
    if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
      lines.push(`Size: ${props.fileSize}`);
    }
    if (
      typeof props.recordCount === "string" &&
      props.recordCount.length > 0
    ) {
      lines.push(`Records: ${props.recordCount}`);
    }
    if (
      typeof props.requestedAt === "string" &&
      props.requestedAt.length > 0
    ) {
      lines.push(`Requested: ${props.requestedAt}`);
    }
    if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
      lines.push(`Available until: ${props.expiresAt}`);
    }
    lines.push("");
    lines.push(`Download export: ${props.downloadUrl}`);
    lines.push("");

    if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
      lines.push(
        `Link expires: This download link stops working on ${props.expiresAt}. After that you'll need to request a fresh export.`,
      );
      lines.push("");
    }

    lines.push(
      "Didn't request an export? Someone with access to your account may have. Reset your password and let us know at",
    );
    lines.push(supportEmail + ".");

    return lines.join("\n");
  }
}

export default DataExportReady;
