import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Data export / account download ready email sent when a user's requested data archive has finished building (GDPR Art. 15/20 data portability, 'download your data' flows). Uses the configured brand gradient header, an 'Export complete' badge over a metadata panel (format, size, file count, account, requested by/when, link expiry), a primary download CTA with a visible fallback link, an amber link-expiry callout, a checklist of the data categories inside the archive, and a 'treat this like a password / didn't request this?' security footer. Props: { downloadUrl: string, name?: string, accountName?: string, requestedByEmail?: string, requestedAt?: string, expiresAt?: string, expiresIn?: string, exportFormat?: string, fileSize?: string, fileCount?: string, includedData?: string[], manageDataUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

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
      "name",
      "accountName",
      "requestedByEmail",
      "requestedAt",
      "expiresAt",
      "expiresIn",
      "exportFormat",
      "fileSize",
      "fileCount",
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
      "includedData" in val &&
      typeof (val as Record<string, unknown>)["includedData"] !== "undefined"
    ) {
      const includedData: unknown = (val as Record<string, unknown>)[
        "includedData"
      ];
      if (!Array.isArray(includedData)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'includedData' to be an array of strings when provided, but got ${typeof includedData}.`,
        );
      }
      for (let index = 0; index < includedData.length; index++) {
        if (typeof includedData[index] !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'includedData[${index}]' to be a string, but got ${typeof includedData[index]}.`,
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
    const manageDataUrl: string =
      typeof props.manageDataUrl === "string" && props.manageDataUrl.length > 0
        ? props.manageDataUrl
        : `${brand.url}/account/data`;
    const greetingName: string =
      typeof props.name === "string" && props.name.length > 0
        ? props.name
        : "there";
    const subjectLabel: string =
      typeof props.accountName === "string" && props.accountName.length > 0
        ? props.accountName
        : productName;
    const includedData: string[] = Array.isArray(props.includedData)
      ? props.includedData.filter(
          (entry): entry is string =>
            typeof entry === "string" && entry.length > 0,
        )
      : [];

    const lines: string[] = [
      `Your ${subjectLabel} data export is ready to download.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We finished packaging the data you requested from ${subjectLabel}. Download the archive below to keep a copy of your information.`,
      "",
    ];

    if (
      typeof props.exportFormat === "string" &&
      props.exportFormat.length > 0
    ) {
      lines.push(`Format: ${props.exportFormat}`);
    }
    if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
      lines.push(`Size: ${props.fileSize}`);
    }
    if (typeof props.fileCount === "string" && props.fileCount.length > 0) {
      lines.push(`Files: ${props.fileCount}`);
    }
    if (typeof props.accountName === "string" && props.accountName.length > 0) {
      lines.push(`Account: ${props.accountName}`);
    }
    if (typeof props.requestedAt === "string" && props.requestedAt.length > 0) {
      lines.push(`Requested: ${props.requestedAt}`);
    }
    if (
      typeof props.requestedByEmail === "string" &&
      props.requestedByEmail.length > 0
    ) {
      lines.push(`Requested by: ${props.requestedByEmail}`);
    }
    if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
      lines.push(`Link expires: ${props.expiresAt}`);
    }
    lines.push("");

    lines.push(`Download your data: ${props.downloadUrl}`);
    lines.push("");

    if (typeof props.expiresIn === "string" && props.expiresIn.length > 0) {
      lines.push(
        `This download link works for the next ${props.expiresIn}. After that you'll need to request a new export.`,
      );
    } else if (
      typeof props.expiresAt === "string" &&
      props.expiresAt.length > 0
    ) {
      lines.push(
        `This download link stops working on ${props.expiresAt}. After that you'll need to request a new export.`,
      );
    } else {
      lines.push(
        "This download link is only available for a limited time. After that you'll need to request a new export.",
      );
    }
    lines.push("");

    if (includedData.length > 0) {
      lines.push("What's inside:");
      for (const entry of includedData) {
        lines.push(`  - ${entry}`);
      }
      lines.push("");
    }

    lines.push(
      "Treat this archive like a password — it contains your personal data. Anyone with the link can download it, so don't forward this email.",
    );
    lines.push("");
    lines.push(
      `Didn't request this export? Review your account's data and privacy settings at ${manageDataUrl}.`,
    );
    lines.push(`Questions? Reach us at ${supportEmail}.`);

    return lines.join("\n");
  }
}

export default DataExportReady;
