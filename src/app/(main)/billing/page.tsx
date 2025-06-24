import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { redirect } from "next/navigation";
import { PricingCards } from "~/components/billing/pricing-cards";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Get current user with credit balance
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      credits: true,
    },
  });

  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Choose Your Credit Pack
          </h1>
          <p className="mb-2 text-xl text-gray-600">
            Purchase credits to unlock premium features
          </p>
          <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2">
            <span className="text-sm font-medium text-blue-700">
              Current Balance:{" "}
              <span className="font-bold">{user.credits} credits</span>
            </span>
          </div>
        </div>

        {/* ✅ Pricing Cards - No longer passes userId as prop */}
        <PricingCards />

        {/* FAQ or Info Section */}
        <div className="mt-16 text-center">
          <h3 className="mb-6 text-2xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h3>
          <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
            <div className="text-left">
              <h4 className="mb-2 font-semibold text-gray-900">
                How do credits work?
              </h4>
              <p className="text-sm text-gray-600">
                Credits are used to access premium features. Each action
                consumes a certain number of credits based on complexity.
              </p>
            </div>
            <div className="text-left">
              <h4 className="mb-2 font-semibold text-gray-900">
                Do credits expire?
              </h4>
              <p className="text-sm text-gray-600">
                No, your credits never expire. Use them at your own pace
                whenever you need premium features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}