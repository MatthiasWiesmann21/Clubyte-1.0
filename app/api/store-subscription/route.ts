import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { userId, paymentIntentId, priceId } = req.body;

    // Save subscription details in your database
    try {
      // Example: Use a database client like Prisma, MongoDB, or MySQL
      // await db.subscription.create({
      //   data: { userId, paymentIntentId, priceId, status: "active" },
      // });

      console.log("Subscription saved for user:", userId);
      res.status(200).json({ message: "Subscription saved." });
    } catch (error) {
      console.error("Error saving subscription:", error);
      res.status(500).json({ error: "Failed to save subscription." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end("Method Not Allowed");
  }
}
