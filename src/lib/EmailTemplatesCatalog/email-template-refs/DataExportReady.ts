import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Data export ready email sent when a user-initiated data export (schemas, vault contents, audit logs, GDPR data dump, etc.) has finished generating and is available to download. Uses SchemaVaults brand gradient header, a green 'Export complete' success callout summarizing the artifact, a metadata table (format, size, record count, generated time, requesting IP/location), a primary download CTA with a visible fallback link, an amber expiration warning, and a security panel reminding the user we never attach exports directly to email. Props: { downloadUrl: string, userName?: string, exportName?: string, fileFormat?: string, fileSize?: string, recordCount?: string, generatedAt?: string, expiresAt?: string, requestedFromIp?: string, requestedFromLocation?: string, productName?: string, supportEmail?: string }" as const satisfies string;

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
      "userName",
      "exportName",
      "fileFormat",
      "fileSize",
      "recordCount",
      "generatedAt",
      "expiresAt",
      "requestedFromIp",
      "requestedFromLocation",
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
      typeof props.userName === "string" && props.userName.length > 0
        ? props.userName
        : "there";
    const exportName: string =
      typeof props.exportName === "string" && props.exportName.length > 0
        ? props.exportName
        : "Your data export";

    const lines: string[] = [
      `${exportName} is ready to download from ${productName}.`,
      "",
      `Hi ${greetingName},`,
      "",
      `${exportName} finished generating and is ready to download. The link below is signed to your account — keep it private.`,
      "",
    ];

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
      typeof props.recordCount === "string" &&
      props.recordCount.length > 0
    ) {
      lines.push(`Records: ${props.recordCount}`);
    }
    if (
      typeof props.generatedAt === "string" &&
      props.generatedAt.length > 0
    ) {
      lines.push(`Generated: ${props.generatedAt}`);
    }
    const requestedFrom: string = [
      typeof props.requestedFromIp === "string" &&
      props.requestedFromIp.length > 0
        ? props.requestedFromIp
        : "",
      typeof props.requestedFromLocation === "string" &&
      props.requestedFromLocation.length > 0
        ? props.requestedFromLocation
        : "",
    ]
      .filter((v) => v.length > 0)
      .join(" · ");
    if (requestedFrom.length > 0) {
      lines.push(`Requested from: ${requestedFrom}`);
    }
    lines.push("");
    lines.push(`Download: ${props.downloadUrl}`);
    if (
      typeof props.expiresAt === "string" &&
      props.expiresAt.length > 0
    ) {
      lines.push("");
      lines.push(
        `This link expires ${props.expiresAt}. After that you'll need to start a new export from your dashboard.`,
      );
    }
    lines.push("");
    lines.push(
      "Didn't request this? If you didn't start this export, someone else may have access to your account. Rotate your password and review active sessions from the dashboard.",
    );
    lines.push("");
    lines.push(
      "For your security, this download link is single-use per session and tied to the account that requested it. We never attach exports directly to email.",
    );
    lines.push("");
    lines.push(`Questions? Reach us at ${supportEmail}.`);

    return lines.join("\n");
  }
}

export default DataExportReady;
