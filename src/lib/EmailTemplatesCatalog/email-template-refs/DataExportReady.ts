import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import type {
  DataExportContentsEntry,
  DataExportReadyEmailProps,
} from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Data-export-ready email sent when a user's requested account data export (GDPR/CCPA data portability, account archive, audit-log dump) has finished packaging and is available to download. Uses the configured brand gradient header, a teal 'Export complete' panel mirroring the theme's `--chart-3` token with the archive file name and size/file-count/format summary, a primary download CTA with a visible fallback link, an amber link-expiration notice mirroring the theme's `--warning` token, an optional 'What's included' dataset table, an export-details metadata table (export ID, requested/completed timestamps, data range, format, size, file count, expiry), an optional monospace SHA-256 checksum block for integrity verification, a do-not-forward security note, and optional links to request another export and to the privacy policy. Props: { downloadUrl: string, recipientName?: string, exportId?: string, requestedAt?: string, completedAt?: string, expiresAt?: string, fileName?: string, fileFormat?: string, fileSize?: string, fileCount?: number, dataRangeStart?: string, dataRangeEnd?: string, checksumSha256?: string, contents?: Array<{ label: string, detail?: string }>, requestAnotherExportUrl?: string, privacyPolicyUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

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
      const value = (val as Record<string, unknown>)[key];
      if (typeof value !== "string") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected prop '${key}' to be a string, but got ${typeof value}.`,
        );
      }
      if (value.length === 0) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected prop '${key}' to be a non-empty string.`,
        );
      }
    }
    const optionalStringKeys: readonly (keyof DataExportReadyEmailProps)[] = [
      "recipientName",
      "exportId",
      "requestedAt",
      "completedAt",
      "expiresAt",
      "fileName",
      "fileFormat",
      "fileSize",
      "dataRangeStart",
      "dataRangeEnd",
      "checksumSha256",
      "requestAnotherExportUrl",
      "privacyPolicyUrl",
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
    if ("fileCount" in val && typeof val.fileCount !== "undefined") {
      if (typeof val.fileCount !== "number") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'fileCount' to be a number when provided, but got ${typeof val.fileCount}.`,
        );
      }
      if (!Number.isFinite(val.fileCount)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'fileCount' to be a finite number, but got ${val.fileCount}.`,
        );
      }
      if (val.fileCount < 0) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'fileCount' to be non-negative, but got ${val.fileCount}.`,
        );
      }
    }
    if ("contents" in val && typeof val.contents !== "undefined") {
      if (!Array.isArray(val.contents)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'contents' to be an array of {label,detail?} when provided, but got ${typeof val.contents}.`,
        );
      }
      for (let i = 0; i < val.contents.length; i++) {
        const entry: unknown = val.contents[i];
        if (typeof entry !== "object" || entry === null) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'contents[${i}]' to be an object, but got ${entry === null ? "null" : typeof entry}.`,
          );
        }
        const label = (entry as Record<string, unknown>).label;
        if (typeof label !== "string" || label.length === 0) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'contents[${i}].label' to be a non-empty string.`,
          );
        }
        const detail = (entry as Record<string, unknown>).detail;
        if (typeof detail !== "undefined" && typeof detail !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'contents[${i}].detail' to be a string when provided, but got ${typeof detail}.`,
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
    const nonEmpty = (value: unknown): string | undefined =>
      typeof value === "string" && value.length > 0 ? value : undefined;

    const productName: string =
      nonEmpty(props.productName) ?? brand.productName;
    const supportEmail: string =
      nonEmpty(props.supportEmail) ?? brand.supportEmail;
    const greetingName: string = nonEmpty(props.recipientName) ?? "there";

    const fileName: string | undefined = nonEmpty(props.fileName);
    const fileFormat: string | undefined = nonEmpty(props.fileFormat);
    const fileSize: string | undefined = nonEmpty(props.fileSize);
    const fileCount: number | undefined =
      typeof props.fileCount === "number" && Number.isFinite(props.fileCount)
        ? props.fileCount
        : undefined;
    const exportId: string | undefined = nonEmpty(props.exportId);
    const expiresAt: string | undefined = nonEmpty(props.expiresAt);
    const dataRangeStart: string | undefined = nonEmpty(props.dataRangeStart);
    const dataRangeEnd: string | undefined = nonEmpty(props.dataRangeEnd);
    const requestAnotherExportUrl: string | undefined = nonEmpty(
      props.requestAnotherExportUrl,
    );
    const privacyPolicyUrl: string | undefined = nonEmpty(
      props.privacyPolicyUrl,
    );
    const contents: DataExportContentsEntry[] = Array.isArray(props.contents)
      ? props.contents
      : [];

    const archiveSummary: string = [
      fileSize,
      typeof fileCount === "number"
        ? `${fileCount.toLocaleString("en-US")} ${fileCount === 1 ? "file" : "files"}`
        : undefined,
      fileFormat,
    ]
      .filter((part): part is string => typeof part === "string")
      .join(" · ");

    const lines: string[] = [
      `Your ${productName} data export is ready.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We finished packaging the ${productName} data you asked us to export. Use the link below to download the archive${expiresAt ? " before the link expires" : ""}.`,
      "",
      "EXPORT COMPLETE",
    ];

    lines.push(`  ${fileName ?? "Your archive is ready to download."}`);
    if (archiveSummary.length > 0) {
      lines.push(`  ${archiveSummary}`);
    }
    lines.push("");
    lines.push(`Download export: ${props.downloadUrl}`);
    lines.push("");

    if (expiresAt) {
      lines.push(`This link expires ${expiresAt}.`);
      lines.push(
        `After that the archive is deleted from our servers and the link stops working.${
          requestAnotherExportUrl
            ? " You can start a fresh export at any time."
            : " Request a new export if you still need the data."
        }`,
      );
      lines.push("");
    }

    if (contents.length > 0) {
      lines.push("What's included:");
      for (const entry of contents) {
        const detail: string | undefined = nonEmpty(entry.detail);
        lines.push(`  - ${entry.label}${detail ? ` — ${detail}` : ""}`);
      }
      lines.push("");
    }

    const detailLines: string[] = [];
    if (exportId) {
      detailLines.push(`Export ID: ${exportId}`);
    }
    if (nonEmpty(props.requestedAt)) {
      detailLines.push(`Requested: ${props.requestedAt}`);
    }
    if (nonEmpty(props.completedAt)) {
      detailLines.push(`Completed: ${props.completedAt}`);
    }
    if (dataRangeStart && dataRangeEnd) {
      detailLines.push(`Data range: ${dataRangeStart} - ${dataRangeEnd}`);
    } else if (dataRangeStart ?? dataRangeEnd) {
      detailLines.push(`Data range: ${dataRangeStart ?? dataRangeEnd}`);
    }
    if (fileFormat) {
      detailLines.push(`Format: ${fileFormat}`);
    }
    if (fileSize) {
      detailLines.push(`Size: ${fileSize}`);
    }
    if (typeof fileCount === "number") {
      detailLines.push(`Files: ${fileCount.toLocaleString("en-US")}`);
    }
    if (expiresAt) {
      detailLines.push(`Link expires: ${expiresAt}`);
    }
    if (detailLines.length > 0) {
      lines.push("Export details:");
      for (const detailLine of detailLines) {
        lines.push(`  ${detailLine}`);
      }
      lines.push("");
    }

    const checksumSha256: string | undefined = nonEmpty(props.checksumSha256);
    if (checksumSha256) {
      lines.push(`SHA-256 checksum: ${checksumSha256}`);
      lines.push("");
    }

    lines.push(
      "This download link is tied to your export request and should be treated like a password — anyone who has it can download your data, so please don't forward this email.",
    );
    lines.push("");

    if (requestAnotherExportUrl) {
      lines.push(`Request another export: ${requestAnotherExportUrl}`);
    }
    if (privacyPolicyUrl) {
      lines.push(`How we handle your data: ${privacyPolicyUrl}`);
    }
    if (requestAnotherExportUrl || privacyPolicyUrl) {
      lines.push("");
    }

    lines.push(
      `Didn't request an export? Please contact us right away at ${supportEmail}${
        exportId ? ` and quote export ID ${exportId}` : ""
      }.`,
    );

    return lines.join("\n");
  }
}

export default DataExportReady;
