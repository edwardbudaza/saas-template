import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { authConfig } from "~/server/auth/config";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export async function AuthGuard({
  children,
  redirectTo = "/signin",
  requireAuth = true,
}: AuthGuardProps) {
  const session = await auth();

  if (requireAuth && !session) {
    redirect(redirectTo);
  }

  if (!requireAuth && session) {
    redirect("/");
  }

  return <>{children}</>;
}
