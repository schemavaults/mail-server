import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import type { TeamInvitationEmailProps } from "@/email-templates/team-invitation";

export class TeamInvitation extends EmailTemplatesCatalogEntry<TeamInvitationEmailProps> {
  public id = "team-invitation" as const satisfies string;

  public description =
    "Team/workspace invitation email sent when an existing member invites another user to collaborate on a team. Uses SchemaVaults brand gradient header, an 'About this team' callout, a metadata table (team, inviter, role, expiration), and a primary CTA to accept the invite with a visible fallback link. Props: { inviterName: string, teamName: string, acceptInviteUrl: string, inviteeName?: string, inviterEmail?: string, teamDescription?: string, role?: string, expiresAt?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is TeamInvitationEmailProps {
    if (typeof val !== "object" || !val) {
      return false;
    }
    if (!("inviterName" in val) || typeof val.inviterName !== "string") {
      return false;
    }
    if (!("teamName" in val) || typeof val.teamName !== "string") {
      return false;
    }
    if (
      !("acceptInviteUrl" in val) ||
      typeof val.acceptInviteUrl !== "string"
    ) {
      return false;
    }
    if (
      "inviteeName" in val &&
      typeof val.inviteeName !== "undefined" &&
      typeof val.inviteeName !== "string"
    ) {
      return false;
    }
    if (
      "inviterEmail" in val &&
      typeof val.inviterEmail !== "undefined" &&
      typeof val.inviterEmail !== "string"
    ) {
      return false;
    }
    if (
      "teamDescription" in val &&
      typeof val.teamDescription !== "undefined" &&
      typeof val.teamDescription !== "string"
    ) {
      return false;
    }
    if (
      "role" in val &&
      typeof val.role !== "undefined" &&
      typeof val.role !== "string"
    ) {
      return false;
    }
    if (
      "expiresAt" in val &&
      typeof val.expiresAt !== "undefined" &&
      typeof val.expiresAt !== "string"
    ) {
      return false;
    }
    if (
      "productName" in val &&
      typeof val.productName !== "undefined" &&
      typeof val.productName !== "string"
    ) {
      return false;
    }
    if (
      "supportEmail" in val &&
      typeof val.supportEmail !== "undefined" &&
      typeof val.supportEmail !== "string"
    ) {
      return false;
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
