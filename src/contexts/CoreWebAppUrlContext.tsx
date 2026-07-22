"use client";

import {
  createContext,
  useContext,
  type PropsWithChildren,
  type ReactElement,
} from "react";

/**
 * URL of the brand's main web app (used e.g. for the Nav wordmark link).
 * Resolved server-side from the BRAND_URL environment variable in the root
 * layout and threaded to client components through this context.
 */
const CoreWebAppUrlContext = createContext<string | null>(null);

export type CoreWebAppUrlProviderProps = PropsWithChildren<{
  url: string;
}>;

export function CoreWebAppUrlProvider({
  url,
  children,
}: CoreWebAppUrlProviderProps): ReactElement {
  return (
    <CoreWebAppUrlContext.Provider value={url}>
      {children}
    </CoreWebAppUrlContext.Provider>
  );
}

export function useCoreWebAppUrl(): string {
  const url = useContext(CoreWebAppUrlContext);
  if (!url) {
    throw new Error(
      "useCoreWebAppUrl must be used within a <CoreWebAppUrlProvider> render tree!",
    );
  }
  return url;
}
