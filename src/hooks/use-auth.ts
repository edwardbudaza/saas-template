"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Hook to require authentication
export function useRequireAuth(redirectTo = "/signin") {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) router.push(redirectTo);
  }, [session, status, router, redirectTo]);

  return { session, status };
}

// Hook to redirect authenticated users
export function useRedirectIfAuthenticated(redirectTo = "/") {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (session) router.push(redirectTo);
  }, [session, status, router, redirectTo]);

  return { session, status };
}

// Hook to get user data with loading state
export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    session,
    isLoading: status === "loading",
    isAuthenticated: !!session,
  };
}

// Hook for protected actions that require authentication
export function useAuthAction() {
  const { data: session } = useSession();
  const router = useRouter();

  const executeIfAuthenticated = (action: () => void | Promise<void>) => {
    if (!session) {
      router.push("/signin");
      return;
    }
    return action();
  };

  return { executeIfAuthenticated, isAuthenticated: !!session };
}
