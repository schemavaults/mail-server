import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import type { TeamInvitationEmailProps } from "@/email-templates/team-invitation";

export class TeamInvitation extends EmailTemplatesCatalogEntry<TeamInvitationEmailProps> {
  public id = "team-invitation" as const satisfies string;

  public description =
    "Team/workspace invitation email sent when an existing member invites another user to collaborate on a team. Uses SchemaVaults brand gradient header, an 'About this team' callout, a metadata table (team, inviter, role, expiration), and a primary CTA to accept the invite with a visible fallback link. Props: { inviterName: string, teamName: string, acceptInviteUrl: string, inviteeName?: string, inviterEmail?: string, teamDescription?: string, role?: string, expiresAt?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is TeamInvitationEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof TeamInvitationEmailProps)[] = [
      "inviterName",
      "teamName",
      "acceptInviteUrl",
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
    const optionalStringKeys: readonly (keyof TeamInvitationEmailProps)[] = [
      "inviteeName",
      "inviterEmail",
      "teamDescription",
      "role",
      "expiresAt",
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
    FC<TeamInvitationEmailProps>
  > {
    const component = await import("@/email-templates/team-invitation").then(
      (mod) => mod.default,
    );
    return component;
  }

  public async renderPlainTextVersion(
    props: TeamInvitationEmailProps,
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
      typeof props.inviteeName === "string" && props.inviteeName.length > 0
        ? props.inviteeName
        : "there";
    const inviterLine: string =
      typeof props.inviterEmail === "string" && props.inviterEmail.length > 0
        ? `${props.inviterName} (${props.inviterEmail})`
        : props.inviterName;

    const lines: string[] = [
      `You're invited to join ${props.teamName} on ${productName}.`,
      "",
      `Hi ${greetingName},`,
      "",
      `${props.inviterName} has invited you to collaborate on ${props.teamName} in ${productName}. Accept the invitation to share schemas, manage vaults, and build together.`,
      "",
    ];

    if (
      typeof props.teamDescription === "string" &&
      props.teamDescription.length > 0
    ) {
      lines.push("About this team:");
      lines.push(`  ${props.teamDescription}`);
      lines.push("");
    }

    lines.push(`Team: ${props.teamName}`);
    lines.push(`Invited by: ${inviterLine}`);
    if (typeof props.role === "string" && props.role.length > 0) {
      lines.push(`Role: ${props.role}`);
    }
    if (typeof props.expiresAt === "string" && props.expiresAt.length > 0) {
      lines.push(`Expires: ${props.expiresAt}`);
    }
    lines.push("");
    lines.push(`Accept invitation: ${props.acceptInviteUrl}`);
    lines.push("");
    lines.push(
      "Didn't expect this invitation? You can safely ignore this email — nothing will happen unless you accept.",
    );
    lines.push(`Questions? Reach us at ${supportEmail}.`);

    return lines.join("\n");
  }
}

export default TeamInvitation;
