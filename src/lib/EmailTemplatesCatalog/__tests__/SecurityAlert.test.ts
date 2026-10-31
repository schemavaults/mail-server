import { describe, expect, test } from "bun:test";
import { SecurityAlert } from "../email-template-refs/SecurityAlert";
import BadEmailTemplatePropsError from "@/lib/error/BadEmailTemplatePropsError";
import {
  SECURITY_ALERT_EVENT_COPY,
  SECURITY_ALERT_EVENT_TYPES,
} from "@/email-templates/security-alert";

describe("security-alert", () => {
  const template = new SecurityAlert();

  for (const eventType of SECURITY_ALERT_EVENT_TYPES) {
    test(`accepts and renders eventType '${eventType}'`, async () => {
      const props = {
        name: "Jane",
        eventType,
        productName: "Acme",
        secureAccountUrl: "https://auth.example.com/mfa",
      };
      expect(template.validateProps(props)).toBe(true);
      const text = await template.renderPlainTextVersion(props);
      expect(text).toContain(SECURITY_ALERT_EVENT_COPY[eventType].heading);
      expect(text).toContain(
        `${SECURITY_ALERT_EVENT_COPY[eventType].primaryLabel}: https://auth.example.com/mfa`,
      );
    });
  }

  test("rejects an unknown eventType", () => {
    expect(() =>
      template.validateProps({ name: "Jane", eventType: "mfa-something" }),
    ).toThrow(BadEmailTemplatePropsError);
  });

  // The auth server used to send `{ action, summary }`. Rendered without a
  // name or event type that would read as a "new sign-in" alert, so the
  // payload must keep being refused.
  test("rejects the legacy { action, summary } payload", () => {
    expect(() =>
      template.validateProps({
        action: "enabled",
        summary: "Multi-factor authentication was just enabled.",
      }),
    ).toThrow(BadEmailTemplatePropsError);
  });

  test("the administrator reset replaces the callout copy", async () => {
    const text = await template.renderPlainTextVersion({
      name: "Jane",
      eventType: "mfa-reset-by-admin",
    });
    expect(text).toContain("Didn't ask for this?");
    expect(text).not.toContain("Didn't recognize this?");
  });
});
