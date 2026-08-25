/**
 * OpenAPI tags shared by the per-route registrations, so related routes
 * group together in the rendered docs.
 */
export const OPENAPI_TAGS = {
  send: "Send",
  mailingLists: "Mailing Lists",
  templates: "Templates",
  branding: "Branding",
  adminApiKeys: "Admin: API Keys",
  adminBranding: "Admin: Branding",
  adminCors: "Admin: CORS",
  adminTemplates: "Admin: Templates",
  adminTransports: "Admin: Transports",
  meta: "Meta",
} as const;

/** Tag descriptions for the document's top-level `tags` list. */
export const OPENAPI_TAG_DEFINITIONS: { name: string; description: string }[] =
  [
    {
      name: OPENAPI_TAGS.send,
      description:
        "Send transactional or mailing-list email through a configured transport.",
    },
    {
      name: OPENAPI_TAGS.mailingLists,
      description:
        "Mailing lists, double-opt-in subscriptions, and unsubscribes.",
    },
    {
      name: OPENAPI_TAGS.templates,
      description: "The react-email template catalog.",
    },
    {
      name: OPENAPI_TAGS.branding,
      description: "Public white-label branding assets (logo, favicon).",
    },
    {
      name: OPENAPI_TAGS.adminApiKeys,
      description:
        "Manage API keys and their audience, sender, and transport scopes (admin only).",
    },
    {
      name: OPENAPI_TAGS.adminBranding,
      description: "Upload or remove white-label branding assets (admin only).",
    },
    {
      name: OPENAPI_TAGS.adminCors,
      description:
        "Manage the CORS origin allowlist for public API routes (admin only).",
    },
    {
      name: OPENAPI_TAGS.adminTemplates,
      description: "Inspect and preview email templates (admin only).",
    },
    {
      name: OPENAPI_TAGS.adminTransports,
      description: "Inspect configured mail transports (admin only).",
    },
    {
      name: OPENAPI_TAGS.meta,
      description: "API metadata (this OpenAPI document).",
    },
  ];
