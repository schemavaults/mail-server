import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { DataExportReadyEmailProps } from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Data export ready email sent when a user's requested data archive (account export, GDPR/CCPA data package, schema/vault backup) has finished processing and is available for download. Includes brand gradient header, a metadata table (export name, format, file size, record count, requested time, expiration), a primary download CTA with a visible fallback link, an optional 'password protected' notice, and a link-hygiene reminder. Props: { downloadUrl: string, expiresAt: string, userName?: string, exportName?: string, format?: string, fileSize?: string, itemCount?: string, requestedAt?: string, passwordProtected?: boolean, productName?: string, supportEmail?: string }" as const satisfies string;

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
      "userName",
      "exportName",
      "format",
      "fileSize",
      "itemCount",
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
    if (
      "passwordProtected" in val &&
      typeof (val as Record<string, unknown>)["passwordProtected"] !==
        "undefined" &&
      typeof (val as Record<string, unknown>)["passwordProtected"] !== "boolean"
    ) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected optional prop 'passwordProtected' to be a boolean when provided, but got ${typeof (val as Record<string, unknown>)["passwordProtected"]}.`,
      );
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

    const lines: string[] = [
      `Your data export is ready to download from ${productName}.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We've finished preparing the data export you requested from ${productName}. Download it using the link below — it's tied to your account and expires on ${props.expiresAt}.`,
      "",
    ];

    if (
      typeof props.exportName === "string" &&
      props.exportName.length > 0
    ) {
      lines.push(`Export: ${props.exportName}`);
    }
    if (typeof props.format === "string" && props.format.length > 0) {
      lines.push(`Format: ${props.format}`);
    }
    if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
      lines.push(`File size: ${props.fileSize}`);
    }
    if (typeof props.itemCount === "string" && props.itemCount.length > 0) {
      lines.push(`Records: ${props.itemCount}`);
    }
    if (
      typeof props.requestedAt === "string" &&
      props.requestedAt.length > 0
    ) {
      lines.push(`Requested: ${props.requestedAt}`);
    }
    lines.push(`Link expires: ${props.expiresAt}`);
    lines.push("");
    lines.push(`Download export: ${props.downloadUrl}`);
    lines.push("");

    if (props.passwordProtected === true) {
      lines.push(
        "Password protected: this archive is encrypted. Use the password shown in your account's Data & privacy page to unpack it — we never send passwords by email.",
      );
      lines.push("");
    }

    lines.push(
      "Keep this link private. Anyone with it can download the archive until it expires — don't forward this email. Once you've stored the file locally, we recommend deleting this message.",
    );
    lines.push("");
    lines.push(
      `Didn't request an export? Please contact us at ${supportEmail} so we can investigate.`,
    );

    return lines.join("\n");
  }
}

export default DataExportReady;
