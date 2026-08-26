/**
 * Public base URL of this mail server, used to build absolute links embedded
 * in emails and the server list in the OpenAPI document. Configured via the
 * HOST environment variable (with or without a scheme; https is assumed when
 * omitted). Falls back to localhost with the dev server's PORT when unset.
 */
export function getMailServerBaseUrl(): string {
  const host = process.env.HOST;
  if (typeof host === "string" && host.length > 0) {
    return new URL(host.includes("://") ? host : `https://${host}`).origin;
  }
  return `http://localhost:${process.env.PORT ?? "3000"}`;
}

export default getMailServerBaseUrl;
