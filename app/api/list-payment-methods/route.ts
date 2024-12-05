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

    // Fetch user from the database using the `userId` field
    let user = await db?.profile?.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    // If no user exists in the database
    if (!user) {
      return NextResponse.json(
        { error: "User not found in the database." },
        { status: 404 }
      );
    }

    // If no Stripe customer ID, create a new one
    if (!user.stripeCustomerId || user.stripeCustomerId === "") {
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
        metadata: { userId },
      });

      // Update the user record with the new Stripe customer ID
      user = await db.profile.update({
        where: {
          id: user.id,
          containerId: session?.user?.profile?.containerId,
        },
        data: { stripeCustomerId: stripeCustomer.id },
      });
    }

    const stripeCustomerId = user.stripeCustomerId;

    // List payment methods for the customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: "card",
    });

    return NextResponse.json(paymentMethods.data);
  } catch (error: any) {
    console.error("Error fetching payment methods:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.email) {
      return new NextResponse("Session not found", { status: 404 });
    }

    const userId = session.user.id;
    const { paymentMethodId } = await req.json();
    console.log({ paymentMethodId });
    
    if (!paymentMethodId) {
      return new NextResponse("Payment method ID is required", { status: 400 });
    }

    // Fetch user from the database using the `userId`
    const user = await db?.profile?.findFirst({
      where: { userId },
    });

    // If no user exists in the database
    if (!user) {
      return new NextResponse("User not found in the database", { status: 404 });
    }

    const stripeCustomerId = user.stripeCustomerId;

    // If no Stripe customer ID, create a new one
    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
        metadata: { userId },
      });

      // Update the user record with the new Stripe customer ID
      await db?.profile?.update({
        where: { id: user.id },
        data: { stripeCustomerId: stripeCustomer.id },
      });

      return new NextResponse("Created Stripe customer and saved ID", { status: 201 });
    }

    // List and delete payment method
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
    return new NextResponse(paymentMethod, { status: 200 });

  } catch (error: any) {
    console.error("Error deleting payment method:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

