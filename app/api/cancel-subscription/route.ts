import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { db } from "@/lib/db";
import nodemailer from "nodemailer";

const stripe: any = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-08-16",
});

// Email sending logic
async function sendCancellationEmail(email: string, reason: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.NEXT_PUBLIC_EMAIL_HOST,
    port: Number(process.env.NEXT_PUBLIC_EMAIL_PORT),
    secure: false, // Use TLS
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false,
    },
    auth: {
      user: process.env.NEXT_PUBLIC_EMAIL_USERNAME,
      pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD,
    },
  });

  const fromEmail = process.env.NEXT_PUBLIC_FROM_EMAIL;
  const emailBody = `
    <p>A user has requested to cancel their subscription.</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Reason:</strong> ${reason}</p>
  `;

  await transporter.sendMail({
    from: fromEmail,
    to: email, // Send confirmation to the user
    bcc: fromEmail, // Send a copy to support
    subject: "Subscription Cancellation Confirmation",
    html: emailBody,
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.email) {
      return new NextResponse("Session not found", { status: 404 });
    }

    const { email, reason } = await req.json();

    if (!email || !reason) {
      return new NextResponse("Email and reason are required", { status: 400 });
    }

    const userId = session.user.id;

    // Retrieve user profile from database
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

    // Retrieve subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (subscription.status === "canceled") {
      return new NextResponse("Subscription already canceled", { status: 400 });
    }

    // Cancel subscription in Stripe
    const response = await stripe.subscriptions.cancel(subscriptionId);

    if (response?.status === "canceled") {
      // Update user's profile in the database
      user = await db.profile.update({
        where: { id: user.id },
        data: {
          stripeSubscriptionId: "",
          productId: "",
        },
      });

      // Send cancellation email
      await sendCancellationEmail(email, reason);

      return NextResponse.json({
        message: "Subscription canceled and email sent successfully",
        status: 200,
      });
    }

    return NextResponse.json({
      message: "Failed to cancel subscription",
      status: 500,
    });
  } catch (error: any) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
