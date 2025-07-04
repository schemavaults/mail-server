"use client";

import { getDebugState } from "@/lib/getDebugState";
import {
  type SchemaVaultsAppEnvironment,
  useAppEnvironment,
} from "./useAppEnvironment";

export function useDebug(): boolean {
  const environment: SchemaVaultsAppEnvironment = useAppEnvironment();
  return getDebugState(environment);
}

export default useDebug;
