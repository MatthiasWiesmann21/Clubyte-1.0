import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json(); // Parse the JSON body
    const { userId, paymentIntentId, priceId } = body;

    // Save subscription details in your database
    try {
      // Example: Use a database client like Prisma, MongoDB, or MySQL
      // await db.subscription.create({
      //   data: { userId, paymentIntentId, priceId, status: "active" },
      // });

      console.log("Subscription saved for user:", userId);
      return NextResponse.json(
        { message: "Subscription saved." },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error saving subscription:", error);
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
