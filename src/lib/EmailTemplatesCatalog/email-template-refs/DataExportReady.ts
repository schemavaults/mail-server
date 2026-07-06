import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Transactional email sent when a user-requested data export has finished processing and is ready to download. Uses the SchemaVaults brand gradient header, a green 'Export completed' success callout, a primary 'Download export' CTA, a metadata table (export name, type, format, size, record count, requester, requested-at), an optional dark code-style panel with the archive's SHA-256 checksum for integrity verification, an amber notice card highlighting the download link's expiration, and a muted 'Didn't request this export?' panel pointing back to support. Props: { exportName: string, downloadUrl: string, userName?: string, exportType?: string, fileFormat?: string, fileSize?: string, recordCount?: string, requestedAt?: string, requestedByName?: string, requestedByEmail?: string, expiresAt?: string, checksum?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is DataExportReadyEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof DataExportReadyEmailProps)[] = [
      "exportName",
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
      "requestedByName",
      "requestedByEmail",
      "expiresAt",
      "checksum",
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
        : "Data export";
    const requestedByLine: string | undefined =
      typeof props.requestedByName === "string" &&
      props.requestedByName.length > 0
        ? typeof props.requestedByEmail === "string" &&
          props.requestedByEmail.length > 0
          ? `${props.requestedByName} (${props.requestedByEmail})`
          : props.requestedByName
        : typeof props.requestedByEmail === "string" &&
            props.requestedByEmail.length > 0
          ? props.requestedByEmail
          : undefined;

    const lines: string[] = [
      `Your ${productName} export "${props.exportName}" is ready to download.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We finished preparing your "${props.exportName}" export from ${productName}. It's ready to download using the secure link below.`,
      "",
      `Download export: ${props.downloadUrl}`,
      "",
      `Export: ${props.exportName}`,
      `Type: ${exportType}`,
    ];

    if (typeof props.fileFormat === "string" && props.fileFormat.length > 0) {
      lines.push(`Format: ${props.fileFormat}`);
    }
    if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
      lines.push(`Size: ${props.fileSize}`);
    }
    if (typeof props.recordCount === "string" && props.recordCount.length > 0) {
      lines.push(`Records: ${props.recordCount}`);
    }
    if (requestedByLine) {
      lines.push(`Requested by: ${requestedByLine}`);
    }
    if (typeof props.requestedAt === "string" && props.requestedAt.length > 0) {
      lines.push(`Requested at: ${props.requestedAt}`);
    }
    if (typeof props.checksum === "string" && props.checksum.length > 0) {
      lines.push("");
      lines.push(`SHA-256 checksum: ${props.checksum}`);
    }
    if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
      lines.push("");
      lines.push(
        `This download link is valid until ${props.expiresAt}. After that, request a new export from your account settings.`,
      );
    }
    lines.push("");
    lines.push("Didn't request this export?");
    lines.push(
      `If you weren't expecting this export, someone else with account access may have created it. Review recent activity and reach out to us at ${supportEmail}.`,
    );
    lines.push("");
    lines.push(
      "Treat this archive like any other backup — it contains your account data. Store it somewhere safe and delete it when you no longer need it.",
    );

    return lines.join("\n");
  }
}

export default DataExportReady;
