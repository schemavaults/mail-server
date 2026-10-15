"use client";

import {
  createContext,
  useCallback,
  useContext,
  type PropsWithChildren,
  type ReactElement,
} from "react";
import { formatDate, formatDateTime } from "@/lib/time-zone";

/**
 * The deployment's default time zone (DEPLOYMENT_SETTINGS, set at
 * /admin/settings), loaded by the admin layout and threaded to the admin
 * pages' client components. Null when no admin has set one: times are then
 * shown in each viewer's browser time zone.
 */
const DeploymentTimeZoneContext = createContext<string | null>(null);

export type DeploymentTimeZoneProviderProps = PropsWithChildren<{
  timeZone: string | null;
}>;

export function DeploymentTimeZoneProvider({
  timeZone,
  children,
}: DeploymentTimeZoneProviderProps): ReactElement {
  return (
    <DeploymentTimeZoneContext.Provider value={timeZone}>
      {children}
    </DeploymentTimeZoneContext.Provider>
  );
}

/** The deployment's default time zone, or null when none is set. */
export function useDeploymentTimeZone(): string | null {
  return useContext(DeploymentTimeZoneContext);
}

export interface TimestampFormatters {
  /** Date and time with the zone's abbreviation. */
  formatDateTime: (value: number) => string;
  /** Date only. */
  formatDate: (value: number) => string;
}

/**
 * Formats timestamps in the deployment's default time zone, or in the
 * browser's own when none is set.
 */
export function useTimestampFormatters(): TimestampFormatters {
  const timeZone = useDeploymentTimeZone() ?? undefined;
  return {
    formatDateTime: useCallback(
      (value: number) => formatDateTime(value, timeZone),
      [timeZone],
    ),
    formatDate: useCallback(
      (value: number) => formatDate(value, timeZone),
      [timeZone],
    ),
  };
}
