"use server";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCheckoutUrl } from "~/lib/lemonsqueezy";

/**
 * Securely creates a LemonSqueezy checkout URL from a server action.
 */
export async function createCheckoutAction({
  variantId,
}: {
  variantId: string;
}): Promise<{ error: string | null; checkoutUrl: string | null }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Not authenticated", checkoutUrl: null };
    }

    const userId = String(session.user.id); // ensure it's a string
    const userEmail = session.user.email ?? "";

    const checkoutUrl = await createCheckoutUrl({
      variantId,
      userId,
      userEmail,
      embed: false,
    });

    if (!checkoutUrl) {
      return { error: "Failed to create checkout URL", checkoutUrl: null };
    }

    return { error: null, checkoutUrl };
  } catch (error) {
    console.error("Error creating LemonSqueezy checkout:", error);
    return { error: "Internal server error", checkoutUrl: null };
  }
}

/**
 * Fetches the current user's credit balance.
 */
export async function getUserCreditsBalance(): Promise<{
  credits: number;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { credits: 0, error: "Not authenticated" };
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    return { credits: user?.credits ?? 0 };
  } catch (error) {
    console.error("Error fetching credits:", error);
    return { credits: 0, error: "Failed to fetch credits" };
  }
}

/**
 * Retrieves the user's LemonSqueezy order history.
 */
export async function getUserOrderHistory(): Promise<{
  orders: any[];
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { orders: [], error: "Not authenticated" };
  }

  try {
    const orders = await db.lemonSqueezyOrder.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return { orders };
  } catch (error) {
    console.error("Error fetching order history:", error);
    return { orders: [], error: "Failed to fetch order history" };
  }
}

/**
 * Deducts credits from the user's account and logs the transaction.
 */
export async function consumeCredits(
  amount: number,
  description?: string,
): Promise<{
  success: boolean;
  creditsConsumed?: number;
  newBalance?: number;
  error?: string;
  currentBalance?: number;
  required?: number;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  if (amount <= 0) {
    return { success: false, error: "Invalid credit amount" };
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.credits < amount) {
      return {
        success: false,
        error: "Insufficient credits",
        currentBalance: user.credits,
        required: amount,
      };
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: amount } },
    });

    console.log(
      `User ${session.user.id} consumed ${amount} credits. Reason: ${description ?? "N/A"}`
    );

    revalidatePath("/billing");

    return {
      success: true,
      creditsConsumed: amount,
      newBalance: user.credits - amount,
    };
  } catch (error) {
    console.error("Error consuming credits:", error);
    return { success: false, error: "Failed to consume credits" };
  }
}

/**
 * Force a redirect to billing page.
 */
export async function redirectToBilling() {
  redirect("/billing");
}

/**
 * Checks if the user has at least the required amount of credits.
 */
export async function checkCreditsBalance(
  requiredCredits: number,
): Promise<{
  sufficient: boolean;
  currentBalance?: number;
  required?: number;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { sufficient: false, error: "Not authenticated" };
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user) {
      return { sufficient: false, error: "User not found" };
    }

    return {
      sufficient: user.credits >= requiredCredits,
      currentBalance: user.credits,
      required: requiredCredits,
    };
  } catch (error) {
    console.error("Error checking credit balance:", error);
    return { sufficient: false, error: "Failed to check balance" };
  }
}
