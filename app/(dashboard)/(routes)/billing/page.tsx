"use client";

import { useEffect, useState } from "react";

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
  features: any[];
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

const BillingPage = () => {
  const [packages, setPackages] = useState<Product[]>([]);

  useEffect(() => {
    // Fetch products from the API route
    async function fetchProducts() {
      try {
        const response = await fetch("/api/packages", { method: "GET" });
        const data = await response.json();
        setPackages(data); // Adjust depending on the response structure
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        // setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className="flex h-full w-full flex-wrap justify-around overflow-y-auto">
      {/* <div className="mx-auto my-1 flex w-[400px] flex-col justify-between rounded-lg bg-white p-6 shadow-md">
        <div>
          <h1 className="mb-2 text-xl font-semibold text-[black]">free</h1>
          <p className="mb-4 text-3xl font-bold text-[black]">$0</p>
          <ul className="mb-6 space-y-1 text-gray-600">
            <li>∞ emails</li>
            <li>∞ projects</li>
            <li>∞ members</li>
          </ul>
        </div>
        <button className="mt-6 w-full rounded-md border border-gray-300 bg-white py-2 text-gray-700 hover:bg-gray-50">
          Current plan
        </button>
      </div> */}
      {packages?.map((each) => {
        return (
          <div
            key={each?.id}
            className="my-1 flex w-[400px] flex-col justify-between rounded-lg bg-white p-6 shadow-md"
          >
            <div>
              <h1 className="mb-2 text-xl font-semibold text-[black]">
                {each?.name?.trim()?.split("-")[0]}
              </h1>
              <p className="mb-4 text-3xl font-bold text-[black]">
                ${each?.prices[0]?.unit_amount}
                <span className="text-lg font-normal">{` / ${
                  each?.name?.trim()?.split("-")[1]
                }`}</span>
              </p>
              <ul className="mb-6 space-y-1 text-gray-600">
                <li>• 300 emails</li>
                <li>• 3 projects</li>
                <li>• 3 members</li>
              </ul>
            </div>
            <button className="w-full rounded bg-blue-500 py-2 text-white transition duration-200 hover:bg-blue-600">
              Switch to this plan
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default BillingPage;
