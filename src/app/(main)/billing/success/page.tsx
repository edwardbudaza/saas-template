import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default async function BillingSuccessPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Get updated user with credit balance
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      credits: true,
      orders: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!user) {
    redirect("/signin");
  }

  const latestOrder = user.orders[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <CardTitle className="text-3xl text-green-600">
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-lg">
              Your credits have been added to your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-lg bg-blue-50 p-6">
              <h3 className="mb-2 text-xl font-semibold text-blue-900">
                Current Balance
              </h3>
              <div className="text-3xl font-bold text-blue-600">
                {user.credits.toLocaleString()} credits
              </div>
            </div>

            {latestOrder && (
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 font-semibold text-gray-900">
                  Latest Purchase
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>
                    Credits Added:{" "}
                    <span className="font-medium text-green-600">
                      +{latestOrder.credits}
                    </span>
                  </div>
                  <div>
                    Date: {new Date(latestOrder.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-gray-600">
                🎉 Thank you for your purchase! Your credits are now available
                and ready to use.
              </p>

              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/">Start Using Credits</Link>
                </Button>

                <Button variant="outline" asChild>
                  <Link href="/billing">Buy More Credits</Link>
                </Button>
              </div>
            </div>

            <div className="mt-6 border-t pt-4">
              <p className="text-xs text-gray-500">
                Need help? Contact our support team if you have any questions
                about your purchase.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
