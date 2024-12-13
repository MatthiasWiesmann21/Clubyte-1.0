import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { db } from "@/lib/db";

const stripe: any = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-08-16",
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.email) {
      return new NextResponse("Session not found", { status: 404 });
    }

    const userId = session.user.id;
    let user = await db?.profile?.findFirst({
      where: { userId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const subscriptionId = user.stripeSubscriptionId;

    if (!subscriptionId) {
      return new NextResponse("No active subscription found", { status: 404 });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (subscription.status === "canceled") {
      return new NextResponse("Subscription already canceled", { status: 400 });
    }

    const response = await stripe.subscriptions.cancel(subscriptionId);

    console.log("qwerty", response);

    if (response?.status === "canceled") {
      // await db?.profile?.update()}
      user = await db.profile.update({
        where: { id: user.id },
        data: {
          stripeSubscriptionId: "", // Save the subscription ID from Stripe
          productId: "",
        },
      });
    }

    return NextResponse.json({
      message: "Subscription canceled successfully",
      status: 200,
    });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
