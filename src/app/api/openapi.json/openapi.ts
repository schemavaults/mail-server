import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "@/lib/zod-openapi";
import { OPENAPI_TAGS } from "@/lib/openapi";

export function registerOpenApiDocumentPaths(
  registry: OpenAPIRegistry,
): void {
  registry.registerPath({
    method: "get",
    path: "/api/openapi.json",
    tags: [OPENAPI_TAGS.meta],
    summary: "This OpenAPI document",
    description:
      "The OpenAPI 3.1 description of this mail server's API. Rendered interactively at /docs.",
    responses: {
      200: {
        description: "The OpenAPI document.",
        content: {
          "application/json": {
            schema: z.record(z.string(), z.unknown()).openapi({
              description: "An OpenAPI 3.1 document.",
            }),
          },
        },
      },
    },
  });
}
