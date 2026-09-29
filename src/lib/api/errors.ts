import { OperationError } from "@schemavaults/openapi-operations";

// Handler-side errors, thrown to short-circuit an operation with the
// runtime's `{ success: false, error, message }` envelope:
//
//   if (!key) throw notFound(`No active API key found with ID: '${id}'.`);
//
// `error` is a stable machine-readable code; `message` is shown to people.

export function badRequest(message: string, error = "bad_request") {
  return new OperationError(400, { error, message });
}

export function forbidden(message: string, error = "forbidden") {
  return new OperationError(403, { error, message });
}

export function notFound(message: string, error = "not_found") {
  return new OperationError(404, { error, message });
}

export function conflict(message: string, error = "conflict") {
  return new OperationError(409, { error, message });
}

export function gone(message: string, error = "gone") {
  return new OperationError(410, { error, message });
}

export function internalError(
  message: string,
  error = "internal_server_error",
) {
  return new OperationError(500, { error, message });
}
