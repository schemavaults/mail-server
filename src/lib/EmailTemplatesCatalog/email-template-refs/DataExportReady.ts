import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import type {
  DataExportFile,
  DataExportReadyEmailProps,
} from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Data export / account download ready email sent when a user-requested export of their data has finished packaging. Uses the configured brand gradient header, a green 'Export complete' panel (the @schemavaults/theme chart-3 accent), a primary download CTA with a visible fallback link, an amber link-expiry notice (theme chart-4 accent), an archive manifest table (file, format, record count, size), a request metadata table (export ID, timestamps, requesting address and IP) and a 'keep this link private' security callout. Props: { exportId: string, downloadUrl: string, recipientName?: string, requestedAt?: string, readyAt?: string, expiresAt?: string, totalSize?: string, files?: Array<{ name: string, format?: string, size?: string, recordCount?: number }>, scopeSummary?: string, requestedByEmail?: string, requestedFromIp?: string, manageDataUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is DataExportReadyEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof DataExportReadyEmailProps)[] = [
      "exportId",
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
      "readyAt",
      "expiresAt",
      "totalSize",
      "scopeSummary",
      "requestedByEmail",
      "requestedFromIp",
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
      "files" in val &&
      typeof (val as Record<string, unknown>).files !== "undefined"
    ) {
      const files = (val as Record<string, unknown>).files;
      if (!Array.isArray(files)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'files' to be an array when provided, but got ${typeof files}.`,
        );
      }
      files.forEach((entry, idx) => {
        if (typeof entry !== "object" || entry === null) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'files[${idx}]' to be an object, but got ${entry === null ? "null" : typeof entry}.`,
          );
        }
        const file = entry as Record<string, unknown>;
        if (typeof file.name !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'files[${idx}].name' to be a string, but got ${typeof file.name}.`,
          );
        }
        for (const k of ["format", "size"] as const) {
          if (typeof file[k] !== "undefined" && typeof file[k] !== "string") {
            throw new BadEmailTemplatePropsError(
              `Template '${this.id}' expected optional 'files[${idx}].${k}' to be a string when provided, but got ${typeof file[k]}.`,
            );
          }
        }
        if (
          typeof file.recordCount !== "undefined" &&
          typeof file.recordCount !== "number"
        ) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected optional 'files[${idx}].recordCount' to be a number when provided, but got ${typeof file.recordCount}.`,
          );
        }
      });
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<
    FC<DataExportReadyEmailProps>
  > {
    const component = await import(
      "@/email-templates/data-export-ready"
    ).then((mod) => mod.default);
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
    const files: DataExportFile[] = Array.isArray(props.files)
      ? props.files
      : [];

    const lines: string[] = [
      `Your ${productName} data export is ready.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We finished packaging the ${productName} data you asked for. Use the link below to download the archive — it's yours to keep, and you can request another export at any time.`,
      "",
      `Download export: ${props.downloadUrl}`,
      "",
    ];

    if (
      typeof props.expiresAt === "string" &&
      props.expiresAt.length > 0
    ) {
      lines.push(`This download link expires ${props.expiresAt}.`);
      lines.push(
        "After that the archive is deleted from our servers and the download link stops working. Request a fresh export if you need it again.",
      );
      lines.push("");
    }

    if (
      typeof props.scopeSummary === "string" &&
      props.scopeSummary.length > 0
    ) {
      lines.push("Export contents:");
      lines.push(`  ${props.scopeSummary}`);
      lines.push("");
    }

    if (files.length > 0) {
      lines.push("What's in the archive:");
      for (const file of files) {
        const details: string[] = [];
        if (typeof file.format === "string" && file.format.length > 0) {
          details.push(file.format);
        }
        if (typeof file.recordCount === "number") {
          details.push(
            `${file.recordCount.toLocaleString("en-US")} record${file.recordCount === 1 ? "" : "s"}`,
          );
        }
        if (typeof file.size === "string" && file.size.length > 0) {
          details.push(file.size);
        }
        lines.push(
          details.length > 0
            ? `  - ${file.name} (${details.join(", ")})`
            : `  - ${file.name}`,
        );
      }
      lines.push("");
    }

    lines.push(`Export ID: ${props.exportId}`);
    if (typeof props.requestedAt === "string" && props.requestedAt.length > 0) {
      lines.push(`Requested: ${props.requestedAt}`);
    }
    if (typeof props.readyAt === "string" && props.readyAt.length > 0) {
      lines.push(`Completed: ${props.readyAt}`);
    }
    if (
      typeof props.requestedByEmail === "string" &&
      props.requestedByEmail.length > 0
    ) {
      lines.push(`Requested by: ${props.requestedByEmail}`);
    }
    if (
      typeof props.requestedFromIp === "string" &&
      props.requestedFromIp.length > 0
    ) {
      lines.push(`Request IP: ${props.requestedFromIp}`);
    }
    if (files.length > 0) {
      lines.push(`Files: ${files.length}`);
    }
    if (typeof props.totalSize === "string" && props.totalSize.length > 0) {
      lines.push(`Archive size: ${props.totalSize}`);
    }
    lines.push("");

    lines.push(
      `Keep this link private: anyone with the download link can read the exported data, so don't forward this email. If you didn't request this export, contact ${supportEmail} right away.`,
    );

    if (
      typeof props.manageDataUrl === "string" &&
      props.manageDataUrl.length > 0
    ) {
      lines.push("");
      lines.push(
        `Manage your data, request another export, or delete your account: ${props.manageDataUrl}`,
      );
    }

    lines.push("");
    lines.push(
      `Questions about what's in your export? Reply to this email or reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default DataExportReady;
