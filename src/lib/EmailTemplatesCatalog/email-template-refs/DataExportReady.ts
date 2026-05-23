import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Notification email sent when a user-requested data export has finished processing and is ready to download. Uses the SchemaVaults brand gradient header, a metadata table (scope, format, size, item count, requested time, expiry, export id), a primary CTA to download the archive with a copy-to-clipboard fallback link, an amber 'treat this file as sensitive' notice, optional request-details panel (requested time, IP, location), and a security warning footer for unrecognized requests. Use this for GDPR / data-portability flows where the export is generated asynchronously and emailed when ready. Props: { downloadUrl: string, expiresAt: string, userName?: string, exportId?: string, fileFormat?: string, fileSizeBytes?: number, itemCount?: number, scope?: string, requestedAt?: string, ipAddress?: string, location?: string, manageDataUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

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
      "userName",
      "exportId",
      "fileFormat",
      "scope",
      "requestedAt",
      "ipAddress",
      "location",
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
    const optionalNumberKeys: readonly (keyof DataExportReadyEmailProps)[] = [
      "fileSizeBytes",
      "itemCount",
    ];
    for (const key of optionalNumberKeys) {
      if (
        key in val &&
        typeof (val as Record<string, unknown>)[key] !== "undefined"
      ) {
        const v = (val as Record<string, unknown>)[key];
        if (typeof v !== "number" || !Number.isFinite(v)) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected optional prop '${key}' to be a finite number when provided, but got ${typeof v}.`,
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
    const fileFormat: string =
      typeof props.fileFormat === "string" && props.fileFormat.length > 0
        ? props.fileFormat
        : "ZIP";

    const lines: string[] = [
      `Your ${productName} data export is ready to download.`,
      "",
      `Hi ${greetingName},`,
      "",
      `The data export you requested from ${productName} has finished processing and is ready to download. For your security, the link below is private to you and will expire on ${props.expiresAt}.`,
      "",
    ];

    if (typeof props.scope === "string" && props.scope.length > 0) {
      lines.push(`Scope: ${props.scope}`);
    }
    lines.push(`Format: ${fileFormat}`);
    if (
      typeof props.fileSizeBytes === "number" &&
      Number.isFinite(props.fileSizeBytes)
    ) {
      const bytes = props.fileSizeBytes;
      let label: string;
      if (bytes < 1024) {
        label = `${bytes} B`;
      } else {
        const units = ["KB", "MB", "GB", "TB"];
        let value = bytes / 1024;
        let i = 0;
        while (value >= 1024 && i < units.length - 1) {
          value /= 1024;
          i += 1;
        }
        label = `${value.toFixed(value >= 10 ? 0 : 1)} ${units[i]}`;
      }
      lines.push(`Size: ${label}`);
    }
    if (
      typeof props.itemCount === "number" &&
      Number.isFinite(props.itemCount)
    ) {
      lines.push(
        `Items: ${props.itemCount.toLocaleString("en-US")} item${props.itemCount === 1 ? "" : "s"}`,
      );
    }
    if (
      typeof props.requestedAt === "string" &&
      props.requestedAt.length > 0
    ) {
      lines.push(`Requested: ${props.requestedAt}`);
    }
    lines.push(`Expires: ${props.expiresAt}`);
    if (typeof props.exportId === "string" && props.exportId.length > 0) {
      lines.push(`Export ID: ${props.exportId}`);
    }
    lines.push("");
    lines.push(`Download export: ${props.downloadUrl}`);
    lines.push("");
    lines.push(
      "Treat this file as sensitive. The archive contains a copy of your account data — store it somewhere private and delete it when you're done. We can't recover the file once the link expires.",
    );

    const requestDetailParts: string[] = [];
    if (
      typeof props.requestedAt === "string" &&
      props.requestedAt.length > 0
    ) {
      requestDetailParts.push(`Requested ${props.requestedAt}`);
    }
    if (typeof props.ipAddress === "string" && props.ipAddress.length > 0) {
      requestDetailParts.push(`IP ${props.ipAddress}`);
    }
    if (typeof props.location === "string" && props.location.length > 0) {
      requestDetailParts.push(props.location);
    }
    if (requestDetailParts.length > 0) {
      lines.push("");
      lines.push(`Request details: ${requestDetailParts.join(" · ")}`);
    }

    if (
      typeof props.manageDataUrl === "string" &&
      props.manageDataUrl.length > 0
    ) {
      lines.push("");
      lines.push(
        `Manage your data and privacy settings: ${props.manageDataUrl}`,
      );
    }

    lines.push("");
    lines.push(
      `Didn't request this export? Please contact us right away at ${supportEmail} — someone may be attempting to access your account.`,
    );

    return lines.join("\n");
  }
}

export default DataExportReady;
