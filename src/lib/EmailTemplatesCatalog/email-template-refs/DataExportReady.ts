import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import { DATA_EXPORT_READY_DEFAULT_TITLE } from "@/email-templates/data-export-ready";
import type {
  DataExportIncludedDataset,
  DataExportReadyEmailProps,
} from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Data export ready notice telling a user the account/data export they requested has finished and can be downloaded. Renders the brand-accent hero, an 'Export complete' badge in the theme's green (--chart-3) palette, a download CTA plus copyable link, an amber expiry callout mirroring the theme --warning palette, an archive-details panel (file, format, size, records, requested, reference) and a 'What's inside' dataset table, closing with a don't-forward-this-link security note. Props: { downloadUrl: string, recipientName?: string, exportTitle?: string, summary?: string, requestedAt?: string, expiresAt?: string, fileName?: string, fileSizeLabel?: string, fileFormat?: string, recordCountLabel?: string, includedDatasets?: Array<{ name: string, detail?: string }>, referenceId?: string, productName?: string, supportEmail?: string }" as const satisfies string;

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
      "exportTitle",
      "summary",
      "requestedAt",
      "expiresAt",
      "fileName",
      "fileSizeLabel",
      "fileFormat",
      "recordCountLabel",
      "referenceId",
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
      typeof (val as Record<string, unknown>).includedDatasets !== "undefined"
    ) {
      const datasets = (val as Record<string, unknown>).includedDatasets;
      if (!Array.isArray(datasets)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'includedDatasets' to be an array when provided, but got ${typeof datasets}.`,
        );
      }
      datasets.forEach((dataset, idx) => {
        if (typeof dataset !== "object" || dataset === null) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'includedDatasets[${idx}]' to be an object, but got ${dataset === null ? "null" : typeof dataset}.`,
          );
        }
        const entry = dataset as Record<string, unknown>;
        if (typeof entry.name !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'includedDatasets[${idx}].name' to be a string, but got ${typeof entry.name}.`,
          );
        }
        if (
          "detail" in entry &&
          typeof entry.detail !== "undefined" &&
          typeof entry.detail !== "string"
        ) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'includedDatasets[${idx}].detail' to be a string when provided, but got ${typeof entry.detail}.`,
          );
        }
      });
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
    const exportTitle: string =
      typeof props.exportTitle === "string" && props.exportTitle.length > 0
        ? props.exportTitle
        : DATA_EXPORT_READY_DEFAULT_TITLE;
    const summary: string =
      typeof props.summary === "string" && props.summary.length > 0
        ? props.summary
        : `We finished packaging the data export you requested from ${productName}. Use the link below to download the archive — the link is private to you.`;

    const lines: string[] = [
      `${productName} — ${exportTitle}`,
      "",
      `Hi ${greetingName},`,
      "",
      summary,
      "",
      `Download your export: ${props.downloadUrl}`,
    ];

    if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
      lines.push("");
      lines.push(`This link expires ${props.expiresAt}.`);
      lines.push(
        "After that the archive is permanently deleted from our servers and you will need to request a new export.",
      );
    }

    const detailRows: Array<[string, string]> = [];
    if (typeof props.fileName === "string" && props.fileName.length > 0) {
      detailRows.push(["File", props.fileName]);
    }
    if (typeof props.fileFormat === "string" && props.fileFormat.length > 0) {
      detailRows.push(["Format", props.fileFormat]);
    }
    if (
      typeof props.fileSizeLabel === "string" &&
      props.fileSizeLabel.length > 0
    ) {
      detailRows.push(["Size", props.fileSizeLabel]);
    }
    if (
      typeof props.recordCountLabel === "string" &&
      props.recordCountLabel.length > 0
    ) {
      detailRows.push(["Records", props.recordCountLabel]);
    }
    if (typeof props.requestedAt === "string" && props.requestedAt.length > 0) {
      detailRows.push(["Requested", props.requestedAt]);
    }
    if (typeof props.referenceId === "string" && props.referenceId.length > 0) {
      detailRows.push(["Reference", props.referenceId]);
    }
    if (detailRows.length > 0) {
      lines.push("");
      lines.push("Archive details:");
      for (const [label, value] of detailRows) {
        lines.push(`  ${label}: ${value}`);
      }
    }

    const includedDatasets: DataExportIncludedDataset[] = Array.isArray(
      props.includedDatasets,
    )
      ? props.includedDatasets
      : [];
    if (includedDatasets.length > 0) {
      lines.push("");
      lines.push("What's inside:");
      for (const dataset of includedDatasets) {
        const detail: string =
          typeof dataset.detail === "string" && dataset.detail.length > 0
            ? dataset.detail
            : "Included";
        lines.push(`  - ${dataset.name}: ${detail}`);
      }
    }

    lines.push("");
    lines.push(
      "This download link is tied to your account and grants access to your data — please don't forward this email or share the link.",
    );
    lines.push(
      `Didn't request an export? Contact us right away at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default DataExportReady;
