import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Data-portability email sent when a user's requested account/data export has finished packaging and is ready to download. Features a gradient header in the configured brand colors, an emerald 'export summary' panel (format, size, record count, requested/completed timestamps), a primary download CTA with a copy-paste fallback URL, an amber link-expiry warning, a checklist of the datasets included in the archive, an optional link to the product's privacy & data settings, and a 'didn't request this' security footer. Props: { downloadUrl: string, recipientName?: string, exportName?: string, requestedAt?: string, completedAt?: string, expiresAt?: string, fileFormat?: string, fileSize?: string, recordCount?: string, includedDatasets?: string[], manageDataUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is DataExportReadyEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    if (!("downloadUrl" in val)) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' is missing required prop 'downloadUrl' (expected string).`,
      );
    }
    if (typeof val.downloadUrl !== "string") {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected prop 'downloadUrl' to be a string, but got ${typeof val.downloadUrl}.`,
      );
    }
    const optionalStringKeys: readonly (keyof DataExportReadyEmailProps)[] = [
      "recipientName",
      "exportName",
      "requestedAt",
      "completedAt",
      "expiresAt",
      "fileFormat",
      "fileSize",
      "recordCount",
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
    if (
      "includedDatasets" in val &&
      typeof val.includedDatasets !== "undefined"
    ) {
      if (!Array.isArray(val.includedDatasets)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'includedDatasets' to be an array of strings when provided, but got ${typeof val.includedDatasets}.`,
        );
      }
      for (let i = 0; i < val.includedDatasets.length; i++) {
        if (typeof val.includedDatasets[i] !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected every entry of prop 'includedDatasets' to be a string, but entry at index ${i} is ${typeof val.includedDatasets[i]}.`,
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
    const brand = getEmailBrand();
    const productName: string =
      typeof props.productName === "string" && props.productName.length > 0
        ? props.productName
        : brand.productName;
    const supportEmail: string =
      typeof props.supportEmail === "string" && props.supportEmail.length > 0
        ? props.supportEmail
        : brand.supportEmail;
    const recipientName: string =
      typeof props.recipientName === "string" && props.recipientName.length > 0
        ? props.recipientName
        : "there";
    const exportName: string =
      typeof props.exportName === "string" && props.exportName.length > 0
        ? props.exportName
        : "Your data export";
    const includedDatasets: readonly string[] =
      Array.isArray(props.includedDatasets) && props.includedDatasets.length > 0
        ? props.includedDatasets
        : [
            "Account profile and settings",
            "Your projects and their contents",
            "Activity and audit history",
          ];

    const lines: string[] = [
      `${exportName} is ready to download from ${productName}.`,
      "",
      `Hi ${recipientName},`,
      "",
      `We finished packaging the data you asked ${productName} to export. The archive is waiting behind the private link below — it is tied to your account and should not be shared with anyone else.`,
      "",
      `Download your export: ${props.downloadUrl}`,
      "",
    ];

    const metaRows: Array<[string, string]> = [];
    if (typeof props.fileFormat === "string" && props.fileFormat.length > 0) {
      metaRows.push(["Format", props.fileFormat]);
    }
    if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
      metaRows.push(["Size", props.fileSize]);
    }
    if (typeof props.recordCount === "string" && props.recordCount.length > 0) {
      metaRows.push(["Contents", props.recordCount]);
    }
    if (typeof props.requestedAt === "string" && props.requestedAt.length > 0) {
      metaRows.push(["Requested", props.requestedAt]);
    }
    if (typeof props.completedAt === "string" && props.completedAt.length > 0) {
      metaRows.push(["Completed", props.completedAt]);
    }
    if (metaRows.length > 0) {
      lines.push("Export summary:");
      for (const [label, value] of metaRows) {
        lines.push(`  ${label}: ${value}`);
      }
      lines.push("");
    }

    if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
      lines.push(
        `This link expires ${props.expiresAt}. After that the archive is deleted from our servers and you'll need to request a new export.`,
      );
      lines.push("");
    }

    lines.push("What's inside:");
    for (const dataset of includedDatasets) {
      lines.push(`  - ${dataset}`);
    }
    lines.push("");

    if (
      typeof props.manageDataUrl === "string" &&
      props.manageDataUrl.length > 0
    ) {
      lines.push(
        `Manage what ${productName} stores about you — including deleting your account — from your privacy & data settings: ${props.manageDataUrl}`,
      );
      lines.push("");
    }

    lines.push(
      `Didn't request an export? Don't open the link — contact us right away at ${supportEmail} so we can secure your account.`,
    );

    return lines.join("\n");
  }
}

export default DataExportReady;
