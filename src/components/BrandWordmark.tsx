"use client";

import { useBranding } from "@/contexts/BrandingContext";
import { Wordmark } from "@schemavaults/ui";
import type { ReactElement } from "react";

export interface BrandWordmarkProps {
  className?: string;
}

/**
 * Brand-aware wrapper around the <Wordmark /> component: renders the
 * configured BRAND_NAME with the configured BRAND_PRIMARY_COLOR ->
 * BRAND_SECONDARY_COLOR gradient. Falls back to the component's built-in
 * theme gradient when no brand colors are configured.
 */
export function BrandWordmark({ className }: BrandWordmarkProps): ReactElement {
  const branding = useBranding();
  return (
    <Wordmark
      wordmarkText={branding.name}
      {...(branding.wordmarkGradient
        ? { gradientColors: branding.wordmarkGradient }
        : {})}
      className={className}
    />
  );
}

export default BrandWordmark;
