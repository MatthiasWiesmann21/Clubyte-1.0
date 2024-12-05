import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { db } from "@/lib/db";

// Initialize Stripe
const stripe: any = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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
    let user = await db.profile.findFirst({
      where: { userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in the database." },
        { status: 404 }
      );
    }

    // Create Stripe customer if not exists
    if (!user.stripeCustomerId || user.stripeCustomerId === "") {
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
        metadata: { userId },
      });

      user = await db.profile.update({
        where: { id: user.id },
        data: { stripeCustomerId: stripeCustomer.id },
      });
    }

    const stripeCustomerId = user.stripeCustomerId;

    // Create SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret });
  } catch (error: any) {
    console.error("Error creating SetupIntent:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
