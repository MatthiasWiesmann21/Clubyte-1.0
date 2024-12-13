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
  try {
    const body = await req.json(); // Parse the request body
    const { amount, currency, metadata, isFreeTrial, planName } = body;
    const session = await getServerSession(authOptions);
    const clientPackage = planName.split(" ")[0].toUpperCase();

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

    let paymentIntent;

    console.log("qwerty2", isFreeTrial);

    if (!isFreeTrial) {
      if (!metadata.paymentMethodId) {
        paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency,
          customer: stripeCustomerId,
          metadata, // Optional metadata (e.g., priceId)
        });
      } else {
        paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency,
          customer: stripeCustomerId,
          payment_method: metadata.paymentMethodId,
          metadata,
        });
      }
    }

    const container = await db.container.findFirst({
      where: { id: user.containerId },
    });
    if (container) {
      await db.container.update({
        where: { id: container.id },
        data: {
          clientPackage,
        },
      });
    }

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

    console.log("asdfghjkl", subscription);

    user = await db.profile.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionId: subscription.id, // Save the subscription ID from Stripe
        productId: metadata.productId,
        subscriptionEndDate: subscription.current_period_end?.toString(),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent?.client_secret,
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
