export function loadResendApiKey(): string {
  const key: string | undefined = process.env.RESEND_API_KEY;
  if (!key || typeof key !== "string") {
    throw new Error(
      "Failed to load Resend API key from environment variable 'RESEND_API_KEY'!",
    );
  }
  return key;
}

export default loadResendApiKey;
