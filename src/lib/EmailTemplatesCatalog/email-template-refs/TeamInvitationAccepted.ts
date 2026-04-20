import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import type { TeamInvitationAcceptedEmailProps } from "@/email-templates/team-invitation-accepted";

export class TeamInvitationAccepted extends EmailTemplatesCatalogEntry<TeamInvitationAcceptedEmailProps> {
  public id = "team-invitation-accepted" as const satisfies string;

  public description =
    "Team invitation accepted notification email sent to the inviter when an invitee accepts a team invitation. Companion to the 'team-invitation' template — same brand gradient header, metadata table (team, accepter, role, accepted time), and 'About this team' callout, with a primary CTA to view the team. Props: { inviterName: string, accepterName: string, teamName: string, teamUrl: string, accepterEmail?: string, teamDescription?: string, role?: string, acceptedAt?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is TeamInvitationAcceptedEmailProps {
    if (typeof val !== "object" || !val) {
      return false;
    }
    if (!("inviterName" in val) || typeof val.inviterName !== "string") {
      return false;
    }
    if (!("accepterName" in val) || typeof val.accepterName !== "string") {
      return false;
    }
    if (!("teamName" in val) || typeof val.teamName !== "string") {
      return false;
    }
    if (!("teamUrl" in val) || typeof val.teamUrl !== "string") {
      return false;
    }
    if (
      "accepterEmail" in val &&
      typeof val.accepterEmail !== "undefined" &&
      typeof val.accepterEmail !== "string"
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
      "acceptedAt" in val &&
      typeof val.acceptedAt !== "undefined" &&
      typeof val.acceptedAt !== "string"
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
    FC<TeamInvitationAcceptedEmailProps>
  > {
    const component = await import(
      "@/email-templates/team-invitation-accepted"
    ).then((mod) => mod.default);
    return component;
  }

  public async renderPlainTextVersion(
    props: TeamInvitationAcceptedEmailProps,
  ): Promise<string> {
    const productName: string =
      typeof props.productName === "string" && props.productName.length > 0
        ? props.productName
        : "SchemaVaults";
    const supportEmail: string =
      typeof props.supportEmail === "string" && props.supportEmail.length > 0
        ? props.supportEmail
        : "support@schemavaults.com";
    const accepterLine: string =
      typeof props.accepterEmail === "string" &&
      props.accepterEmail.length > 0
        ? `${props.accepterName} (${props.accepterEmail})`
        : props.accepterName;

    const lines: string[] = [
      `${props.accepterName} accepted your invitation to join ${props.teamName} on ${productName}.`,
      "",
      `Hi ${props.inviterName},`,
      "",
      `Good news — ${props.accepterName} accepted your invitation to collaborate on ${props.teamName} in ${productName}. They now have access and can start contributing right away.`,
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
    lines.push(`Joined by: ${accepterLine}`);
    if (typeof props.role === "string" && props.role.length > 0) {
      lines.push(`Role: ${props.role}`);
    }
    if (typeof props.acceptedAt === "string" && props.acceptedAt.length > 0) {
      lines.push(`Accepted: ${props.acceptedAt}`);
    }
    lines.push("");
    lines.push(`View team: ${props.teamUrl}`);
    lines.push("");
    lines.push(
      `You're receiving this because you invited ${props.accepterName} to ${props.teamName}.`,
    );
    lines.push(`Questions? Reach us at ${supportEmail}.`);

    return lines.join("\n");
  }
}

export default TeamInvitationAccepted;
