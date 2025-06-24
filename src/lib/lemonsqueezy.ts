// src/lib/lemonsqueezy.ts

import {
  lemonSqueezySetup,
  createCheckout,
} from "@lemonsqueezy/lemonsqueezy.js";

// Initialize LemonSqueezy API
export async function configureLemonSqueezy() {
  const requiredVars = [
    "LEMONSQUEEZY_API_KEY",
    "LEMONSQUEEZY_STORE_ID",
    "LEMONSQUEEZY_WEBHOOK_SECRET",
    "LEMONSQUEEZ_SMALL_VARIANT_ID",
    "LEMONSQUEEZ_MEDIUM_VARIANT_ID",
    "LEMONSQUEEZ_LARGE_VARIANT_ID",
  ];

  const missingVars = requiredVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    return {
      error: `Missing required env variables: ${missingVars.join(", ")}`,
    };
  }

  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY!,
  });

  return { error: null };
}

// Credit pack configurations
export const CREDIT_PACKS = {
  small: {
    name: "Small Pack",
    credits: 50,
    price: 9.99,
    description: "Perfect for getting started",
    popular: false,
    variantId: process.env.LEMONSQUEEZ_SMALL_VARIANT_ID!,
  },
  medium: {
    name: "Medium Pack",
    credits: 150,
    price: 24.99,
    description: "Most popular choice",
    popular: true,
    variantId: process.env.LEMONSQUEEZ_MEDIUM_VARIANT_ID!,
  },
  large: {
    name: "Large Pack",
    credits: 500,
    price: 69.99,
    description: "For power users",
    popular: false,
    variantId: process.env.LEMONSQUEEZ_LARGE_VARIANT_ID!,
  },
} as const;

export type CreditPackKey = keyof typeof CREDIT_PACKS;

// ✅ Create checkout URL with user ID/email and log the full payload
export async function createCheckoutUrl({
  variantId,
  userEmail,
  userId,
  embed = false,
}: {
  variantId: string;
  userEmail: string;
  userId: string;
  embed?: boolean;
}) {
  const { error } = await configureLemonSqueezy();
  if (error) {
    console.error("❌ LemonSqueezy config error:", error);
    return null;
  }

  const storeId = process.env.LEMONSQUEEZY_STORE_ID!;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // Build the payload
  const payload = {
    checkoutOptions: {
      embed,
      media: false,
      logo: !embed,
    },
    checkoutData: {
      email: userEmail,
      custom: {
        user_id: userId,
      },
    },
    productOptions: {
      enabledVariants: [parseInt(variantId)],
      redirectUrl: `${baseUrl}/billing/success`,
      receiptButtonText: "Go to Dashboard",
      receiptThankYouNote: "Thank you for your purchase!",
    },
  };

  // ✅ Log payload before sending to LemonSqueezy
  console.log("🟡 Sending checkout payload to LemonSqueezy:");
  console.dir({ storeId, variantId, ...payload }, { depth: null });

  try {
    const checkout = await createCheckout(storeId, variantId, payload);

    const url = checkout.data?.data?.attributes?.url;
    if (!url) {
      console.error("❌ Failed to get checkout URL from LemonSqueezy response.");
      return null;
    }

    return url;
  } catch (err) {
    console.error("❌ Checkout creation failed:", err);
    return null;
  }
}

// 🔢 Match dollar amount to credits
export function calculateCreditsFromAmount(amountInCents: number): number {
  const dollars = amountInCents / 100;

  for (const pack of Object.values(CREDIT_PACKS)) {
    if (Math.abs(pack.price - dollars) < 0.01) {
      return pack.credits;
    }
  }

  return Math.floor(dollars); // fallback: $1 = 1 credit
}

// 🛡️ Ensure required env vars exist at runtime
export function validateLemonSqueezyConfig() {
  const required = [
    "LEMONSQUEEZY_API_KEY",
    "LEMONSQUEEZY_STORE_ID",
    "LEMONSQUEEZY_WEBHOOK_SECRET",
    "NEXT_PUBLIC_BASE_URL",
  ];

  const missing = required.filter((env) => !process.env[env]);
  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }
}
