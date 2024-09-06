import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// Helper function to fetch the token from the database
async function getTokenFromDatabase(token: string) {
  return db.profile.findFirst({ where: { token } });
}

// Helper function to verify a token
async function verifyToken(token: string, tokenDetails: any) {
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;
    return decoded && decoded.userId === tokenDetails.userId;
  } catch (error) {
    console.log("Error verifying token:", error);
    return false;
  }
}

// Helper function to update the user's email verified status
async function updateUserEmailVerifiedStatus(userId: string) {
  console.log("Updating user email verified status", userId);
  return db.profile.update({
    where: { id: userId.trim() },
    data: { emailVerified: true },
  });
}

// Helper function to reset the token
async function resetToken(userId: string) {
  return db.profile.update({
    where: { id: userId },
    data: { token: "" },
  });
}

// GET request handler
export async function GET(req: Request) {
  const url = new URL(req.url);
  let token = url.searchParams.get("token")?.trim() || "";

  console.log("Token received from request", token);
  if (!token) {
    return NextResponse.json({ message: "Token is required" });
  }

  token = token.trim();
  console.log("Token received from request", token);

  try {
    const tokenDetails = await getTokenFromDatabase(token);
    console.log("Token details from db", tokenDetails);

    if (!tokenDetails) {
      return NextResponse.json({ message: "Invalid or expired token" });
    }

    const isValid = await verifyToken(token, tokenDetails);
    console.log("Token is valid", isValid);

    if (!isValid) {
      return NextResponse.json({ message: "Invalid or expired token" });
    }

    const verifiedNow = await updateUserEmailVerifiedStatus(tokenDetails.id);
    console.log("Email verified status updated", verifiedNow);

    const tokenReset = await resetToken(tokenDetails.id);
    console.log("Token reset", tokenReset);

    return NextResponse.redirect(process.env.BASE_PATH + '/auth/email-verified', 307);
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json({ message: "Internal server error" });
  }
}
