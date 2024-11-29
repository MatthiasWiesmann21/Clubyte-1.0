import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { db } from "@/lib/db";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-08-16",
});

export async function GET(req: Request) {
  try {
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

    // Fetch the user's invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 10, // Limit number of invoices (adjust as needed)
    });

    // Optionally, store invoices in the database
    // for (let invoice of invoices.data) {
    //   await db.invoice.create({
    //     data: {
    //       userId,
    //       stripeInvoiceId: invoice.id,
    //       amountPaid: invoice.amount_paid,
    //       status: invoice.status,
    //       date: new Date(invoice.created * 1000), // Convert from Unix timestamp
    //     },
    //   });
    // }

    return NextResponse.json({ invoices: invoices.data });
  } catch (error: any) {
    console.error("Error fetching billing history:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
