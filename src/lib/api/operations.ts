import "server-only";

import type { AnyOperationDefinition } from "@schemavaults/openapi-operations";

// Every operation this mail server exposes, each defined in an
// `operations.ts` beside the route.ts serving it (src/app/api/**). This
// catalogue feeds both the OpenAPI document (./document.ts) and the shared
// operations runtime (./app.ts), which refuses to serve an operation missing
// from it; the route-layout test (./__tests__/routes.test.ts) fails for an
// operation file or route.ts not reflected here. Order = document order.
import { sendEmail } from "@/app/api/send/operations";
import {
  listMailingLists,
  createMailingList,
} from "@/app/api/mailing-lists/operations";
import { joinMailingList } from "@/app/api/mailing-lists/join/operations";
import { confirmSubscription } from "@/app/api/mailing-lists/confirm/operations";
import { unsubscribeFromMailingList } from "@/app/api/mailing-lists/unsubscribe/operations";
import { listSubscribers } from "@/app/api/mailing-lists/subscribers/operations";
import { listEmailTemplates } from "@/app/api/templates/operations";
import { listTestEmails } from "@/app/api/test-emails/operations";
import { getTestEmail } from "@/app/api/test-emails/[test_email_id]/operations";
import { getBrandingAsset } from "@/app/api/branding/[asset_kind]/operations";
import { listApiKeys, createApiKey } from "@/app/api/admin/api-keys/operations";
import {
  updateApiKey,
  revokeApiKey,
} from "@/app/api/admin/api-keys/[api_key_id]/operations";
import {
  listApiKeyAllowlist,
  addApiKeyAllowlistEntry,
  removeApiKeyAllowlistEntry,
} from "@/app/api/admin/api-keys/[api_key_id]/allowlist/operations";
import {
  listApiKeyRecipients,
  addApiKeyRecipient,
  removeApiKeyRecipient,
} from "@/app/api/admin/api-keys/[api_key_id]/recipients/operations";
import {
  listApiKeySenders,
  addApiKeySender,
  removeApiKeySender,
} from "@/app/api/admin/api-keys/[api_key_id]/senders/operations";
import {
  listApiKeyTransports,
  addApiKeyTransport,
  removeApiKeyTransport,
} from "@/app/api/admin/api-keys/[api_key_id]/transports/operations";
import {
  uploadBrandingAsset,
  removeBrandingAsset,
} from "@/app/api/admin/branding/[asset_kind]/operations";
import {
  listCorsOrigins,
  addCorsOrigin,
} from "@/app/api/admin/cors-origins/operations";
import { removeCorsOrigin } from "@/app/api/admin/cors-origins/[cors_origin_id]/operations";
import { listTemplateIds } from "@/app/api/admin/templates/operations";
import {
  previewTemplateWithSampleProps,
  previewTemplate,
} from "@/app/api/admin/templates/preview/operations";
import { listTransports } from "@/app/api/admin/transports/operations";
import { updateTransport } from "@/app/api/admin/transports/[transport_id]/operations";

export const MAIL_SERVER_OPERATIONS: readonly AnyOperationDefinition[] = [
  sendEmail,
  listMailingLists,
  createMailingList,
  joinMailingList,
  confirmSubscription,
  unsubscribeFromMailingList,
  listSubscribers,
  listEmailTemplates,
  listTestEmails,
  getTestEmail,
  getBrandingAsset,
  listApiKeys,
  createApiKey,
  updateApiKey,
  revokeApiKey,
  listApiKeyAllowlist,
  addApiKeyAllowlistEntry,
  removeApiKeyAllowlistEntry,
  listApiKeyRecipients,
  addApiKeyRecipient,
  removeApiKeyRecipient,
  listApiKeySenders,
  addApiKeySender,
  removeApiKeySender,
  listApiKeyTransports,
  addApiKeyTransport,
  removeApiKeyTransport,
  uploadBrandingAsset,
  removeBrandingAsset,
  listCorsOrigins,
  addCorsOrigin,
  removeCorsOrigin,
  listTemplateIds,
  previewTemplateWithSampleProps,
  previewTemplate,
  listTransports,
  updateTransport,
];
