import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Data-portability/GDPR-style email sent when a user's requested account data export has finished processing and is ready for download. Uses the configured brand gradient header, a green 'Ready to download' status callout, a metadata table (requested, format, size, expiration), a primary CTA to download the archive with a visible fallback link, and an amber expiration warning. Props: { name: string, downloadUrl: string, expiresAt: string, requestedAt?: string, fileFormat?: string, fileSize?: string, includesSummary?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is DataExportReadyEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof DataExportReadyEmailProps)[] = [
      "name",
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
      "requestedAt",
      "fileFormat",
      "fileSize",
      "includesSummary",
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

    const lines: string[] = [
      `Your ${productName} data export is ready.`,
      "",
      `Hi ${props.name},`,
      "",
      `The archive you requested from your ${productName} account has finished processing and is ready for you to download.`,
      "",
    ];

    if (
      typeof props.includesSummary === "string" &&
      props.includesSummary.length > 0
    ) {
      lines.push("What's inside:");
      lines.push(`  ${props.includesSummary}`);
      lines.push("");
    }

    if (
      typeof props.requestedAt === "string" &&
      props.requestedAt.length > 0
    ) {
      lines.push(`Requested: ${props.requestedAt}`);
    }
    if (typeof props.fileFormat === "string" && props.fileFormat.length > 0) {
      lines.push(`Format: ${props.fileFormat}`);
    }
    if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
      lines.push(`Size: ${props.fileSize}`);
    }
    lines.push(`Expires: ${props.expiresAt}`);
    lines.push("");
    lines.push(`Download your data: ${props.downloadUrl}`);
    lines.push("");
    lines.push(
      `For your security, the download link is only valid until ${props.expiresAt}. After that you'll need to request a new export from your account settings.`,
    );
    lines.push("");
    lines.push(
      `Didn't request this export? Please contact us right away at ${supportEmail} — someone else may have access to your account.`,
    );

    return lines.join("\n");
  }
}

export default DataExportReady;
