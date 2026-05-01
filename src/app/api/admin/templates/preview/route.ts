import "server-only";

import { withAdminApiRouteGuard } from "@/lib/withAdminRouteGuard";
import EmailTemplatesCatalog, {
  isValidTemplateId,
} from "@/lib/EmailTemplatesCatalog";
import { render } from "@react-email/render";
import { type NextRequest, NextResponse } from "next/server";
import type { ReactElement } from "react";

const sampleProps: Record<string, Record<string, unknown>> = {
  "magic-link-sign-in": {
    magicLinkUrl:
      "https://schemavaults.com/auth/magic-link?token=example-magic-link-token-please-replace-in-production",
    recipientEmail: "jane@acme.co",
    recipientName: "Jane",
    oneTimeCode: "742-918",
    expiresInMinutes: 15,
    device: "MacBook Pro",
    browser: "Chrome 134",
    location: "San Francisco, CA",
    ipAddress: "203.0.113.42",
    requestedAt: "Apr 28, 2026 09:14 UTC",
    productName: "SchemaVaults",
    supportEmail: "support@schemavaults.com",
  },
  "mailing-list-confirmation": {
    mailingListName: "SchemaVaults Product Updates",
    confirmationUrl:
      "https://schemavaults.com/mailing-lists/confirm?token=example-token",
    mailingListDescription:
      "Monthly product updates, new schema releases, and ecosystem highlights from the SchemaVaults team.",
    subscriberEmail: "jane@acme.co",
    expiresAt: "May 4, 2026 17:00 UTC",
    senderOrganization: "SchemaVaults",
    productName: "SchemaVaults",
    supportEmail: "support@schemavaults.com",
  },
  "my-test-email": { name: "Jane Doe" },
  "password-reset": {
    resetLink: "https://example.com/reset?token=sample-token",
    expiresInMinutes: 30,
  },
  "payment-receipt": {
    recipientName: "Jane Doe",
    receiptNumber: "INV-2026-001234",
    amountTotal: "$31.30 USD",
    paymentDate: "May 1, 2026 09:14 UTC",
    planName: "Pro (annual)",
    billingPeriod: "May 1, 2026 – Jun 1, 2026",
    paymentMethod: "Visa ending in 4242",
    lineItems: [
      { description: "SchemaVaults Pro plan — monthly", amount: "$29.00" },
      { description: "Additional team seats (2 × $5/seat)", amount: "$10.00" },
      { description: "Promotional credit applied", amount: "-$10.00" },
    ],
    subtotal: "$29.00 USD",
    taxAmount: "$2.30 USD",
    nextBillingDate: "Jun 1, 2026",
    viewReceiptUrl:
      "https://schemavaults.com/account/billing/receipts/INV-2026-001234",
    manageBillingUrl: "https://schemavaults.com/account/billing",
    productName: "SchemaVaults",
    supportEmail: "support@schemavaults.com",
  },
  "verify-email": {
    url: "https://example.com/verify?token=sample-token",
    welcomeMessage: "Welcome to SchemaVaults!",
  },
  welcome: {
    name: "Jane Doe",
    productName: "SchemaVaults",
    ctaUrl: "https://schemavaults.com/dashboard",
    ctaLabel: "Open your dashboard",
    highlights: [
      "Browse curated schemas in the SchemaVaults library",
      "Vault your own schemas to share with your team",
      "Plug the schemas into your pipeline via the SchemaVaults SDK",
    ],
    supportEmail: "support@schemavaults.com",
  },
  "security-alert": {
    name: "Jane Doe",
    eventType: "new-sign-in",
    device: "MacBook Pro",
    browser: "Chrome 126",
    location: "San Francisco, CA",
    ipAddress: "203.0.113.42",
    eventTime: "Apr 19, 2026 10:30 UTC",
    secureAccountUrl: "https://schemavaults.com/account/security",
    productName: "SchemaVaults",
    supportEmail: "support@schemavaults.com",
  },
  "team-invitation": {
    inviteeName: "Jane Doe",
    inviterName: "Alex Kim",
    inviterEmail: "alex@acme.co",
    teamName: "Acme Platform",
    teamDescription:
      "The data platform team at Acme — we publish and curate schemas for the event pipeline.",
    role: "Editor",
    acceptInviteUrl:
      "https://schemavaults.com/invitations/accept?token=example-token",
    expiresAt: "Apr 27, 2026 17:00 UTC",
    productName: "SchemaVaults",
    supportEmail: "support@schemavaults.com",
  },
  "team-invitation-accepted": {
    inviterName: "Alex Kim",
    accepterName: "Jane Doe",
    accepterEmail: "jane@acme.co",
    teamName: "Acme Platform",
    teamDescription:
      "The data platform team at Acme — we publish and curate schemas for the event pipeline.",
    role: "Editor",
    acceptedAt: "Apr 20, 2026 14:32 UTC",
    teamUrl: "https://schemavaults.com/teams/acme-platform",
    productName: "SchemaVaults",
    supportEmail: "support@schemavaults.com",
  },
  "trial-ending": {
    recipientName: "Jane Doe",
    daysRemaining: 3,
    trialEndsAt: "May 2, 2026 23:59 UTC",
    currentPlan: "Pro trial",
    upgradePlanName: "Pro",
    upgradePlanPrice: "$29 / month",
    upgradeUrl: "https://schemavaults.com/billing/upgrade?plan=pro",
    manageBillingUrl: "https://schemavaults.com/account/billing",
    featuresAtRisk: [
      "Private vaults beyond the free-tier limit",
      "Schema-evolution diff history older than 7 days",
      "Team seats above 3 collaborators",
      "API request quota above 1,000 requests/day",
    ],
    productName: "SchemaVaults",
    supportEmail: "support@schemavaults.com",
  },
};

async function renderTemplateToHtml(
  templateId: string,
  props: Record<string, unknown>,
): Promise<{ ok: true; html: string } | { ok: false; status: number; error: string }> {
  if (!isValidTemplateId(templateId)) {
    return { ok: false, status: 400, error: "Invalid or missing template_id" };
  }

  const catalogEntryLoader = EmailTemplatesCatalog[templateId];
  const CatalogEntry = await catalogEntryLoader();
  const template = new CatalogEntry();

  try {
    const rendered = (await template.renderTemplate(
      props as any,
    )) as ReactElement;
    const html = await render(rendered);
    return { ok: true, html };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to render template";
    return { ok: false, status: 400, error: message };
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const protected_route = await withAdminApiRouteGuard(
    async function GET_handler({ req }): Promise<NextResponse> {
      const templateId = req.nextUrl.searchParams.get("template_id");
      if (!templateId) {
        return NextResponse.json(
          { success: false, error: "Invalid or missing template_id" },
          { status: 400 },
        );
      }

      const props = sampleProps[templateId] ?? {};
      const result = await renderTemplateToHtml(templateId, props);
      if (!result.ok) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: result.status },
        );
      }

      return new NextResponse(result.html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    },
  );
  return await protected_route(req);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const protected_route = await withAdminApiRouteGuard(
    async function POST_handler({ req }): Promise<NextResponse> {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json(
          { success: false, error: "Request body must be valid JSON." },
          { status: 400 },
        );
      }

      if (typeof body !== "object" || body === null) {
        return NextResponse.json(
          { success: false, error: "Request body must be a JSON object." },
          { status: 400 },
        );
      }

      const { template_id, props } = body as {
        template_id?: unknown;
        props?: unknown;
      };

      if (typeof template_id !== "string") {
        return NextResponse.json(
          { success: false, error: "Missing or invalid 'template_id'." },
          { status: 400 },
        );
      }

      const propsObject: Record<string, unknown> =
        props && typeof props === "object" && !Array.isArray(props)
          ? (props as Record<string, unknown>)
          : {};

      const result = await renderTemplateToHtml(template_id, propsObject);
      if (!result.ok) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: result.status },
        );
      }

      return new NextResponse(result.html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    },
  );
  return await protected_route(req);
}
