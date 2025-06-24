"use client";

import { useRequireAuth } from "~/hooks/use-auth";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  fallback,
  redirectTo = "/signin",
}: ProtectedRouteProps) {
  const { session, status } = useRequireAuth(redirectTo);

  if (status === "loading") {
    return fallback || <LoadingSkeleton />;
  }

  if (!session) {
    return null; // useRequireAuth will handle the redirect
  }

  return <>{children}</>;
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
