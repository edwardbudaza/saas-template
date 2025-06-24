import { auth } from "~/server/auth";
import { authConfig } from "~/server/auth/config";
import { db } from "~/server/db";

// Server-side utility to get current user
export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        credits: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

// Server-side utility to require authentication
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Authentication required");
  }

  return session;
}

// Utility to update user credits
export async function updateUserCredits(userId: string, credits: number) {
  try {
    const user = await db.user.update({
      where: { id: userId },
      data: { credits },
      select: { id: true, credits: true },
    });

    return user;
  } catch (error) {
    console.error("Error updating user credits:", error);
    throw new Error("Failed to update credits");
  }
}

// Utility to consume user credits
export async function consumeUserCredits(userId: string, amount = 1) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.credits < amount) {
      throw new Error("Insufficient credits");
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { credits: user.credits - amount },
      select: { id: true, credits: true },
    });

    return updatedUser;
  } catch (error) {
    console.error("Error consuming user credits:", error);
    throw error;
  }
}

// Utility to check if user has enough credits
export async function hasEnoughCredits(userId: string, required = 1) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    return user ? user.credits >= required : false;
  } catch (error) {
    console.error("Error checking user credits:", error);
    return false;
  }
}
