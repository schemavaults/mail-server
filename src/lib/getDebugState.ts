import {
  getAppEnvironment,
  type SchemaVaultsAppEnvironment,
} from "@schemavaults/app-definitions";
import isPrivateBeta from "./isPrivateBeta";

export function getDebugState(
  environment: SchemaVaultsAppEnvironment = getAppEnvironment(),
  private_beta_mode_enabled: boolean = isPrivateBeta(),
): boolean {
  if (private_beta_mode_enabled) {
    return true;
  }

  if (environment !== "production") {
    return true;
  }

  return false;
}
