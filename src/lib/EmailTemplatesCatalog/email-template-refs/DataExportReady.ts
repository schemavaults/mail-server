import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Transactional email sent when a user's data export has finished processing and is ready to download. Uses the SchemaVaults brand gradient header, an 'Export details' callout (format, item count, file size, timestamps), a primary download CTA with a visible fallback link, an amber warning callout advising when the signed link expires, and a security footer pointing 'Didn't request this?' recipients at support. Props: { downloadUrl: string, userName?: string, exportName?: string, exportFormat?: string, fileSize?: string, itemCount?: string, requestedAt?: string, readyAt?: string, expiresAt?: string, expiresInHours?: string, manageExportsUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

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
      "exportName",
      "exportFormat",
      "fileSize",
      "itemCount",
      "requestedAt",
      "readyAt",
      "expiresAt",
      "expiresInHours",
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
    const exportName: string =
      typeof props.exportName === "string" && props.exportName.length > 0
        ? props.exportName
        : "Your data export";

    const lines: string[] = [
      `${exportName} is ready to download from ${productName}.`,
      "",
      `Hi ${greetingName},`,
      "",
      `${exportName} has finished processing and is ready to download. The link below is a secure, single-use URL tied to your ${productName} account.`,
      "",
    ];

    const metaRows: Array<[string, string]> = [];
    if (
      typeof props.exportFormat === "string" &&
      props.exportFormat.length > 0
    ) {
      metaRows.push(["Format", props.exportFormat]);
    }
    if (typeof props.itemCount === "string" && props.itemCount.length > 0) {
      metaRows.push(["Items", props.itemCount]);
    }
    if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
      metaRows.push(["File size", props.fileSize]);
    }
    if (
      typeof props.requestedAt === "string" &&
      props.requestedAt.length > 0
    ) {
      metaRows.push(["Requested", props.requestedAt]);
    }
    if (typeof props.readyAt === "string" && props.readyAt.length > 0) {
      metaRows.push(["Ready", props.readyAt]);
    }
    if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
      metaRows.push(["Expires", props.expiresAt]);
    }
    if (metaRows.length > 0) {
      lines.push("Export details:");
      for (const [label, value] of metaRows) {
        lines.push(`  ${label}: ${value}`);
      }
      lines.push("");
    }

    lines.push(`Download: ${props.downloadUrl}`);
    lines.push("");

    if (
      (typeof props.expiresInHours === "string" &&
        props.expiresInHours.length > 0) ||
      (typeof props.expiresAt === "string" && props.expiresAt.length > 0)
    ) {
      const parts: string[] = ["Link expires soon —"];
      if (
        typeof props.expiresInHours === "string" &&
        props.expiresInHours.length > 0
      ) {
        parts.push(`this download link expires in ${props.expiresInHours}.`);
      }
      if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
        parts.push(`Access ends ${props.expiresAt}.`);
      }
      parts.push("After that, re-request the export from your account.");
      lines.push(parts.join(" "));
      lines.push("");
    }

    if (
      typeof props.manageExportsUrl === "string" &&
      props.manageExportsUrl.length > 0
    ) {
      lines.push(
        `Need to re-run this export or check the history? Visit your exports dashboard: ${props.manageExportsUrl}`,
      );
      lines.push("");
    }

    lines.push(
      `Didn't request this export? Contact ${supportEmail} right away — someone with access to your account may have generated it. Otherwise, questions? We're at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default DataExportReady;
