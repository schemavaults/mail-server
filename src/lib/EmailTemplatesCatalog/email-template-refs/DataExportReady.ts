import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Data export ready notification sent when a user-requested data export (GDPR/CCPA download, account archive, vault export, etc.) has finished processing and is available for secure download. Uses SchemaVaults brand gradient header, a 'What's included' summary callout, a metadata table (export type, format, size, requested time, expiration), a primary download CTA, a visible fallback link, and a prominent expiration/security warning panel. Props: { exportType: string, downloadUrl: string, expiresAt: string, userName?: string, fileSize?: string, fileFormat?: string, requestedAt?: string, itemSummary?: string, productName?: string, supportEmail?: string }" as const satisfies string;

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
      "fileSize",
      "fileFormat",
      "requestedAt",
      "itemSummary",
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
    const greetingName: string =
      typeof props.userName === "string" && props.userName.length > 0
        ? props.userName
        : "there";

    const lines: string[] = [
      `Your ${productName} data export is ready to download.`,
      "",
      `Hi ${greetingName},`,
      "",
      `The export you requested from ${productName} has finished processing and is ready to download. The link below is unique to your account — please don't share it with anyone else.`,
      "",
    ];

    if (
      typeof props.itemSummary === "string" &&
      props.itemSummary.length > 0
    ) {
      lines.push("What's included:");
      lines.push(`  ${props.itemSummary}`);
      lines.push("");
    }

    lines.push(`Export: ${props.exportType}`);
    if (
      typeof props.fileFormat === "string" &&
      props.fileFormat.length > 0
    ) {
      lines.push(`Format: ${props.fileFormat}`);
    }
    if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
      lines.push(`Size: ${props.fileSize}`);
    }
    if (
      typeof props.requestedAt === "string" &&
      props.requestedAt.length > 0
    ) {
      lines.push(`Requested: ${props.requestedAt}`);
    }
    lines.push(`Link expires: ${props.expiresAt}`);
    lines.push("");
    lines.push(`Download export: ${props.downloadUrl}`);
    lines.push("");
    lines.push(
      `For your security, this download link is single-use and will stop working after ${props.expiresAt}. Request a new export from your account settings if you need access again.`,
    );
    lines.push("");
    lines.push(
      `Didn't request a data export? Your account may have been accessed by someone else — reset your password and contact us right away at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default DataExportReady;
