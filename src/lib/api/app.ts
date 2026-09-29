import "server-only";

import {
  createOperationsAppFactory,
  operationHttpMethods,
  toNextRouteHandlers,
  type AnyOperationDefinition,
  type HttpMethod,
  type NextRouteHandler,
} from "@schemavaults/openapi-operations";
import { MAIL_SERVER_OPERATIONS } from "./operations";
import { mailServerAuthResolvers } from "./auth-resolvers";
import { corsMiddleware } from "./cors-middleware";
import type { MailServerUser } from "./define-operation";
import { getMailServerOpenApiDocument } from "./document";

/**
 * The operations runtime shared by every route file: the full catalogue
 * (so a route can only serve documented operations), the auth resolvers,
 * and error reporting for unexpected failures (answered with a generic 500).
 */
export const mailServerApi = createOperationsAppFactory<
  undefined,
  MailServerUser
>({
  operations: MAIL_SERVER_OPERATIONS,
  authResolvers: mailServerAuthResolvers,
  onError: (error, _c, { operation }) => {
    console.error(
      `[${operation.method.toUpperCase()} ${operation.path}] Unhandled error: `,
      error,
    );
  },
});

/** A route file's operations, keyed by the HTTP method each declares. */
export type RouteOperations = {
  readonly [M in Uppercase<HttpMethod>]?: AnyOperationDefinition;
};

type RouteHandlers<TKeys extends PropertyKey> = {
  readonly [K in TKeys]: NextRouteHandler;
};

/**
 * Next.js route handler exports for the operations served at one path. Each
 * route.ts is just:
 *
 *   export const { GET, POST } = serveOperations({
 *     GET: listApiKeys,
 *     POST: createApiKey,
 *   });
 *
 * Keying the operations by method keeps the exports and the operations in
 * lock-step (a mismatch throws at module load), so Next.js answers 405 for
 * every method no operation declares. `cors: true` applies the CORS origin
 * allowlist and additionally exports OPTIONS for preflights.
 */
export function serveOperations<const T extends RouteOperations>(
  operations: T,
  options?: { cors?: false },
): RouteHandlers<keyof T>;
export function serveOperations<const T extends RouteOperations>(
  operations: T,
  options: { cors: true },
): RouteHandlers<keyof T | "OPTIONS">;
export function serveOperations(
  operations: RouteOperations,
  options: { cors?: boolean } = {},
): RouteHandlers<string> {
  const served: AnyOperationDefinition[] = [];
  for (const [method, operation] of Object.entries(operations)) {
    if (operation === undefined) continue;
    if (operation.method.toUpperCase() !== method) {
      throw new TypeError(
        `${operation.operationId} declares ${operation.method.toUpperCase()} but is exported as ${method}!`,
      );
    }
    served.push(operation);
  }

  const methods: HttpMethod[] = operationHttpMethods(served);
  if (options.cors) methods.push("options");

  const app = mailServerApi.app(
    served,
    options.cors
      ? { configure: (routeApp) => void routeApp.use(corsMiddleware()) }
      : {},
  );
  return toNextRouteHandlers(app, methods);
}

/** Route handler exports serving the OpenAPI document at `path`. */
export function serveOpenApiDocument(path: string): RouteHandlers<"GET"> {
  return toNextRouteHandlers(
    mailServerApi.openApiDocumentApp({
      path,
      document: () => getMailServerOpenApiDocument(),
    }),
    ["get"],
  );
}
