import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer"; // For sending emails
import ForgotPasswordEmailTemplate from "@/email-templates/forgot-password";

// Helper function to fetch the token from the database
async function getTokenFromDatabase(token: string) {
  return db.profile.findFirst({ where: { token } });
}

// Helper function to create a reset token
async function createResetToken(userId: string) {
  const token = jwt.sign({ userId }, process.env.NEXTAUTH_SECRET!, { expiresIn: '1h' });
  await db.profile.update({
    where: { id: userId },
    data: { token },
  });
  return token;
}

// Helper function to send an email
const sendEmail = async (name: string, toEmail: string, token: string) => {
  const username = process.env.NEXT_PUBLIC_EMAIL_USERNAME;
  const password = process.env.NEXT_PUBLIC_EMAIL_PASSWORD;
  const fromEmail = process.env.NEXT_PUBLIC_FROM_EMAIL;

  const transporter = nodemailer.createTransport({
    host: process.env.NEXT_PUBLIC_EMAIL_HOST,
    port: ~~(process.env.NEXT_PUBLIC_EMAIL_PORT!),
    secure: false,
    auth: {
      user: username,
      pass: password,
    },
  });

  try {
    await transporter.sendMail({
      from: username,
      to: toEmail,
      replyTo: fromEmail,
      subject: `Reset Password Request`,
      html: ForgotPasswordEmailTemplate(name, token),
    });
  } catch (error) {
    console.log("Error occurred while sending email:", error);
  }
};

// Helper function to send the reset email
async function sendResetEmail(name: string, email: string, token: string) {
  await sendEmail(name, email, token);
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
  const token = url.searchParams.get("token")?.trim() || "";

  if (!token) {
    return NextResponse.json({ message: "Token is required" });
  }

  try {
    const tokenDetails = await getTokenFromDatabase(token);

    if (!tokenDetails) {
      return NextResponse.json({ message: "Invalid or expired token" });
    }

    const isValid = await verifyToken(token, tokenDetails);

    if (!isValid) {
      return NextResponse.json({ message: "Invalid or expired token" });
    }

    return NextResponse.json({ message: "Token is valid" });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" });
  }
}

// POST request handler
export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: "Email is required" });
  }

  try {
    const user = await db.profile.findFirst({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: "Email not found" });
    }

    const resetToken = await createResetToken(user.id);
    // @ts-ignore
    await sendResetEmail(user.name, email, resetToken);

    return NextResponse.json({ message: "Password reset email sent" });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" });
  }
}
