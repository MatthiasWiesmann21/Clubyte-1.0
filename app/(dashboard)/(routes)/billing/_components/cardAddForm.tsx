import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const CardAddForm = ({
  clientSecret,
  onComplete,
}: {
  clientSecret: string;
  onComplete: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      setError("Stripe.js not loaded.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { setupIntent, error } = await stripe.confirmCardSetup(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: "User Name", // Replace with actual user's name
            },
          },
        }
      );

      if (error) {
        throw error;
      }

      // Save payment method on the server
      const saveResponse = await fetch("/api/save-payment-method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId: setupIntent?.payment_method }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save payment method.");
      }

      onComplete(); // Refresh payment methods
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <CardElement
        options={{
          style: {
            base: {
              color: "#64758b",
              fontSize: "16px",
              "::placeholder": {
                color: "#cccccc",
              },
            },
            invalid: {
              color: "#ff4d4f",
            },
          },
        }}
        className="rounded-md border p-4 mb-5"
      />
      {error && <p className="text-red-500">{error}</p>}
      <Button onClick={handleSubmit} disabled={isProcessing}>
        {isProcessing ? "Processing..." : "Add Payment Method"}
      </Button>
    </div>
  );
};

export default CardAddForm;
