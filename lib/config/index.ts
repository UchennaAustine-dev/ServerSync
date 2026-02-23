/**
 * Configuration Module
 *
 * Exports all configuration utilities for the ServeSync client application.
 */

export { queryClient, queryKeys, staleTimeConfig } from "./query-client";
export {
  default as env,
  getApiUrl,
  getWsUrl,
  getStripeKey,
  isStripeConfigured,
  type EnvConfig,
} from "./env";
