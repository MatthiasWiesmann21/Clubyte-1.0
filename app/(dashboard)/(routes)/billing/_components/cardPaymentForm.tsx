import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";

export default function CardPaymentForm({
  priceId,
  amount,
  currency,
  onComplete,
}: {
  priceId: string;
  amount: number; // Amount in cents
  currency: string; // Currency code (e.g., "usd")
  onComplete: (paymentIntentId: string) => void; // Callback after successful payment
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("here");
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Payment processing is not ready. Please try again.");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, metadata: { priceId } }),
      });

      const { clientSecret } = await response.json();

      if (!clientSecret) {
        throw new Error("Failed to fetch client secret. Please try again.");
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: "Test User", // Replace with actual user details
            },
          },
        }
      );

      if (error) {
        throw new Error(error.message || "Payment failed. Please try again.");
      }

      if (paymentIntent?.status === "succeeded") {
        onComplete(paymentIntent.id);
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: "#ffffff",
        fontSize: "16px",
        "::placeholder": {
          color: "#cccccc",
        },
      },
      invalid: {
        color: "#ff4d4f",
      },
    },
  };

  return (
    <>
      <div className="mb-4">
        <CardElement
          options={cardStyle}
          className="rounded-md border p-4 text-[#fff]"
        />
      </div>
      {error && <p className="mb-4 text-red-500">{error}</p>}
      <Button
        type="submit"
        className="w-full"
        disabled={isProcessing}
        onClick={handleSubmit}
      >
        {isProcessing ? "Processing..." : "Pay Now"}
      </Button>
    </>
  );
}
