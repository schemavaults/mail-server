import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/zod-openapi";
import {
  jsonRequestBody,
  jsonResponse,
  errorResponses,
  successDataResponseSchema,
  adminAuthSecurity,
  OPENAPI_TAGS,
} from "@/lib/openapi";
import {
  mailingListDefinition,
  createMailingListRequestBodySchema,
} from "@/lib/mailing-list-definition";

const createMailingListSuccessSchema = z
  .object({
    success: z.literal(true),
    message: z.string(),
    resource_id: z.string().uuid().openapi({
      description: "ID of the newly created mailing list.",
    }),
  })
  .openapi("CreateMailingListSuccessResponse");

export function registerMailingListsPaths(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: "get",
    path: "/api/mailing-lists",
    tags: [OPENAPI_TAGS.mailingLists],
    summary: "List mailing lists",
    description:
      "Public directory of mailing lists. Anonymous callers only see public lists; an optional admin bearer token widens the listing to private ones.",
    responses: {
      200: jsonResponse(
        "The mailing lists visible to the caller.",
        successDataResponseSchema(z.array(mailingListDefinition)),
      ),
      ...errorResponses({ 500: "Failed to list mailing lists." }),
    },
  });

  registry.registerPath({
    method: "post",
    path: "/api/mailing-lists",
    tags: [OPENAPI_TAGS.mailingLists],
    summary: "Create a mailing list",
    security: adminAuthSecurity,
    request: {
      body: jsonRequestBody(createMailingListRequestBodySchema),
    },
    responses: {
      200: jsonResponse(
        "The mailing list was created.",
        createMailingListSuccessSchema,
      ),
      ...errorResponses({
        400: "Invalid request body.",
        401: "Missing or invalid admin credentials.",
        500: "Failed to create the mailing list.",
      }),
    },
  });
}
