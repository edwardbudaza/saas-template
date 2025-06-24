import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  // Server-side env vars schema
  server: {
    // Updated for Auth.js v5 - use AUTH_SECRET instead of NEXTAUTH_SECRET
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    LEMONSQUEEZY_API_KEY: z.string(),
    LEMONSQUEEZY_STORE_ID: z.string(),
    LEMONSQUEEZY_WEBHOOK_SECRET: z.string().optional(),
    LEMONSQUEEZ_SMALL_VARIANT_ID: z.string(),
    LEMONSQUEEZ_MEDIUM_VARIANT_ID: z.string(),
    LEMONSQUEEZ_LARGE_VARIANT_ID: z.string(),
  },
  // Client-side env vars schema (must start with NEXT_PUBLIC_)
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().url(),
  },
  // Runtime environment variables extraction
  runtimeEnv: {
    // Updated for Auth.js v5
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    LEMONSQUEEZY_API_KEY: process.env.LEMONSQUEEZY_API_KEY,
    LEMONSQUEEZY_STORE_ID: process.env.LEMONSQUEEZY_STORE_ID,
    LEMONSQUEEZY_WEBHOOK_SECRET: process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
    LEMONSQUEEZ_SMALL_VARIANT_ID: process.env.LEMONSQUEEZ_SMALL_VARIANT_ID,
    LEMONSQUEEZ_MEDIUM_VARIANT_ID: process.env.LEMONSQUEEZ_MEDIUM_VARIANT_ID,
    LEMONSQUEEZ_LARGE_VARIANT_ID: process.env.LEMONSQUEEZ_LARGE_VARIANT_ID,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  // Skip env validation flag (useful for Docker)
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  // Treat empty strings as undefined
  emptyStringAsUndefined: true,
});
