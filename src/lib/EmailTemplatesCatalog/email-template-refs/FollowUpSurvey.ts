import type { FC } from "react";
import { EmailTemplatesCatalogEntry } from "../EmailTemplatesCatalogEntry";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import { getEmailBrand } from "@/email-templates/brand";
import {
  buildStarHref,
  type FollowUpSurveyEmailProps,
} from "@/email-templates/follow-up-survey";

export class FollowUpSurvey extends EmailTemplatesCatalogEntry<FollowUpSurveyEmailProps> {
  public id = "follow-up-survey" as const satisfies string;

  public description =
    "Follow-up survey email asking a user to share feedback about their experience. Uses the configured brand gradient header, fully customizable headline/body copy, a row of five clickable stars (every star links to the survey, optionally with the clicked score appended as a query parameter), a primary CTA with a visible fallback link, and an optional closing paragraph. Props: { surveyUrl: string, recipientName?: string, headline?: string, bodyCopy?: string, ratingPrompt?: string, ctaLabel?: string, estimatedTime?: string, closingCopy?: string, ratingQueryParam?: string, previewText?: string, productName?: string, supportEmail?: string }" as const satisfies string;

  public validateProps(val: unknown): val is FollowUpSurveyEmailProps {
    if (typeof val !== "object" || !val) {
      throw new BadEmailTemplatePropsError(
        `Template '${this.id}' expected props to be an object, but got ${val === null ? "null" : typeof val}.`,
      );
    }
    const requiredStringKeys: readonly (keyof FollowUpSurveyEmailProps)[] = [
      "surveyUrl",
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
    const optionalStringKeys: readonly (keyof FollowUpSurveyEmailProps)[] = [
      "recipientName",
      "headline",
      "bodyCopy",
      "ratingPrompt",
      "ctaLabel",
      "estimatedTime",
      "closingCopy",
      "ratingQueryParam",
      "previewText",
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
    FC<FollowUpSurveyEmailProps>
  > {
    const component = await import("@/email-templates/follow-up-survey").then(
      (mod) => mod.default,
    );
    return component;
  }

  public async renderPlainTextVersion(
    props: FollowUpSurveyEmailProps,
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
    const headline: string =
      typeof props.headline === "string" && props.headline.length > 0
        ? props.headline
        : "How was your experience?";
    const bodyCopy: string =
      typeof props.bodyCopy === "string" && props.bodyCopy.length > 0
        ? props.bodyCopy
        : `Thanks for using ${productName}. We'd love to hear how it went — your answers go straight to the team building the product and shape what we work on next.`;
    const ratingPrompt: string =
      typeof props.ratingPrompt === "string" && props.ratingPrompt.length > 0
        ? props.ratingPrompt
        : "Tap a star to rate your experience";
    const ctaLabel: string =
      typeof props.ctaLabel === "string" && props.ctaLabel.length > 0
        ? props.ctaLabel
        : "Take the survey";

    const lines: string[] = [
      headline,
      "",
      `Hi ${greetingName},`,
      "",
      bodyCopy,
      "",
      `${ratingPrompt}:`,
    ];

    for (const rating of [1, 2, 3, 4, 5]) {
      lines.push(
        `  ${"★".repeat(rating)}${"☆".repeat(5 - rating)} (${rating}/5): ${buildStarHref(props.surveyUrl, rating, props.ratingQueryParam)}`,
      );
    }

    lines.push("");
    lines.push(`${ctaLabel}: ${props.surveyUrl}`);

    if (
      typeof props.estimatedTime === "string" &&
      props.estimatedTime.length > 0
    ) {
      lines.push(`It takes about ${props.estimatedTime}.`);
    }

    if (typeof props.closingCopy === "string" && props.closingCopy.length > 0) {
      lines.push("");
      lines.push(props.closingCopy);
    }

    lines.push("");
    lines.push(
      `Would rather tell us directly? Just reply to this email or reach us at ${supportEmail}.`,
    );

    return lines.join("\n");
  }
}

export default FollowUpSurvey;
