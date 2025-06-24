import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { authConfig } from "~/server/auth/config";
import { SignUpForm } from "~/components/auth/signup-form";

export default async function SignUpPage() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <div className="from-background to-muted/20 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <div className="w-full max-w-md">
        <SignUpForm />
      </div>
    </div>
  );
}
