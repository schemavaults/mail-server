import {
  mailingListDefinition,
  type MailingListDefinition,
} from "@/lib/mailing-list-definition";

export async function listMailingLists(): Promise<
  readonly MailingListDefinition[]
> {
  try {
    const response = await fetch("/api/mailing-lists", {
      method: "GET",
    });
    if (!response.ok || response.status !== 200) {
      throw new Error("Received error response trying to fetch mailing lists!");
    }
    const body = await response.json();
    if (typeof body !== "object" || !body) {
      throw new Error("Expected request body to be an object!");
    }
    if (!("success" in body) || !body.success) {
      throw new Error("Request body did not have success = true!");
    }
    if (!("data" in body) || !Array.isArray(body.data)) {
      throw new Error("Failed to find a 'data' array in success response.");
    }
    const parsed = await mailingListDefinition
      .array()
      .safeParseAsync(body.data);
    if (!parsed.success) {
      throw new Error(
        "Failed to parse mailing list definitions from server response!",
      );
    }
    return parsed.data;
  } catch (e: unknown) {
    console.error("Failed to list mailing lists:", e);
    throw new Error("Failed to list mailing lists!");
  }
}

export default listMailingLists;
