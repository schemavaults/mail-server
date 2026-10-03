import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Data export ready notification sent when an asynchronous account/data export finishes and a time-limited download link is available (the GDPR-style 'download your data' email, and the counterpart to the data-export link offered by 'subscription-cancelled'). Uses the brand accent gradient header with a 'link expires' pill, a monospace file card listing the archive name, format, size, record count, request/completion timestamps, expiry and export ID, a brand-accent download CTA with a copyable link fallback, an optional 'What's included' dataset list, a warning-toned link-expiry notice (the theme's --warning ramp), an optional SHA-256 checksum verification block rendered as a terminal command, an optional encrypted-archive note, an optional export-history link, and a security footer for unrequested exports. Props: { downloadUrl: string, expiresAt: string, recipientName?: string, exportId?: string, requestedAt?: string, completedAt?: string, fileName?: string, fileSize?: string, fileFormat?: string, recordCount?: number, checksumSha256?: string, includedDatasets?: string[], passwordProtected?: boolean, manageExportsUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

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
      "exportId",
      "requestedAt",
      "completedAt",
      "fileName",
      "fileSize",
      "fileFormat",
      "checksumSha256",
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
    if ("recordCount" in val && typeof val.recordCount !== "undefined") {
      if (typeof val.recordCount !== "number") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'recordCount' to be a number when provided, but got ${typeof val.recordCount}.`,
        );
      }
      if (!Number.isFinite(val.recordCount)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'recordCount' to be a finite number, but got ${val.recordCount}.`,
        );
      }
    }
    if (
      "passwordProtected" in val &&
      typeof val.passwordProtected !== "undefined" &&
      typeof val.passwordProtected !== "boolean"
    ) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected optional prop 'passwordProtected' to be a boolean when provided, but got ${typeof val.passwordProtected}.`,
      );
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
    const greetingName: string =
      typeof props.recipientName === "string" && props.recipientName.length > 0
        ? props.recipientName
        : "there";
    const fileName: string =
      typeof props.fileName === "string" && props.fileName.length > 0
        ? props.fileName
        : "data-export.zip";
    const recordCount: number | undefined =
      typeof props.recordCount === "number" &&
      Number.isFinite(props.recordCount)
        ? Math.max(0, Math.floor(props.recordCount))
        : undefined;
    const manageExportsUrl: string | undefined =
      typeof props.manageExportsUrl === "string" &&
      props.manageExportsUrl.length > 0
        ? props.manageExportsUrl
        : undefined;
    const includedDatasets: string[] = Array.isArray(props.includedDatasets)
      ? props.includedDatasets.filter(
          (item): item is string => typeof item === "string" && item.length > 0,
        )
      : [];

    const lines: string[] = [
      "Your data export is ready to download.",
      "",
      `Hi ${greetingName},`,
      "",
      `We've finished packaging the ${productName} data export you requested. Everything is bundled into a single archive that only you can download from the private link below.`,
      "",
      `File: ${fileName}`,
    ];

    if (typeof props.fileFormat === "string" && props.fileFormat.length > 0) {
      lines.push(`Format: ${props.fileFormat}`);
    }
    if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
      lines.push(`Size: ${props.fileSize}`);
    }
    if (typeof recordCount === "number") {
      lines.push(
        `Records: ${recordCount.toLocaleString("en-US")} record${
          recordCount === 1 ? "" : "s"
        }`,
      );
    }
    if (typeof props.requestedAt === "string" && props.requestedAt.length > 0) {
      lines.push(`Requested: ${props.requestedAt}`);
    }
    if (typeof props.completedAt === "string" && props.completedAt.length > 0) {
      lines.push(`Completed: ${props.completedAt}`);
    }
    lines.push(`Link expires: ${props.expiresAt}`);
    if (typeof props.exportId === "string" && props.exportId.length > 0) {
      lines.push(`Export ID: ${props.exportId}`);
    }
    lines.push("");

    lines.push(`Download export: ${props.downloadUrl}`);
    lines.push("");

    if (includedDatasets.length > 0) {
      lines.push("What's included:");
      for (const dataset of includedDatasets) {
        lines.push(`  - ${dataset}`);
      }
      lines.push("");
    }

    lines.push(
      `This link expires: for your security the download link stops working on ${props.expiresAt}, and the archive is deleted from our servers at the same time. Save the file somewhere safe before then${
        manageExportsUrl
          ? " — you can always request a fresh export afterwards."
          : " — you can always request a fresh export from your account settings afterwards."
      }`,
    );
    lines.push("");

    if (
      typeof props.checksumSha256 === "string" &&
      props.checksumSha256.length > 0
    ) {
      lines.push("Verify your download (SHA-256):");
      lines.push(`  shasum -a 256 ${fileName}`);
      lines.push(`  ${props.checksumSha256.replace(/\s+/g, "")}`);
      lines.push("");
    }

    if (props.passwordProtected === true) {
      lines.push(
        "This archive is encrypted. We never send the passphrase by email — it's shown once in your account when you start an export, so use the copy you saved then to open the file.",
      );
      lines.push("");
    }

    if (manageExportsUrl) {
      lines.push(
        `You can review past exports or start a new one from your export history: ${manageExportsUrl}`,
      );
      lines.push("");
    }

    lines.push(
      `Didn't request this export? Don't open the link — someone may have access to your account. Contact us right away at ${supportEmail} and we'll revoke the download and help you secure your account.`,
    );

    return lines.join("\n");
  }
}

export default DataExportReady;
