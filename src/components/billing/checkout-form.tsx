"use client";

import { Button } from "~/components/ui/button";
import { useState } from "react";
import { createCheckoutAction } from "~/actions/lemonsqueezy";

interface CheckoutFormProps {
  variantId: string;
  packName: string;
  popular?: boolean;
  // ✅ No longer receives userId - it's handled server-side securely
}

export function CheckoutForm({
  variantId,
  packName,
  popular,
}: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!variantId) {
      alert("This product is not available yet. Please check back later.");
      return;
    }

    setIsLoading(true);
    try {
      // ✅ Only pass variantId - userId is securely handled server-side
      const result = await createCheckoutAction({
        variantId,
      });

      if (result.error) {
        console.error("Checkout error:", result.error);
        alert(`Checkout error: ${result.error}`);
        return;
      }

      if (result.checkoutUrl) {
        // Redirect to LemonSqueezy checkout
        window.location.href = result.checkoutUrl;
      } else {
        alert("Failed to create checkout URL. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(
        "There was an error starting the checkout process. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading || !variantId}
      className={`w-full ${
        popular
          ? "bg-blue-600 hover:bg-blue-700"
          : "bg-gray-800 hover:bg-gray-900"
      }`}
      size="lg"
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg
            className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </span>
      ) : (
        <>Buy {packName}</>
      )}
    </Button>
  );
}