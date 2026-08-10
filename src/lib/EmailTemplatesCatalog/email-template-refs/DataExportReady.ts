import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "GDPR/CCPA-style data export notification sent when a user's requested account-data archive has finished generating and is available to download. Uses the configured brand gradient header, an optional 'What's inside' dataset callout, a metadata table (format, size, requested-at, link expiration), a primary 'Download my data' CTA with a copy-friendly fallback URL, an amber expiration warning, a privacy reminder, and a 'didn't request this?' account-security escalation. Props: { downloadUrl: string, recipientName?: string, requestedAt?: string, expiresAt?: string, fileFormat?: string, fileSize?: string, datasetSummary?: string, didNotRequestUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

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
      "requestedAt",
      "expiresAt",
      "fileFormat",
      "fileSize",
      "datasetSummary",
      "didNotRequestUrl",
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

    const lines: string[] = [
      `Your ${productName} data export is ready to download.`,
      "",
      `Hi ${greetingName},`,
      "",
      `The archive you requested from ${productName} has finished generating and is now available to download.`,
      "",
    ];

    if (
      typeof props.datasetSummary === "string" &&
      props.datasetSummary.length > 0
    ) {
      lines.push("What's inside:");
      lines.push(`  ${props.datasetSummary}`);
      lines.push("");
    }

    const metaRows: Array<[string, string]> = [];
    if (typeof props.fileFormat === "string" && props.fileFormat.length > 0) {
      metaRows.push(["Format", props.fileFormat]);
    }
    if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
      metaRows.push(["Size", props.fileSize]);
    }
    if (
      typeof props.requestedAt === "string" &&
      props.requestedAt.length > 0
    ) {
      metaRows.push(["Requested", props.requestedAt]);
    }
    if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
      metaRows.push(["Link expires", props.expiresAt]);
    }
    for (const [label, value] of metaRows) {
      lines.push(`${label}: ${value}`);
    }
    if (metaRows.length > 0) {
      lines.push("");
    }

    lines.push(`Download your data: ${props.downloadUrl}`);
    lines.push("");

    if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
      lines.push(
        `This link expires on ${props.expiresAt}. After that, you'll need to request a new export from your account settings.`,
      );
      lines.push("");
    }

    lines.push("Keep this archive private");
    lines.push(
      "This download link grants access to a full copy of your account data. Anyone with the link can open it, so don't share the URL and save the file somewhere only you can reach.",
    );
    lines.push("");

    if (
      typeof props.didNotRequestUrl === "string" &&
      props.didNotRequestUrl.length > 0
    ) {
      lines.push(
        `Didn't request this export? Secure your account (${props.didNotRequestUrl}) and let us know at ${supportEmail}.`,
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
