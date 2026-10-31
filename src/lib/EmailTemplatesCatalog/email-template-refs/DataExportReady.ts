import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import type {
  DataExportContentItem,
  DataExportReadyEmailProps,
} from "@/email-templates/data-export-ready";

export class DataExportReady extends EmailTemplatesCatalogEntry<DataExportReadyEmailProps> {
  public id = "data-export-ready" as const satisfies string;

  public description =
    "Data export / account data download email sent when a requested export has finished generating and the archive is ready to download. Uses the configured brand gradient header, an emerald 'Export complete' card with the archive file name in monospace plus format badge and size, a primary download CTA with a visible fallback link, an amber link-expiry callout, an optional 'What's in this archive' breakdown, a metadata table (workspace, format, size, contents, requested/completed, expiry, request ID), an optional SHA-256 checksum block, and a 'treat the link like a password' security note. Props: { downloadUrl: string, fileName: string, expiresAt: string, recipientName?: string, exportFormat?: string, fileSize?: string, recordCount?: string, requestedAt?: string, completedAt?: string, requestId?: string, workspaceName?: string, checksumSha256?: string, contents?: Array<{ label: string, detail?: string }>, manageExportsUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is DataExportReadyEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof DataExportReadyEmailProps)[] = [
      "downloadUrl",
      "fileName",
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
      "exportFormat",
      "fileSize",
      "recordCount",
      "requestedAt",
      "completedAt",
      "requestId",
      "workspaceName",
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
    if (
      "contents" in val &&
      typeof (val as Record<string, unknown>).contents !== "undefined"
    ) {
      const contents = (val as Record<string, unknown>).contents;
      if (!Array.isArray(contents)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'contents' to be an array when provided, but got ${typeof contents}.`,
        );
      }
      contents.forEach((item, idx) => {
        if (typeof item !== "object" || item === null) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'contents[${idx}]' to be an object, but got ${item === null ? "null" : typeof item}.`,
          );
        }
        const contentItem = item as Record<string, unknown>;
        if (typeof contentItem.label !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'contents[${idx}].label' to be a string, but got ${typeof contentItem.label}.`,
          );
        }
        if (
          typeof contentItem.detail !== "undefined" &&
          typeof contentItem.detail !== "string"
        ) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'contents[${idx}].detail' to be a string when provided, but got ${typeof contentItem.detail}.`,
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
    const workspaceName: string | undefined =
      typeof props.workspaceName === "string" && props.workspaceName.length > 0
        ? props.workspaceName
        : undefined;
    const scopeLine: string = workspaceName
      ? `your ${workspaceName} data`
      : "your data";
    const sizeLine: string = [
      typeof props.fileSize === "string" && props.fileSize.length > 0
        ? props.fileSize
        : undefined,
      typeof props.recordCount === "string" && props.recordCount.length > 0
        ? props.recordCount
        : undefined,
    ]
      .filter((part): part is string => typeof part === "string")
      .join(" · ");

    const lines: string[] = [
      `Your ${productName} data export is ready.`,
      "",
      `Hi ${greetingName},`,
      "",
      `We finished packaging ${scopeLine} and the archive is ready to download. The link below is tied to your account and stops working after it expires.`,
      "",
      `File: ${props.fileName}`,
    ];

    if (sizeLine.length > 0) {
      lines.push(sizeLine);
    }
    lines.push("");
    lines.push(`Download export: ${props.downloadUrl}`);
    lines.push("");
    lines.push(`Link expires ${props.expiresAt}.`);
    lines.push(
      "Download the archive before then — after it expires the file is deleted from our servers and you'll need to request a new export.",
    );
    lines.push("");

    const contents: DataExportContentItem[] = Array.isArray(props.contents)
      ? props.contents.filter(
          (item): item is DataExportContentItem =>
            typeof item === "object" &&
            item !== null &&
            typeof item.label === "string" &&
            item.label.length > 0,
        )
      : [];
    if (contents.length > 0) {
      lines.push("What's in this archive:");
      for (const item of contents) {
        lines.push(
          typeof item.detail === "string" && item.detail.length > 0
            ? `  - ${item.label}: ${item.detail}`
            : `  - ${item.label}`,
        );
      }
      lines.push("");
    }

    if (workspaceName) {
      lines.push(`Workspace: ${workspaceName}`);
    }
    if (
      typeof props.exportFormat === "string" &&
      props.exportFormat.length > 0
    ) {
      lines.push(`Format: ${props.exportFormat}`);
    }
    if (typeof props.fileSize === "string" && props.fileSize.length > 0) {
      lines.push(`Size: ${props.fileSize}`);
    }
    if (typeof props.recordCount === "string" && props.recordCount.length > 0) {
      lines.push(`Contents: ${props.recordCount}`);
    }
    if (typeof props.requestedAt === "string" && props.requestedAt.length > 0) {
      lines.push(`Requested: ${props.requestedAt}`);
    }
    if (typeof props.completedAt === "string" && props.completedAt.length > 0) {
      lines.push(`Completed: ${props.completedAt}`);
    }
    lines.push(`Link expires: ${props.expiresAt}`);
    if (typeof props.requestId === "string" && props.requestId.length > 0) {
      lines.push(`Request ID: ${props.requestId}`);
    }
    if (
      typeof props.checksumSha256 === "string" &&
      props.checksumSha256.length > 0
    ) {
      lines.push(`SHA-256 checksum: ${props.checksumSha256}`);
    }
    lines.push("");

    if (
      typeof props.manageExportsUrl === "string" &&
      props.manageExportsUrl.length > 0
    ) {
      lines.push(
        `Review past exports or request a new one: ${props.manageExportsUrl}`,
      );
      lines.push("");
    }

    lines.push(
      "This archive may contain sensitive data — treat the link like a password and don't forward this email.",
    );
    lines.push(
      `Didn't request an export? Contact us right away at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default DataExportReady;
