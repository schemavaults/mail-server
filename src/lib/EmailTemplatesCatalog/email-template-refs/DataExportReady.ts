import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Notifies a user that a personal-data export they requested has finished processing and is ready to download. Uses the configured brand gradient header, a details panel with a 'Ready' chip and optional format/size/item-count rows, a primary download CTA with a visible fallback link, an amber expiration callout when either expiresAt or expiresInLabel is provided, a 'keep this link private' security notice, and a 'didn't request this?' escalation footer. Props: { downloadUrl: string, recipientName?: string, exportName?: string, exportDescription?: string, fileFormat?: string, fileSize?: string, itemCount?: string, expiresAt?: string, expiresInLabel?: string, requestedAt?: string, ctaLabel?: string, previewText?: string, productName?: string, supportEmail?: string }" as const satisfies string;

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
      "recipientName",
      "exportName",
      "exportDescription",
      "fileFormat",
      "fileSize",
      "itemCount",
      "expiresAt",
      "expiresInLabel",
      "requestedAt",
      "ctaLabel",
      "previewText",
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
    const brand = getEmailBrand();
    const productName: string =
      typeof props.productName === "string" && props.productName.length > 0
        ? props.productName
        : brand.productName;
    const supportEmail: string =
      typeof props.supportEmail === "string" && props.supportEmail.length > 0
        ? props.supportEmail
        : brand.supportEmail;
    const greetingName: string =
      typeof props.recipientName === "string" && props.recipientName.length > 0
        ? props.recipientName
        : "there";
    const exportName: string =
      typeof props.exportName === "string" && props.exportName.length > 0
        ? props.exportName
        : "Your data export";
    const exportDescription: string =
      typeof props.exportDescription === "string" &&
      props.exportDescription.length > 0
        ? props.exportDescription
        : `We've finished preparing your data export. You can download the archive using the link below.`;
    const ctaLabel: string =
      typeof props.ctaLabel === "string" && props.ctaLabel.length > 0
        ? props.ctaLabel
        : "Download export";

    const lines: string[] = [
      `${exportName} is ready`,
      "",
      `Hi ${greetingName},`,
      "",
      exportDescription,
      "",
      `${ctaLabel}: ${props.downloadUrl}`,
    ];

    const detailRows: string[] = [];
    if (
      typeof props.fileFormat === "string" &&
      props.fileFormat.length > 0
    ) {
      detailRows.push(`  Format: ${props.fileFormat}`);
    }
    if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
      detailRows.push(`  Size: ${props.fileSize}`);
    }
    if (typeof props.itemCount === "string" && props.itemCount.length > 0) {
      detailRows.push(`  Contents: ${props.itemCount}`);
    }
    if (
      typeof props.requestedAt === "string" &&
      props.requestedAt.length > 0
    ) {
      detailRows.push(`  Requested: ${props.requestedAt}`);
    }
    if (detailRows.length > 0) {
      lines.push("");
      lines.push("Details:");
      lines.push(...detailRows);
    }

    if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
      lines.push("");
      lines.push(
        `For your security, this download link expires on ${props.expiresAt}.`,
      );
    } else if (
      typeof props.expiresInLabel === "string" &&
      props.expiresInLabel.length > 0
    ) {
      lines.push("");
      lines.push(
        `For your security, this download link expires in ${props.expiresInLabel}.`,
      );
    }

    lines.push("");
    lines.push(
      "Keep this link private — anyone with it can download the archive.",
    );

    lines.push("");
    lines.push(
      `Didn't request this export? Please contact us right away at ${supportEmail}.`,
    );

    lines.push("");
    lines.push(
      `You are receiving this email because you requested a data export from your ${productName} account.`,
    );

    return lines.join("\n");
  }
}

export default DataExportReady;
