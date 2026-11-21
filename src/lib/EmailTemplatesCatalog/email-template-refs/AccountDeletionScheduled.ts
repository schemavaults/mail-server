import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import type {
  AccountDeletionDataEntry,
  AccountDeletionScheduledEmailProps,
} from "@/email-templates/account-deletion-scheduled";

export class AccountDeletionScheduled extends EmailTemplatesCatalogEntry<AccountDeletionScheduledEmailProps> {
  public id = "account-deletion-scheduled" as const satisfies string;

  public description =
    "Account-deletion-scheduled email sent when a user (or workspace owner) requests permanent deletion and a cancellation grace period starts. Uses a destructive red gradient header mirroring the theme's `--destructive` token, a red 'Scheduled for permanent deletion' panel with the deletion date and a days-left countdown, a prominent 'Keep my account' cancellation CTA with a visible fallback link, a three-step 'What happens next' timeline rail (requested → cancellation window → permanent deletion, coloured with the theme's `--chart-3` teal, `--warning` amber and `--destructive` red), an optional amber 'Download your data first' export nudge, an optional 'What will be deleted' dataset table, an optional plan/subscription note, a request-details metadata table (request ID, account, workspace, requested at/by/from, grace period, deletion date), an optional 'What we keep' legal-retention note, and a security footer for unrecognised requests. Props: { cancelDeletionUrl: string, recipientName?: string, accountEmail?: string, organizationName?: string, requestId?: string, requestedAt?: string, scheduledDeletionAt?: string, gracePeriodDays?: number, daysRemaining?: number, requestedByName?: string, requestedFrom?: string, dataToBeDeleted?: Array<{ label: string, detail?: string }>, retainedDataNote?: string, subscriptionNote?: string, dataExportUrl?: string, privacyPolicyUrl?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(
    val: unknown,
  ): val is AccountDeletionScheduledEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof AccountDeletionScheduledEmailProps)[] =
      ["cancelDeletionUrl"];
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
    const optionalStringKeys: readonly (keyof AccountDeletionScheduledEmailProps)[] =
      [
        "recipientName",
        "accountEmail",
        "organizationName",
        "requestId",
        "requestedAt",
        "scheduledDeletionAt",
        "requestedByName",
        "requestedFrom",
        "retainedDataNote",
        "subscriptionNote",
        "dataExportUrl",
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
    const optionalCountKeys: readonly (keyof AccountDeletionScheduledEmailProps)[] =
      ["gracePeriodDays", "daysRemaining"];
    for (const key of optionalCountKeys) {
      if (!(key in val)) {
        continue;
      }
      const value = (val as Record<string, unknown>)[key];
      if (typeof value === "undefined") {
        continue;
      }
      if (typeof value !== "number") {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop '${key}' to be a number when provided, but got ${typeof value}.`,
        );
      }
      if (!Number.isFinite(value)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop '${key}' to be a finite number, but got ${value}.`,
        );
      }
      if (value < 0) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop '${key}' to be non-negative, but got ${value}.`,
        );
      }
    }
    if ("dataToBeDeleted" in val && typeof val.dataToBeDeleted !== "undefined") {
      if (!Array.isArray(val.dataToBeDeleted)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'dataToBeDeleted' to be an array of {label,detail?} when provided, but got ${typeof val.dataToBeDeleted}.`,
        );
      }
      for (let i = 0; i < val.dataToBeDeleted.length; i++) {
        const entry: unknown = val.dataToBeDeleted[i];
        if (typeof entry !== "object" || entry === null) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'dataToBeDeleted[${i}]' to be an object, but got ${entry === null ? "null" : typeof entry}.`,
          );
        }
        const label = (entry as Record<string, unknown>).label;
        if (typeof label !== "string" || label.length === 0) {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'dataToBeDeleted[${i}].label' to be a non-empty string.`,
          );
        }
        const detail = (entry as Record<string, unknown>).detail;
        if (typeof detail !== "undefined" && typeof detail !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected 'dataToBeDeleted[${i}].detail' to be a string when provided, but got ${typeof detail}.`,
          );
        }
      }
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<
    FC<AccountDeletionScheduledEmailProps>
  > {
    const component = await import(
      "@/email-templates/account-deletion-scheduled"
    ).then((mod) => mod.default);
    return component;
  }

  public async renderPlainTextVersion(
    props: AccountDeletionScheduledEmailProps,
  ): Promise<string> {
    const brand = getEmailBrand();
    const nonEmpty = (value: unknown): string | undefined =>
      typeof value === "string" && value.length > 0 ? value : undefined;
    const finiteCount = (value: unknown): number | undefined =>
      typeof value === "number" && Number.isFinite(value) && value >= 0
        ? value
        : undefined;
    const pluralizeDays = (days: number): string =>
      `${days.toLocaleString("en-US")} ${days === 1 ? "day" : "days"}`;

    const productName: string =
      nonEmpty(props.productName) ?? brand.productName;
    const supportEmail: string =
      nonEmpty(props.supportEmail) ?? brand.supportEmail;
    const greetingName: string = nonEmpty(props.recipientName) ?? "there";

    const accountEmail: string | undefined = nonEmpty(props.accountEmail);
    const organizationName: string | undefined = nonEmpty(
      props.organizationName,
    );
    const requestId: string | undefined = nonEmpty(props.requestId);
    const requestedAt: string | undefined = nonEmpty(props.requestedAt);
    const scheduledDeletionAt: string | undefined = nonEmpty(
      props.scheduledDeletionAt,
    );
    const requestedByName: string | undefined = nonEmpty(props.requestedByName);
    const requestedFrom: string | undefined = nonEmpty(props.requestedFrom);
    const retainedDataNote: string | undefined = nonEmpty(
      props.retainedDataNote,
    );
    const subscriptionNote: string | undefined = nonEmpty(
      props.subscriptionNote,
    );
    const dataExportUrl: string | undefined = nonEmpty(props.dataExportUrl);
    const privacyPolicyUrl: string | undefined = nonEmpty(
      props.privacyPolicyUrl,
    );
    const gracePeriodDays: number | undefined = finiteCount(
      props.gracePeriodDays,
    );
    const daysRemaining: number | undefined = finiteCount(props.daysRemaining);
    const dataToBeDeleted: AccountDeletionDataEntry[] = Array.isArray(
      props.dataToBeDeleted,
    )
      ? props.dataToBeDeleted
      : [];

    const subjectPhrase: string = organizationName
      ? `the ${organizationName} workspace`
      : "your account";

    const countdownLabel: string | undefined =
      typeof daysRemaining === "number"
        ? daysRemaining === 0
          ? "Deleting today"
          : `${pluralizeDays(daysRemaining)} left to cancel`
        : typeof gracePeriodDays === "number"
          ? `${pluralizeDays(gracePeriodDays)} left to cancel`
          : undefined;

    const lines: string[] = [
      organizationName
        ? `${organizationName} is scheduled for deletion.`
        : "Your account is scheduled for deletion.",
      "",
      `Hi ${greetingName},`,
      "",
      `We received a request to permanently delete ${subjectPhrase} on ${productName}${
        accountEmail ? ` (${accountEmail})` : ""
      }. Nothing has been erased yet — the deletion is scheduled, and you can cancel it at any point before it runs.`,
      "",
      "SCHEDULED FOR PERMANENT DELETION",
      `  ${scheduledDeletionAt ?? "Date to be confirmed"}`,
    ];

    if (countdownLabel) {
      lines.push(`  ${countdownLabel}`);
    }
    lines.push("");
    lines.push(
      `${organizationName ? "Keep this workspace" : "Keep my account"}: ${props.cancelDeletionUrl}`,
    );
    lines.push("");

    lines.push("What happens next:");
    lines.push(`  1. Deletion requested — ${requestedAt ?? "Just now"}`);
    lines.push(
      `  2. Cancellation window open — ${
        typeof gracePeriodDays === "number"
          ? `${pluralizeDays(gracePeriodDays)} to change your mind, sign in to restore ${subjectPhrase}`
          : `you can change your mind, sign in to restore ${subjectPhrase}`
      }`,
    );
    lines.push(
      `  3. Permanent deletion — ${
        scheduledDeletionAt
          ? `${scheduledDeletionAt}, this cannot be undone`
          : "this cannot be undone"
      }`,
    );
    lines.push("");

    if (dataExportUrl) {
      lines.push(
        "Download your data first: once the deletion runs we can't recover anything, so export anything you want to keep while you still can.",
      );
      lines.push(`Request a data export: ${dataExportUrl}`);
      lines.push("");
    }

    if (dataToBeDeleted.length > 0) {
      lines.push("What will be deleted:");
      for (const entry of dataToBeDeleted) {
        const detail: string | undefined = nonEmpty(entry.detail);
        lines.push(`  - ${entry.label}${detail ? ` — ${detail}` : ""}`);
      }
      lines.push("");
    }

    if (subscriptionNote) {
      lines.push(`Your plan: ${subscriptionNote}`);
      lines.push("");
    }

    const detailLines: string[] = [];
    if (requestId) {
      detailLines.push(`Request ID: ${requestId}`);
    }
    if (accountEmail) {
      detailLines.push(`Account: ${accountEmail}`);
    }
    if (organizationName) {
      detailLines.push(`Workspace: ${organizationName}`);
    }
    if (requestedAt) {
      detailLines.push(`Requested: ${requestedAt}`);
    }
    if (requestedByName) {
      detailLines.push(`Requested by: ${requestedByName}`);
    }
    if (requestedFrom) {
      detailLines.push(`Requested from: ${requestedFrom}`);
    }
    if (typeof gracePeriodDays === "number") {
      detailLines.push(`Grace period: ${pluralizeDays(gracePeriodDays)}`);
    }
    if (scheduledDeletionAt) {
      detailLines.push(`Deletes on: ${scheduledDeletionAt}`);
    }
    if (detailLines.length > 0) {
      lines.push("Request details:");
      for (const detailLine of detailLines) {
        lines.push(`  ${detailLine}`);
      }
      lines.push("");
    }

    if (retainedDataNote) {
      lines.push(`What we keep: ${retainedDataNote}`);
      lines.push("");
    }

    if (privacyPolicyUrl) {
      lines.push(`How we handle your data: ${privacyPolicyUrl}`);
      lines.push("");
    }

    lines.push(
      `Didn't request this? Someone may have access to ${
        organizationName ? "your workspace" : "your account"
      }. Use the link above to cancel the deletion, then contact us right away at ${supportEmail}${
        requestId ? ` and quote request ID ${requestId}` : ""
      }.`,
    );

    return lines.join("\n");
  }
}

export default AccountDeletionScheduled;
