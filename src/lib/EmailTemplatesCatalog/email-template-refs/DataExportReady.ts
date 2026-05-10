import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Notification email sent when a user-requested data export (e.g. account data, schemas bundle, GDPR archive) has finished generating and is ready to download. Uses SchemaVaults brand gradient header, a green 'Ready' status callout, a metadata table (format, size, record count, requested-at, link expiry), and a primary CTA to download with a visible fallback link plus an unauthorized-request warning. Props: { downloadUrl: string, expiresAt: string, recipientName?: string, exportType?: string, fileFormat?: string, fileSize?: string, recordCount?: string, requestedAt?: string, productName?: string, supportEmail?: string }" as const satisfies string;

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
      "exportType",
      "fileFormat",
      "fileSize",
      "recordCount",
      "requestedAt",
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
    const productName: string =
      typeof props.productName === "string" && props.productName.length > 0
        ? props.productName
        : "SchemaVaults";
    const supportEmail: string =
      typeof props.supportEmail === "string" && props.supportEmail.length > 0
        ? props.supportEmail
        : "support@schemavaults.com";
    const greetingName: string =
      typeof props.recipientName === "string" &&
      props.recipientName.length > 0
        ? props.recipientName
        : "there";
    const exportType: string =
      typeof props.exportType === "string" && props.exportType.length > 0
        ? props.exportType
        : "data export";

    const lines: string[] = [
      `Your ${exportType} from ${productName} is ready to download.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We've finished preparing the ${exportType} you requested from ${productName}. Use the link below to download it before it expires.`,
      "",
      "Status: Ready",
      "",
    ];

    if (
      typeof props.fileFormat === "string" &&
      props.fileFormat.length > 0
    ) {
      lines.push(`Format: ${props.fileFormat}`);
    }
    if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
      lines.push(`Size: ${props.fileSize}`);
    }
    if (
      typeof props.recordCount === "string" &&
      props.recordCount.length > 0
    ) {
      lines.push(`Records: ${props.recordCount}`);
    }
    if (
      typeof props.requestedAt === "string" &&
      props.requestedAt.length > 0
    ) {
      lines.push(`Requested: ${props.requestedAt}`);
    }
    lines.push(`Link expires: ${props.expiresAt}`);
    lines.push("");
    lines.push(`Download: ${props.downloadUrl}`);
    lines.push("");
    lines.push(
      `For your security, this download link expires on ${props.expiresAt}. After that, you'll need to request a new export from your account settings.`,
    );
    lines.push("");
    lines.push(
      `Didn't request this export? Please contact us at ${supportEmail} right away — someone may be using your account.`,
    );

    return lines.join("\n");
  }
}

export default DataExportReady;
