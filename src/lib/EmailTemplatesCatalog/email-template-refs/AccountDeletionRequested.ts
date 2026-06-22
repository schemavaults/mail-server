import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { AccountDeletionRequestedEmailProps } from "@/email-templates/account-deletion-requested";

export class AccountDeletionRequested extends EmailTemplatesCatalogEntry<AccountDeletionRequestedEmailProps> {
  public id = "account-deletion-requested" as const satisfies string;

  public description =
    "Account deletion confirmation email sent when a user requests permanent deletion of their account. Surfaces the scheduled deletion date in a prominent countdown panel, summarizes what data will be removed, and offers a primary CTA to cancel the request before the grace period elapses. Mirrors the SchemaVaults brand gradient header used by welcome/security-alert. Props: { name: string, scheduledDeletionDate: string, cancelDeletionUrl: string, gracePeriodDays?: number, requestedFrom?: string, requestTime?: string, itemsToBeDeleted?: string[], productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(
    val: unknown,
  ): val is AccountDeletionRequestedEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof AccountDeletionRequestedEmailProps)[] =
      ["name", "scheduledDeletionDate", "cancelDeletionUrl"];
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
    const optionalStringKeys: readonly (keyof AccountDeletionRequestedEmailProps)[] =
      ["requestedFrom", "requestTime", "productName", "supportEmail"];
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
      "gracePeriodDays" in val &&
      typeof (val as Record<string, unknown>).gracePeriodDays !== "undefined" &&
      typeof (val as Record<string, unknown>).gracePeriodDays !== "number"
    ) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected optional prop 'gracePeriodDays' to be a number when provided, but got ${typeof (val as Record<string, unknown>).gracePeriodDays}.`,
      );
    }
    if (
      "itemsToBeDeleted" in val &&
      typeof (val as Record<string, unknown>).itemsToBeDeleted !== "undefined"
    ) {
      const items = (val as Record<string, unknown>).itemsToBeDeleted;
      if (!Array.isArray(items)) {
        throw new BadEmailTemplatePropsError(
          `Template '${this.id}' expected optional prop 'itemsToBeDeleted' to be an array of strings when provided, but got ${typeof items}.`,
        );
      }
      for (let i = 0; i < items.length; i++) {
        if (typeof items[i] !== "string") {
          throw new BadEmailTemplatePropsError(
            `Template '${this.id}' expected optional prop 'itemsToBeDeleted[${i}]' to be a string, but got ${typeof items[i]}.`,
          );
        }
      }
    }
    return true;
  }

  public async loadReactEmailTemplate(): Promise<
    FC<AccountDeletionRequestedEmailProps>
  > {
    const component = await import(
      "@/email-templates/account-deletion-requested"
    ).then((mod) => mod.default);
    return component;
  }

  public async renderPlainTextVersion(
    props: AccountDeletionRequestedEmailProps,
  ): Promise<string> {
    const productName: string =
      typeof props.productName === "string" && props.productName.length > 0
        ? props.productName
        : "SchemaVaults";
    const supportEmail: string =
      typeof props.supportEmail === "string" && props.supportEmail.length > 0
        ? props.supportEmail
        : "support@schemavaults.com";
    const gracePeriodDays: number | undefined =
      typeof props.gracePeriodDays === "number" &&
      Number.isFinite(props.gracePeriodDays) &&
      props.gracePeriodDays > 0
        ? Math.floor(props.gracePeriodDays)
        : undefined;
    const itemsToBeDeleted: readonly string[] =
      Array.isArray(props.itemsToBeDeleted) && props.itemsToBeDeleted.length > 0
        ? props.itemsToBeDeleted
        : [
            "Your account profile and authentication credentials",
            "Schemas you have vaulted and any private collections you own",
            "API keys, tokens, and active sessions tied to your account",
            "Mailing list subscriptions and notification preferences",
          ];

    const lines: string[] = [
      `Your ${productName} account is scheduled for deletion.`,
      "",
      `Hi ${props.name},`,
      "",
      `We received a request to permanently delete your ${productName} account. We're confirming the request so you have a chance to cancel it if you didn't ask for this — or changed your mind.`,
      "",
      `Scheduled deletion: ${props.scheduledDeletionDate}`,
    ];

    if (typeof gracePeriodDays === "number") {
      lines.push(
        `Grace period: ${gracePeriodDays} day${gracePeriodDays === 1 ? "" : "s"} to cancel before deletion becomes permanent.`,
      );
    }
    if (
      typeof props.requestTime === "string" &&
      props.requestTime.length > 0
    ) {
      lines.push(`Requested: ${props.requestTime}`);
    }
    if (
      typeof props.requestedFrom === "string" &&
      props.requestedFrom.length > 0
    ) {
      lines.push(`From: ${props.requestedFrom}`);
    }

    lines.push("");
    lines.push("What will be deleted:");
    for (const item of itemsToBeDeleted) {
      lines.push(`  - ${item}`);
    }
    lines.push("");
    lines.push(`Cancel the deletion request: ${props.cancelDeletionUrl}`);
    lines.push("");
    lines.push(
      "Didn't request this? Cancel right away, change your password, and reach out to support so we can review recent activity on your account.",
    );
    lines.push("");
    lines.push(
      "Once the grace period ends, deletion is permanent and your data cannot be restored.",
    );
    lines.push(`Questions? Reach us at ${supportEmail}.`);

    return lines.join("\n");
  }
}

export default AccountDeletionRequested;
