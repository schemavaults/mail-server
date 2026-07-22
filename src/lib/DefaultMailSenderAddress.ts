import { getDefaultMailFrom } from "@/lib/branding";

/**
 * Default From: header for outbound mail when the caller doesn't supply one.
 * Configured via the MAIL_FROM_ADDRESS / MAIL_FROM_NAME environment
 * variables (see .env.example).
 */
export const DefaultMailSenderAddress: string = getDefaultMailFrom();

export default DefaultMailSenderAddress;
