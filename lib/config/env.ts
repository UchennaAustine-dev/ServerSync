import { z } from "zod";

/**
 * Environment Configuration Schema
 *
 * This module validates and provides type-safe access to environment variables.
 * All environment variables are validated on application startup.
 */

// Define the environment schema using Zod
const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .url()
    .default("https://servesync-84s1.onrender.com")
    .describe("Backend API base URL"),

  NEXT_PUBLIC_WS_URL: z
    .string()
    .url()
    .default("wss://servesync-84s1.onrender.com")
    .describe("WebSocket server URL"),

  NEXT_PUBLIC_STRIPE_KEY: z
    .string()
    .optional()
    .describe("Stripe publishable key for payment processing"),

  NEXT_PUBLIC_LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error"])
    .default("info")
    .describe("Logging level for application logs"),
});

// Type inference from schema
export type EnvConfig = z.infer<typeof envSchema>;

// Parse and validate environment variables
let env: EnvConfig;

try {
  env = envSchema.parse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_STRIPE_KEY: process.env.NEXT_PUBLIC_STRIPE_KEY,
    NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
  });

  // Log configuration in development mode
  if (process.env.NODE_ENV === "development") {
    console.log("✓ Environment configuration loaded successfully");
    console.log("  API URL:", env.NEXT_PUBLIC_API_URL);
    console.log("  WebSocket URL:", env.NEXT_PUBLIC_WS_URL);
    console.log(
      "  Stripe Key:",
      env.NEXT_PUBLIC_STRIPE_KEY ? "Configured" : "Not configured",
    );
    console.log("  Log Level:", env.NEXT_PUBLIC_LOG_LEVEL);
  }
} catch (error) {
  // Log detailed error in development
  if (process.env.NODE_ENV === "development") {
    console.error("✗ Environment configuration error:");
    if (error instanceof z.ZodError) {
      error.issues.forEach((issue) => {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
      });
    } else {
      console.error(error);
    }
  }

  // Provide clear error message
  throw new Error(
    "Invalid environment configuration. Please check your environment variables.",
  );
}

/**
 * Get the API base URL
 * @returns The configured API base URL
 */
export function getApiUrl(): string {
  return env.NEXT_PUBLIC_API_URL;
}

/**
 * Get the WebSocket URL
 * @returns The configured WebSocket URL
 */
export function getWsUrl(): string {
  return env.NEXT_PUBLIC_WS_URL;
}

/**
 * Get the Stripe publishable key
 * @returns The configured Stripe key or undefined if not set
 */
export function getStripeKey(): string | undefined {
  return env.NEXT_PUBLIC_STRIPE_KEY;
}

/**
 * Check if Stripe is configured
 * @returns True if Stripe key is configured
 */
export function isStripeConfigured(): boolean {
  return !!env.NEXT_PUBLIC_STRIPE_KEY;
}

/**
 * Get the log level
 * @returns The configured log level
 */
export function getLogLevel(): string {
  return env.NEXT_PUBLIC_LOG_LEVEL;
}

// Export the validated environment configuration
export default env;
