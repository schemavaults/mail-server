import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Notification sent when a user-requested data export has finished processing and the download archive is ready. Uses the SchemaVaults brand gradient header, an optional 'Included in this export' callout describing scope, a dark-themed export identifier code block, a metadata table (format, file size, item count, requested/completed/expiration timestamps), a primary 'Download export' CTA with a visible fallback link, and a warning callout highlighting the download window. Props: { exportName: string, downloadUrl: string, userName?: string, exportId?: string, format?: string, fileSize?: string, itemCount?: string, requestedAt?: string, completedAt?: string, expiresAt?: string, scope?: string, productName?: string, supportEmail?: string }" as const satisfies string;

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
      "exportId",
      "format",
      "fileSize",
      "itemCount",
      "requestedAt",
      "completedAt",
      "expiresAt",
      "scope",
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
      `Your data export is ready on ${productName}.`,
      "",
      `Hi ${greetingName},`,
      "",
      `Your "${props.exportName}" export has finished processing and is ready to download. Use the secure link below to retrieve your archive — only you can access it while signed in to ${productName}.`,
      "",
    ];

    if (typeof props.scope === "string" && props.scope.length > 0) {
      lines.push("Included in this export:");
      lines.push(`  ${props.scope}`);
      lines.push("");
    }

    lines.push(`Export: ${props.exportName}`);
    if (typeof props.exportId === "string" && props.exportId.length > 0) {
      lines.push(`Export ID: ${props.exportId}`);
    }
    if (typeof props.format === "string" && props.format.length > 0) {
      lines.push(`Format: ${props.format}`);
    }
    if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
      lines.push(`File size: ${props.fileSize}`);
    }
    if (typeof props.itemCount === "string" && props.itemCount.length > 0) {
      lines.push(`Items: ${props.itemCount}`);
    }
    if (
      typeof props.requestedAt === "string" &&
      props.requestedAt.length > 0
    ) {
      lines.push(`Requested: ${props.requestedAt}`);
    }
    if (
      typeof props.completedAt === "string" &&
      props.completedAt.length > 0
    ) {
      lines.push(`Completed: ${props.completedAt}`);
    }
    if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
      lines.push(`Link expires: ${props.expiresAt}`);
    }
    lines.push("");
    lines.push(`Download export: ${props.downloadUrl}`);
    lines.push("");

    if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
      lines.push(
        `This link expires on ${props.expiresAt}. After that the archive is purged from our servers and you'll need to request a fresh export.`,
      );
      lines.push("");
    }

    lines.push(
      `Didn't request this export? Let us know at ${supportEmail} — the link can be revoked immediately and we'll review your account activity.`,
    );

    return lines.join("\n");
  }
}

export default DataExportReady;
