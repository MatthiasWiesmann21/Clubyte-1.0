import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export async function getTokenFromDatabase(token: string) {
  // Fetch token details from your database
  return db.profile.findFirst({ where: { token } });
}

export async function verifyToken(token: string, tokenDetails: any) {
  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;
    return decoded && decoded.userId === tokenDetails.userId;
  } catch (error) {
    console.log("Verify token error occured", error);
    return false;
  }
}

export async function updateUserEmailVerifiedStatus(userId: string) {
    console.log("Updating user email verified status", userId);
  return db.profile.update({
    where: { id: userId.trim() },
    data: { emailVerified: true },
  });
}
export async function resetToken(userId: string) {
  return db.profile.update({
    where: { id: userId },
    data: { token: "" },
  });
}
export async function GET(req: Request) {
  // Parse the URL to access query parameters
  const url = new URL(req.url);
  let token = url.searchParams.get("token")?.trim() || "";

  console.log("Token recieved from request", token );
  if (!token) {
    return NextResponse.json({ message: "Token is required" });
  }

  token = token.trim();
  console.log("Token recieved from request", token);
  try {
    // Fetch the token details from the database
    const tokenDetails = await getTokenFromDatabase(token as string);
    console.log("Token details from db", tokenDetails);

    if (!tokenDetails) {
        return NextResponse.json({ message: "Invalid or expired token" });
    }

    // Verify the token's validity (e.g., check signature, expiration)
    const isValid = await verifyToken(token as string, tokenDetails);
    console.log("Token is valid", isValid);

    if (!isValid) {
        return NextResponse.json({ message: "Invalid or expired token" });
    }

    // Update the user's email verification status in the database
    const verifiedNow = await updateUserEmailVerifiedStatus(tokenDetails.id);
    console.log("Email verified status updated", verifiedNow);
    // Optionally, you can delete the token after it's been used
    const tokenReset  = await resetToken(tokenDetails.id);
    console.log("Token reset", tokenReset);
    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json({ message: "Internal server error" });
  }
}
