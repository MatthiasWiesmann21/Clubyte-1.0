import authOptions from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.email) {
      return new NextResponse("User not authenticated", { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user from the database
    let user = await db.profile.findFirst({
      where: { userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User profile not found in the database." },
        { status: 404 }
      );
    }

    const body = await req.json(); // Parse the JSON body
    const { paymentIntentId, priceId, stripeSubscriptionId } = body;

    // Validate required fields
    if (!paymentIntentId || !priceId || !stripeSubscriptionId) {
      return NextResponse.json(
        { error: "Missing required fields in the request body." },
        { status: 400 }
      );
    }

    const subscriptionType =
      priceId === "price_monthly"
        ? "MONTHLY"
        : priceId === "price_annual"
        ? "ANNUAL"
        : "";

    // Save subscription details in the database
    try {
      user = await db.profile.update({
        where: { id: user.id },
        data: {
          paymentIntentId, // Save the paymentIntent ID from Stripe
          stripeSubscriptionId, // Save the subscription ID from Stripe
          stripePriceId: priceId, // Save the price ID
          subscriptionType: priceId === "price_monthly" ? "MONTHLY" : "ANNUAL", // Example logic
        },
      });

      console.log(`Subscription saved for user ${userId}`);
      return NextResponse.json(
        {
          message: "Subscription saved successfully.",
          subscriptionType,
          stripeSubscriptionId,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error(`Error saving subscription for user ${userId}:`, error);
      return NextResponse.json(
        { error: "Failed to save subscription." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error parsing request body:", error);
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}
