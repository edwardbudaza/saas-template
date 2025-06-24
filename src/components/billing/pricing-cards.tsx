import { CREDIT_PACKS } from "~/lib/lemonsqueezy";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { CheckoutForm } from "./checkout-form";

// ✅ No longer needs userId or userEmail props - handled server-side
interface PricingCardsProps {
  // Props removed for security - user data handled server-side
}

export function PricingCards({}: PricingCardsProps = {}) {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {Object.entries(CREDIT_PACKS).map(([key, pack]) => (
        <Card
          key={key}
          className={`relative ${
            pack.popular ? "scale-105 shadow-lg ring-2 ring-blue-500" : ""
          }`}
        >
          {pack.popular && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 transform bg-blue-500">
              Most Popular
            </Badge>
          )}
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{pack.name}</CardTitle>
            <CardDescription>{pack.description}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-4">
              <span className="text-4xl font-bold">${pack.price}</span>
              <span className="ml-1 text-gray-500">one-time</span>
            </div>
            <div className="mb-6">
              <span className="text-2xl font-semibold text-blue-600">
                {pack.credits.toLocaleString()}
              </span>
              <span className="ml-1 text-gray-500">credits</span>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-center">
                <span className="mr-2">💎</span>
                <span>Premium features access</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="mr-2">⚡</span>
                <span>Instant credit delivery</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="mr-2">♾️</span>
                <span>Credits never expire</span>
              </div>
              {pack.popular && (
                <div className="flex items-center justify-center">
                  <span className="mr-2">🎯</span>
                  <span>Best value for money</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            {/* ✅ CheckoutForm no longer receives userId/userEmail - handled server-side */}
            <CheckoutForm
              variantId={pack.variantId}
              packName={pack.name}
              popular={pack.popular}
            />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}