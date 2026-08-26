import { z } from "@/lib/zod-openapi";

// Shared by the /api/send enforcement path, the admin API routes, and the
// /admin/keys client view (for input validation) — deliberately NOT
// server-only.

const emailSchema = z.string().email();

function isValidSenderWildcard(entry: string): boolean {
  if (!entry.startsWith("*@")) return false;
  // Reuse zod's email validation for the domain part by substituting a
  // plain local part for the wildcard.
  return emailSchema.safeParse(`a${entry.slice(1)}`).success;
}

/**
 * One entry in an API key's allowed-senders list: a lowercase email address,
 * or a `*@domain` wildcard permitting any local part at that domain.
 */
export const allowedSenderEntrySchema = z
  .string()
  .trim()
  .toLowerCase()
  .refine(
    (entry) => emailSchema.safeParse(entry).success || isValidSenderWildcard(entry),
    {
      message:
        "Sender entry must be an email address (claude@example.com) or a domain wildcard (*@example.com).",
    },
  )
  .openapi({
    description:
      "A lowercase email address, or a `*@domain` wildcard permitting any local part at that domain.",
    example: "*@example.com",
  });

/**
 * Extracts the address part of a From: header value. Handles both a bare
 * address ("noreply@example.com") and the display-name form
 * ("SchemaVaults <noreply@example.com>") produced by getDefaultMailFrom().
 */
export function extractEmailAddress(from: string): string {
  const match = from.match(/<([^<>]+)>\s*$/);
  return (match?.[1] ?? from).trim();
}

/**
 * True iff `address` (a bare email address; display names are NOT accepted
 * here — run extractEmailAddress first) matches at least one allowlist
 * entry. Matching is case-insensitive; `*@domain` entries match any local
 * part at exactly that domain.
 */
export function senderMatchesAllowlist(
  address: string,
  entries: readonly string[],
): boolean {
  const normalized = address.trim().toLowerCase();
  const atIndex = normalized.lastIndexOf("@");
  if (atIndex < 0) return false;
  const domainPart = normalized.slice(atIndex + 1);
  return entries.some((rawEntry) => {
    const entry = rawEntry.trim().toLowerCase();
    if (entry.startsWith("*@")) {
      return domainPart === entry.slice(2);
    }
    return normalized === entry;
  });
}
