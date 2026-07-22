"use client";

import type { BrandConfig } from "@/lib/branding";
import {
  createContext,
  useContext,
  type PropsWithChildren,
  type ReactElement,
} from "react";

/**
 * White-label brand configuration (name, URLs, colors, footer links).
 * Resolved server-side from BRAND_* environment variables in the root layout
 * and threaded to client components through this context.
 */
const BrandingContext = createContext<BrandConfig | null>(null);

export type BrandingProviderProps = PropsWithChildren<{
  branding: BrandConfig;
}>;

export function BrandingProvider({
  branding,
  children,
}: BrandingProviderProps): ReactElement {
  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding(): BrandConfig {
  const branding = useContext(BrandingContext);
  if (!branding) {
    throw new Error(
      "useBranding must be used within a <BrandingProvider> render tree!",
    );
  }
  return branding;
}
