import authOptions from "@/lib/auth";
import { db } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-08-16",
});

export async function POST(req: Request) {
  //   if (req.method !== "POST") {
  //     return res.status(405).json({ error: "Method Not Allowed" });
  //   }

  try {
    const body = await req.json(); // Parse the request body
    const { amount, currency, metadata, isFreeTrial } = body;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.email) {
      return new NextResponse("Session not found", { status: 404 });
    }

    const userId = session.user.id;

    // Fetch user from the database
    let user = await db.profile.findFirst({
      where: { userId },
    });

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json(
        { error: "User or Stripe customer not found." },
        { status: 404 }
      );
    }

    const stripeCustomerId = user.stripeCustomerId;
    // Validate input
    if (!amount || !currency) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: stripeCustomerId,
      metadata, // Optional metadata (e.g., priceId)
    });

    const subscriptionSchedule = await stripe.subscriptionSchedules.create({
      customer: stripeCustomerId,
      start_date: Math.floor(Date.now() / 1000),
      end_behavior: "release",
      phases: [
        {
          items: [
            {
              price: metadata.priceId,
              quantity: 1,
            },
          ],
          iterations: 12,
        },
      ],
    });

    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [
        {
          price: metadata.priceId,
          quantity: 1,
        },
      ],
      ...(isFreeTrial ? { trial_period_days: 14 } : {}),
    });

    user = await db.profile.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionId: subscription.id, // Save the subscription ID from Stripe
        productId: metadata.productId,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      subscriptionSchedule: subscriptionSchedule,
      subscription: subscription,
    });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
