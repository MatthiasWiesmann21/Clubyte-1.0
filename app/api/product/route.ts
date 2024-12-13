import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { db } from "@/lib/db";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-08-16",
});

export async function GET(req: Request) {
  try {
    // Retrieve user session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.email) {
      return new NextResponse("Session not found", { status: 404 });
    }

    const userId = session.user.id;

    // Fetch user from the database
    const user = await db.profile.findFirst({
      where: { userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in the database." },
        { status: 404 }
      );
    }

    const stripeSubscriptionId: any = user.stripeSubscriptionId;
    const productId = user.productId;
    const priceId = user.stripePriceId;

    if (!productId) {
      return NextResponse.json(
        { error: "No active subscription found for this user." },
        { status: 404 }
      );
    }

    // Fetch the subscription details from Stripe
    const product = await stripe.products.retrieve(productId);

    const subscription: any = await stripe.subscriptions.retrieve(
      stripeSubscriptionId
    );
    const pricingDetails = await stripe.prices.retrieve(priceId as string);

    console.log("qwerty", subscription);

    // Check if the subscription is active
    if (!subscription?.plan?.active) {
      return NextResponse.json(
        { error: "Subscription is not active." },
        { status: 400 }
      );
    }

    // Extract relevant subscription details
    const subscriptionDetails = {
      features: product.features,
      name: product.name,
      amount: pricingDetails.unit_amount && +pricingDetails.unit_amount / 100,
      interval: pricingDetails?.recurring?.interval,
    };

    return NextResponse.json(subscriptionDetails, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching subscription details:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
