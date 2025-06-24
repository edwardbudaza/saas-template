import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { authConfig } from "~/server/auth/config";
import { SignInForm } from "~/components/auth/signin-form";

export default async function SignInPage() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <div className="from-background to-muted/20 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <div className="w-full max-w-md">
        <SignInForm />
      </div>
    </div>
  );
}
