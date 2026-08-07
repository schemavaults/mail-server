import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactElement } from "react";
import { getEmailBrand } from "./brand";

export interface FollowUpSurveyEmailProps {
  /** Destination every star and the primary CTA link to. */
  surveyUrl: string;
  recipientName?: string;
  /** Overrides the headline shown in the gradient header. */
  headline?: string;
  /** Overrides the main paragraph of body copy. */
  bodyCopy?: string;
  /** Caption rendered directly under the star row. */
  ratingPrompt?: string;
  /** Label of the primary call-to-action button. */
  ctaLabel?: string;
  /** e.g. "2 minutes" — rendered as a "takes about X" reassurance line. */
  estimatedTime?: string;
  /** Optional extra paragraph rendered after the CTA. */
  closingCopy?: string;
  /**
   * When set, each star links to `surveyUrl` with this query parameter
   * appended (`?<ratingQueryParam>=1..5`) so the survey can pre-fill the
   * score the recipient clicked. Omit to link every star to `surveyUrl`
   * unchanged.
   */
  ratingQueryParam?: string;
  /** Overrides the inbox preview text. */
  previewText?: string;
  productName?: string;
  supportEmail?: string;
}

// Neutral palette tokens. Email clients don't resolve CSS custom properties,
// so concrete hex values are inlined here; the brand accent colors come from
// the configured brand inside the component.
const FOREGROUND = "#0b1220";
const MUTED_FOREGROUND = "#64748b";
const BORDER = "#e2e8f0";
const CARD_BG = "#ffffff";
const PAGE_BG = "#f8fafc";
const PANEL_BG = "#f1f5f9";
// Semantic star color — gold reads as a rating control in every client.
const STAR_GOLD = "#f59e0b";

const STAR_RATINGS: readonly number[] = [1, 2, 3, 4, 5];

/**
 * Builds the href for an individual star. Without `ratingQueryParam` every
 * star points at the survey URL unchanged; with it, the clicked score is set
 * as a query parameter on the survey URL.
 */
export function buildStarHref(
  surveyUrl: string,
  rating: number,
  ratingQueryParam?: string,
): string {
  if (typeof ratingQueryParam !== "string" || ratingQueryParam.length === 0) {
    return surveyUrl;
  }
  let url: URL;
  try {
    url = new URL(surveyUrl);
  } catch {
    // Not a parseable absolute URL (e.g. a relative path). Point the star at
    // the survey unchanged rather than emitting a mangled href.
    return surveyUrl;
  }
  url.searchParams.set(ratingQueryParam, String(rating));
  return url.toString();
}

export default function FollowUpSurveyEmail(
  props: FollowUpSurveyEmailProps,
): ReactElement {
  if (
    typeof props.surveyUrl !== "string" &&
    process.env.NODE_ENV !== "development"
  ) {
    throw new Error(
      "Missing 'surveyUrl' in props for FollowUpSurveyEmail template!",
    );
  }

  const brand = getEmailBrand();
  const BRAND_BLUE = brand.colors.accent;
  const BRAND_BLUE_DARK = brand.colors.accentDark;

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
  const estimatedTime: string | undefined =
    typeof props.estimatedTime === "string" && props.estimatedTime.length > 0
      ? props.estimatedTime
      : undefined;
  const closingCopy: string | undefined =
    typeof props.closingCopy === "string" && props.closingCopy.length > 0
      ? props.closingCopy
      : undefined;
  const previewText: string =
    typeof props.previewText === "string" && props.previewText.length > 0
      ? props.previewText
      : `${headline} Share your feedback on ${productName}.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body
        style={{
          backgroundColor: PAGE_BG,
          color: FOREGROUND,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          margin: 0,
          padding: "32px 0",
        }}
      >
        <Container
          style={{
            backgroundColor: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: "12px",
            margin: "0 auto",
            maxWidth: "560px",
            overflow: "hidden",
            padding: 0,
          }}
        >
          <Section
            style={{
              background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_BLUE_DARK} 100%)`,
              padding: "32px 32px 28px 32px",
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              {productName} · Feedback
            </Text>
            <Heading
              as="h1"
              style={{
                color: "#ffffff",
                fontSize: "26px",
                fontWeight: 700,
                lineHeight: "1.25",
                margin: "8px 0 0 0",
              }}
            >
              {headline}
            </Heading>
          </Section>

          <Section style={{ padding: "28px 32px 8px 32px" }}>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "16px",
                lineHeight: "1.6",
                margin: "0 0 8px 0",
              }}
            >
              Hi {greetingName},
            </Text>
            <Text
              style={{
                color: FOREGROUND,
                fontSize: "15px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              {bodyCopy}
            </Text>
          </Section>

          <Section style={{ padding: "20px 32px 4px 32px" }}>
            <div
              style={{
                backgroundColor: PANEL_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: "8px",
                padding: "18px 16px 14px 16px",
                textAlign: "center",
              }}
            >
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{ borderCollapse: "collapse", margin: "0 auto" }}
              >
                <tbody>
                  <tr>
                    {STAR_RATINGS.map((rating) => (
                      <td
                        key={rating}
                        style={{ padding: "0 4px", verticalAlign: "middle" }}
                      >
                        <a
                          href={buildStarHref(
                            props.surveyUrl,
                            rating,
                            props.ratingQueryParam,
                          )}
                          aria-label={`Rate ${rating} out of 5`}
                          style={{
                            color: STAR_GOLD,
                            display: "inline-block",
                            fontSize: "34px",
                            lineHeight: "40px",
                            textDecoration: "none",
                          }}
                        >
                          ★
                        </a>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: "10px 0 0 0",
                }}
              >
                {ratingPrompt}
              </Text>
            </div>
          </Section>

          <Section style={{ padding: "20px 32px 8px 32px" }}>
            <Button
              href={props.surveyUrl}
              style={{
                backgroundColor: BRAND_BLUE_DARK,
                borderRadius: "8px",
                color: "#ffffff",
                display: "inline-block",
                fontSize: "15px",
                fontWeight: 600,
                padding: "12px 22px",
                textDecoration: "none",
              }}
            >
              {ctaLabel}
            </Button>
            {estimatedTime ? (
              <Text
                style={{
                  color: MUTED_FOREGROUND,
                  fontSize: "13px",
                  lineHeight: "1.55",
                  margin: "12px 0 0 0",
                }}
              >
                It takes about {estimatedTime}.
              </Text>
            ) : null}
          </Section>

          {closingCopy ? (
            <Section style={{ padding: "8px 32px 0 32px" }}>
              <Text
                style={{
                  color: FOREGROUND,
                  fontSize: "15px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                {closingCopy}
              </Text>
            </Section>
          ) : null}

          <Section style={{ padding: "12px 32px 24px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "12px",
                lineHeight: "1.55",
                margin: 0,
                wordBreak: "break-all",
              }}
            >
              Or copy this link into your browser:{" "}
              <a
                href={props.surveyUrl}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {props.surveyUrl}
              </a>
            </Text>
          </Section>

          <Hr style={{ borderColor: BORDER, margin: "0 32px" }} />

          <Section style={{ padding: "20px 32px 28px 32px" }}>
            <Text
              style={{
                color: MUTED_FOREGROUND,
                fontSize: "13px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Would rather tell us directly? Just reply to this email or reach
              us at{" "}
              <a
                href={`mailto:${supportEmail}`}
                style={{ color: BRAND_BLUE_DARK, textDecoration: "none" }}
              >
                {supportEmail}
              </a>
              .
            </Text>
          </Section>
        </Container>

        <Container style={{ margin: "16px auto 0 auto", maxWidth: "560px" }}>
          <Text
            style={{
              color: MUTED_FOREGROUND,
              fontSize: "12px",
              lineHeight: "1.5",
              margin: 0,
              textAlign: "center",
            }}
          >
            © {new Date().getFullYear()} {productName}. You are receiving this
            email because you recently used {productName}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

FollowUpSurveyEmail.PreviewProps = {
  recipientName: "Jane Doe",
  surveyUrl: "https://example.com/surveys/onboarding?response_id=example-id",
  ratingQueryParam: "rating",
  estimatedTime: "2 minutes",
  closingCopy:
    "Every response is read by the team — thank you for helping us improve.",
} satisfies FollowUpSurveyEmailProps;
