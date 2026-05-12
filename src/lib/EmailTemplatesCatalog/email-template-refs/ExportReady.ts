import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { ExportReadyEmailProps } from "@/email-templates/export-ready";

export class ExportReady extends EmailTemplatesCatalogEntry<ExportReadyEmailProps> {
  public id = "export-ready" as const satisfies string;

  public description =
    "Notification email sent when a user-requested data export has finished processing and is ready to download. Uses the SchemaVaults brand-blue gradient header, an emerald 'Export complete' success callout, a metadata panel (scope, contents, format, file size, requested/ready timestamps), a primary emerald download CTA with a visible fallback link, and an optional amber expiration warning. Props: { downloadUrl: string, recipientName?: string, exportLabel?: string, exportScope?: string, requestedAt?: string, readyAt?: string, expiresAt?: string, fileSize?: string, fileFormat?: string, itemSummary?: string, manageExportsUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is ExportReadyEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof ExportReadyEmailProps)[] = [
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
    const optionalStringKeys: readonly (keyof ExportReadyEmailProps)[] = [
      "recipientName",
      "exportLabel",
      "exportScope",
      "requestedAt",
      "readyAt",
      "expiresAt",
      "fileSize",
      "fileFormat",
      "itemSummary",
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

  public async loadReactEmailTemplate(): Promise<FC<ExportReadyEmailProps>> {
    const component = await import("@/email-templates/export-ready").then(
      (mod) => mod.default,
    );
    return component;
  }

  public async renderPlainTextVersion(
    props: ExportReadyEmailProps,
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
    const exportLabel: string =
      typeof props.exportLabel === "string" && props.exportLabel.length > 0
        ? props.exportLabel
        : "Your data export";

    const lines: string[] = [
      `${exportLabel} is ready to download.`,
      "",
      `Hi ${greetingName},`,
      "",
      `The data export you requested from ${productName} has finished processing and is ready to download.`,
      "",
    ];

    if (
      typeof props.exportScope === "string" &&
      props.exportScope.length > 0
    ) {
      lines.push(`Scope: ${props.exportScope}`);
    }
    if (
      typeof props.itemSummary === "string" &&
      props.itemSummary.length > 0
    ) {
      lines.push(`Contents: ${props.itemSummary}`);
    }
    if (
      typeof props.fileFormat === "string" &&
      props.fileFormat.length > 0
    ) {
      lines.push(`Format: ${props.fileFormat}`);
    }
    if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
      lines.push(`File size: ${props.fileSize}`);
    }
    if (
      typeof props.requestedAt === "string" &&
      props.requestedAt.length > 0
    ) {
      lines.push(`Requested: ${props.requestedAt}`);
    }
    if (typeof props.readyAt === "string" && props.readyAt.length > 0) {
      lines.push(`Ready: ${props.readyAt}`);
    }

    lines.push("");
    lines.push(`Download: ${props.downloadUrl}`);

    if (
      typeof props.manageExportsUrl === "string" &&
      props.manageExportsUrl.length > 0
    ) {
      lines.push(`View all exports: ${props.manageExportsUrl}`);
    }

    if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
      lines.push("");
      lines.push(
        `Link expires ${props.expiresAt}. After expiration, your archive will be deleted from our servers.`,
      );
    }

    lines.push("");
    lines.push(
      `Didn't request this export? Reach out to ${supportEmail} right away — someone with access to your account may have triggered it.`,
    );

    return lines.join("\n");
  }
}

export default ExportReady;
