"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, CreditCard, Download, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { loadStripe } from "@stripe/stripe-js";
import CardPaymentForm from "./_components/cardPaymentForm";
import { Elements } from "@stripe/react-stripe-js";
import CardAddForm from "./_components/cardAddForm";

interface Price {
  id: string;
  object: string;
  active: boolean;
  billing_scheme: string;
  created: number;
  currency: string;
  custom_unit_amount: number | null;
  livemode: boolean;
  lookup_key: string | null;
  metadata: Record<string, unknown>;
  nickname: string | null;
  product: string;
  recurring: {
    aggregate_usage: string | null;
    interval: string;
    interval_count: number;
    meter: string | null;
    trial_period_days: number | null;
    usage_type: string;
  };
  tax_behavior: string;
  tiers_mode: string | null;
  transform_quantity: string | null;
  type: string;
  unit_amount: number;
  unit_amount_decimal: string;
}

interface Product {
  id: string;
  object: string;
  active: boolean;
  attributes: any[];
  created: number;
  default_price: string;
  description: string;
  features: string[];
  images: any[];
  livemode: boolean;
  marketing_features: any[];
  metadata: Record<string, unknown>;
  name: string;
  package_dimensions: any | null;
  shippable: any | null;
  statement_descriptor: any | null;
  tax_code: any | null;
  type: string;
  unit_label: any | null;
  updated: number;
  url: any | null;
  prices: Price[];
}

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  console.error("Missing Stripe Publishable Key");
}
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);
export default function BillingPage() {
  const [packages, setPackages] = useState<Product[]>([]);
  const [isYearly, setIsYearly] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview"); // Step 1: Add selectedTab state
  const [isPaymentPage, setIsPaymentPage] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [setupIntentClientSecret, setSetupIntentClientSecret] = useState<
    string | null
  >(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [selectedPlanName, setSelectedPlanName] = useState<string>("");
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const [isFreeTrial, setFreeTrial] = useState(false);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(`/api/list-payment-methods`, {
        method: "GET",
      });
      const data = await response.json();
      if (response.ok) {
        setPaymentMethods(data);
      } else {
        console.error("Failed to fetch payment methods:", data.error);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  const removePaymentMethod = async (paymentMethodId: string) => {
    try {
      const response = await fetch(`/api/list-payment-methods`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentMethodId }), // Pass it in the body
      });
      console.log({ response });
      if (response.ok) {
        fetchPaymentMethods();
      }
    } catch (error) {
      console.error("Error removing payment method:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/packages", { method: "GET" });
      const data = await response.json();
      setPackages(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const fetchBillingHistory = async () => {
    try {
      const response = await fetch("/api/get-billing-history");
      const data = await response.json();

      if (data.error) {
      } else {
        setInvoices(data.invoices);
      }
    } catch (err) {
    } finally {
    }
  };

  const fetchSubscriptionDetails = async () => {
    try {
      const res = await fetch("/api/product");
      const data = await res.json();

      if (res.status === 200) {
        setSubscriptionDetails(data);
        if (data.interval === "year") {
          setIsYearly(true);
        }
      } else {
      }
    } catch (error) {
    } finally {
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchBillingHistory();
    fetchSubscriptionDetails();
    fetchPaymentMethods();
  }, []);

  const filteredPackages = isYearly
    ? packages.slice(0, 3)
    : packages.slice(3, 6);

  const handlePayment = (selectedPlan: any) => {
    // const price =  selectedPlan.prices.find(
    //   (price: any) => price.recurring.interval === (isYearly ? "year" : "month")
    // );
    const price = selectedPlan.prices[0];

    // console.log("price", selectedPlan.prices[0]);
    setSelectedPlanId(selectedPlan?.id);
    setSelectedPlanName(selectedPlan?.name);

    if (price) {
      setSelectedPriceId(price.id);
      setIsPaymentPage(true);

      // Extract and store amount and currency for the selected plan
      setSelectedAmount(price.unit_amount || 0); // Amount in cents
      setSelectedCurrency(price.currency || "usd");
    }
  };

  const handleCheckoutComplete = async (paymentIntentId: string) => {
    console.log("Payment successful with ID:", paymentIntentId);

    // Store the subscription info in your database
    try {
      const response = await fetch("/api/store-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId,
          priceId: selectedPriceId,
          amount: selectedAmount,
          currency: selectedCurrency,
          stripeSubscriptionId: selectedPlanId,
        }),
      });

      if (response.ok) {
        alert("Payment successful and subscription stored!");
      } else {
        console.error("Failed to store subscription:", await response.json());
      }
    } catch (error) {
      console.error("Error storing subscription:", error);
    }

    setIsPaymentPage(false);
    fetchSubscriptionDetails();
    setSelectedTab("overview");
  };

  const handlePaymentWithPaymentMethod = async (paymentMethodId: string) => {
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedAmount,
          currency: selectedCurrency || "usd",
          planName: selectedPlanName,
          metadata: {
            priceId: selectedPriceId,
            productId: selectedPlanId,
            paymentMethodId,
          },
          isFreeTrial,
        }),
      });

      const { clientSecret } = await response.json();

      if (!clientSecret) {
        throw new Error("Failed to Subscribe. Please try again.");
      }

      alert("Payment successful and subscription stored!");
      fetchSubscriptionDetails();
    } catch (error: any) {
      console.error("Error storing subscription:", error.message);
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-4xl font-bold">Billing & Subscription</h1>

        {isPaymentPage && selectedPriceId ? (
          <Card>
            <CardHeader>
              <CardTitle>Enter Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <CardPaymentForm
                priceId={selectedPriceId!}
                planId={selectedPlanId!}
                planName={selectedPlanName!}
                amount={selectedAmount || 0} // Fallback to 0 if amount is null
                currency={selectedCurrency || "usd"} // Default to "usd"
                onComplete={handleCheckoutComplete}
                isFreeTrial={isFreeTrial}
              />
              {paymentMethods.length > 0 && (
                <ul className="mt-4 w-full space-y-4">
                  {paymentMethods.map((method, index) => (
                    <li
                      key={index}
                      className="group relative flex w-full cursor-pointer items-center justify-between rounded-lg border px-4 py-2"
                      onClick={() => handlePaymentWithPaymentMethod(method.id)}
                    >
                      <div>
                        <CreditCard className="mr-2 inline h-6 w-6" />
                        <span>
                          {method?.card?.display_brand} {method?.type} ends with{" "}
                          {method?.card?.last4}
                        </span>
                        <p className="text-sm text-muted-foreground">
                          Expires-{method?.card?.exp_month}/
                          {method?.card?.exp_year}
                        </p>
                      </div>
                      <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-2 transform rounded bg-gray-800 px-2 py-1 text-sm text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                        Click to pay with this card
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => setIsPaymentPage(false)}>
                Back to Plans
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="space-y-8"
          >
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="plans">Plans</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="history">Billing History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Current Plan: {subscriptionDetails?.name}
                  </CardTitle>
                  <CardDescription>
                    {subscriptionDetails ? (
                      `${subscriptionDetails?.amount}/
                    ${subscriptionDetails?.interval}`
                    ) : (
                      <div
                        onClick={() => {
                          setFreeTrial(true);
                          handlePayment(
                            filteredPackages?.find(
                              (pkg) => pkg?.name === "Expert Pack - Monthly"
                            )
                          );
                        }}
                        className="cursor-pointer"
                      >
                        No Plan Selected - Click to start your 14 days trial
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {subscriptionDetails?.features?.map(
                      (feature: any, index: number) => (
                        <li key={index} className="flex items-center">
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                          {feature?.name}
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    onClick={() => setSelectedTab("plans")}
                    variant="outline"
                  >
                    {/* Step 2: Implement the onClick */}
                    Change Plan
                  </Button>
                  <Button
                    onClick={async () => {
                      await fetch("/api/cancel-subscription");
                    }}
                    variant="destructive"
                  >
                    Cancel Subscription
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="plans">
              <div className="mb-8 flex items-center justify-center space-x-2">
                <Label htmlFor="billing-switch">Monthly</Label>
                <Switch
                  id="billing-switch"
                  checked={isYearly}
                  onCheckedChange={setIsYearly}
                  aria-label="Toggle between monthly and yearly billing"
                />
                <Label htmlFor="billing-switch">Yearly</Label>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredPackages.map((pkg) => {
                  // const price = pkg.prices.find(
                  //   (price) =>
                  //     price.recurring.interval === (isYearly ? "year" : "month")
                  // );
                  const price = pkg?.prices[0];

                  return (
                    <Card
                      key={pkg?.id}
                      className="flex flex-col justify-between"
                    >
                      <CardHeader>
                        <CardTitle>
                          {pkg?.name?.trim()?.split("-")[0]}
                        </CardTitle>
                        <CardDescription>{pkg?.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4 text-center">
                          <span className="text-4xl font-bold">
                            ${(price?.unit_amount || 0) / 100}
                          </span>
                          <span className="text-muted-foreground">
                            /{isYearly ? "year" : "month"}
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {pkg?.features?.length &&
                            pkg?.features?.map((feature: any, index) => {
                              return (
                                <li key={index} className="flex items-center">
                                  <Check className="mr-2 h-4 w-4 text-green-500" />
                                  {feature?.name}
                                </li>
                              );
                            })}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full"
                          variant={
                            pkg?.name
                              ?.toLowerCase()
                              ?.includes(
                                subscriptionDetails?.name?.toLowerCase()
                              )
                              ? "outline"
                              : "default"
                          }
                          disabled={pkg?.name
                            ?.toLowerCase()
                            ?.includes(
                              subscriptionDetails?.name?.toLowerCase()
                            )}
                          onClick={() => {
                            setFreeTrial(false);
                            handlePayment(pkg);
                          }}
                        >
                          {pkg?.name
                            ?.toLowerCase()
                            ?.includes(subscriptionDetails?.name?.toLowerCase())
                            ? "Current Plan"
                            : "Switch to this plan"}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your payment details</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* List existing payment methods */}
                  {paymentMethods.length > 0 ? (
                    <ul className="space-y-4">
                      {paymentMethods.map((method, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <CreditCard className="mr-2 inline h-6 w-6" />
                            <span>
                              {method?.card?.display_brand} {method?.type} ends
                              with {method?.card?.last4}
                            </span>
                            <p className="text-sm text-muted-foreground">
                              Expires-{method?.card?.exp_month}/
                              {method?.card?.exp_year}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => removePaymentMethod(method.id)}
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">
                      No saved payment methods.
                    </p>
                  )}
                  <hr className="my-4" />
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          "/api/create-setup-intent"
                        );
                        const { clientSecret } = await response.json();
                        setSetupIntentClientSecret(clientSecret);
                      } catch (error) {
                        console.error("Error creating setup intent:", error);
                      }
                    }}
                    variant="default"
                  >
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>
              {setupIntentClientSecret && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardAddForm
                      clientSecret={setupIntentClientSecret}
                      onComplete={() => {
                        setSetupIntentClientSecret(null);
                        setSelectedTab("payment"); // Refresh payment methods
                        fetchPaymentMethods();
                      }}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>
                    Your recent billing activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Amount Paid</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>{invoice.id}</TableCell>
                          <TableCell>
                            {(+invoice.amount / 100).toFixed(2)}{" "}
                            {invoice.currency.toUpperCase()}
                          </TableCell>
                          {/* Convert from cents */}
                          <TableCell>{invoice.status}</TableCell>
                          <TableCell>
                            {new Date(
                              invoice.created * 1000
                            ).toLocaleDateString()}
                          </TableCell>
                          {/* Format the date */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Elements>
  );
}
