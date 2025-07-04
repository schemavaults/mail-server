export function isPrivateBeta(): boolean {
  try {
    if (
      !!process.env.SCHEMAVAULTS_PRIVATE_BETA &&
      typeof process.env.SCHEMAVAULTS_PRIVATE_BETA === "string" &&
      process.env.SCHEMAVAULTS_PRIVATE_BETA.includes("true")
    ) {
      return true;
    }
  } catch (e: unknown) {
    /** no-op */
  }

  if (
    !!process.env.NEXT_PUBLIC_SCHEMAVAULTS_PRIVATE_BETA &&
    typeof process.env.NEXT_PUBLIC_SCHEMAVAULTS_PRIVATE_BETA === "string" &&
    process.env.NEXT_PUBLIC_SCHEMAVAULTS_PRIVATE_BETA.includes("true")
  ) {
    return true;
  }

  return false;
}

export default isPrivateBeta;
