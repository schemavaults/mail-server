import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "GDPR/CCPA data-portability email sent when a user-requested account data export has finished processing. Uses the SchemaVaults brand gradient header, an 'About this export' callout describing what's included, a metadata table (requested time, format, size, link expiration), a primary download CTA with a visible fallback link, and an amber warning panel reminding the recipient that the link grants access to their data and should not be shared. Props: { downloadUrl: string, expiresAt: string, recipientName?: string, fileSize?: string, fileFormat?: string, requestedAt?: string, exportScope?: string, manageAccountUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

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
      "fileSize",
      "fileFormat",
      "requestedAt",
      "exportScope",
      "manageAccountUrl",
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

    const lines: string[] = [
      `Your ${productName} data export is ready to download.`,
      "",
      `Hi ${greetingName},`,
      "",
      `The export of your ${productName} data you requested has finished processing and is ready to download. Use the secure link below to retrieve your archive.`,
      "",
    ];

    if (
      typeof props.exportScope === "string" &&
      props.exportScope.length > 0
    ) {
      lines.push("What's included:");
      lines.push(`  ${props.exportScope}`);
      lines.push("");
    }

    if (
      typeof props.requestedAt === "string" &&
      props.requestedAt.length > 0
    ) {
      lines.push(`Requested: ${props.requestedAt}`);
    }
    if (
      typeof props.fileFormat === "string" &&
      props.fileFormat.length > 0
    ) {
      lines.push(`Format: ${props.fileFormat}`);
    }
    if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
      lines.push(`Size: ${props.fileSize}`);
    }
    lines.push(`Link expires: ${props.expiresAt}`);
    lines.push("");
    lines.push(`Download your archive: ${props.downloadUrl}`);
    lines.push("");
    lines.push(
      `Keep your export private: this archive contains data from your account. Anyone with the download link can read it, so do not share or forward this email. The link expires on ${props.expiresAt}; after that you'll need to request a new export.`,
    );
    lines.push("");
    if (
      typeof props.manageAccountUrl === "string" &&
      props.manageAccountUrl.length > 0
    ) {
      lines.push(
        `Didn't request this export? Review your account activity at ${props.manageAccountUrl} and then contact us at ${supportEmail}.`,
      );
    } else {
      lines.push(
        `Didn't request this export? Contact us right away at ${supportEmail}.`,
      );
    }

    return lines.join("\n");
  }
}

export default DataExportReady;
