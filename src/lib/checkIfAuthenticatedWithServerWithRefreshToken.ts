const isAuthenticatedEndpoint: string = "/api/auth/is-authenticated";

export async function checkIfAuthenticatedWithRefreshToken(): Promise<boolean> {
  try {
    const response = await fetch(isAuthenticatedEndpoint, {
      method: "GET",
    });
    if (!response.ok || response.status !== 200) {
      return false;
    }
    const body = await response.json();
    if (
      !body ||
      typeof body !== "object" ||
      !("authenticated" in body) ||
      typeof body.authenticated !== "boolean" ||
      !body.authenticated
    ) {
      return false;
    }

    return true;
  } catch (e: unknown) {
    throw new Error(
      `Failed to check if user is authenticated using endpoint: '${isAuthenticatedEndpoint}'`,
    );
  }
}

export default checkIfAuthenticatedWithRefreshToken;
