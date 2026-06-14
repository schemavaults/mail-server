import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "GDPR/CCPA-style data export notification sent when a user-requested archive of their account data has finished processing and is ready to download. Uses the SchemaVaults brand-blue gradient header, an emerald 'Ready to download' confirmation callout, a metadata table (scope, file format, size, record count, requested timestamp, expiration, export ID), a primary CTA to download with a fallback link, and an amber expiration warning panel explaining why download links are time-bound. Props: { downloadUrl: string, expiresAt: string, recipientName?: string, exportScope?: string, fileFormat?: string, fileSizeHumanReadable?: string, recordCount?: string, requestedAt?: string, exportId?: string, manageExportsUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is DataExportReadyEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof DataExportReadyEmailProps)[] = [
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
      "recipientName",
      "exportScope",
      "fileFormat",
      "fileSizeHumanReadable",
      "recordCount",
      "requestedAt",
      "exportId",
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
      typeof props.recipientName === "string" && props.recipientName.length > 0
        ? props.recipientName
        : "there";
    const exportScope: string =
      typeof props.exportScope === "string" && props.exportScope.length > 0
        ? props.exportScope
        : "your account data";

    const lines: string[] = [
      `Your ${productName} data export is ready to download.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We've finished preparing the export of ${exportScope} that you requested from ${productName}. The archive is ready and waiting for you to download.`,
      "",
      `Export scope: ${exportScope}`,
    ];

    if (typeof props.fileFormat === "string" && props.fileFormat.length > 0) {
      lines.push(`File format: ${props.fileFormat}`);
    }
    if (
      typeof props.fileSizeHumanReadable === "string" &&
      props.fileSizeHumanReadable.length > 0
    ) {
      lines.push(`File size: ${props.fileSizeHumanReadable}`);
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
    lines.push(`Link expires: ${props.expiresAt}`);
    if (typeof props.exportId === "string" && props.exportId.length > 0) {
      lines.push(`Export ID: ${props.exportId}`);
    }

    lines.push("");
    lines.push(`Download export: ${props.downloadUrl}`);
    lines.push("");
    lines.push(
      `This link expires on ${props.expiresAt}. After that, you'll need to request a new export. We expire download links to protect your data in case this email is forwarded or your inbox is compromised.`,
    );

    if (
      typeof props.manageExportsUrl === "string" &&
      props.manageExportsUrl.length > 0
    ) {
      lines.push("");
      lines.push(
        `Manage past exports and request new ones any time: ${props.manageExportsUrl}`,
      );
    }

    lines.push("");
    lines.push(
      `Didn't request this export? Someone with access to your account may have started it. Reach out to ${supportEmail} right away so we can help you secure things.`,
    );
    lines.push("");
    lines.push(
      `© ${new Date().getFullYear()} ${productName}. You are receiving this email because a data export was completed on your account.`,
    );

    return lines.join("\n");
  }
}

export default DataExportReady;
