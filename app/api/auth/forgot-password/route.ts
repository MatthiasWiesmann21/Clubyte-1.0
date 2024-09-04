import { db } from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer"; // For sending emails
import ForgotPasswordEmailTemplate from "@/email-templates/forgot-password";

export async function getTokenFromDatabase(token: string) {
  // Fetch token details from your database
  return db.profile.findFirst({ where: { token } });
}

export async function createResetToken(userId: string) {
  // Generate a JWT token for password reset
  const token = jwt.sign({ userId }, process.env.NEXTAUTH_SECRET!, { expiresIn: '1h' });
  await db.profile.update({
    where: { id: userId },
    data: { token },
  });
  return token;
}

const sendEmail = async (name : string , toEmail: string , token : string ) => {
    const username = process.env.NEXT_PUBLIC_EMAIL_USERNAME;
    const password = process.env.NEXT_PUBLIC_EMAIL_PASSWORD;
    const fromEmail = process.env.NEXT_PUBLIC_FROM_EMAIL;
    const transporter = nodemailer.createTransport({
      host: process.env.NEXT_PUBLIC_EMAIL_HOST,
      port: ~~(process.env.NEXT_PUBLIC_EMAIL_PORT!),
      secure: false,

      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
  
      auth: {
        user: username,
        pass: password,
      },
    });
    try {
      console.log("Sending email with token " , token );
      const mail = await transporter.sendMail({
        from: username,
        to: toEmail,
        replyTo: fromEmail,
        subject: `Reset Password Request`,
        html: ForgotPasswordEmailTemplate( name , token),
      });
  
      console.log({ message: "Success: email was sent" , mail });
    } catch (error) {
      console.log("An error occured while sending email:", error);
    }
  };

  
export async function sendResetEmail(name: any, email: string, token: string) {
//   const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
  await sendEmail(name , email , token );
}

export async function verifyToken(token: string, tokenDetails: any) {
  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any;
    return decoded && decoded.userId === tokenDetails.userId;
  } catch (error) {
    console.log("Verify token error occurred", error);
    return false;
  }
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
  const token = url.searchParams.get("token")?.trim() || "";

  console.log("Token received from request", token);
  if (!token) {
    return NextResponse.json({ message: "Token is required" });
  }

  try {
    // Fetch the token details from the database
    const tokenDetails = await getTokenFromDatabase(token);
    console.log("Token details from db", tokenDetails);

    if (!tokenDetails) {
      return NextResponse.json({ message: "Invalid or expired token" });
    }

    // Verify the token's validity (e.g., check signature, expiration)
    const isValid = await verifyToken(token, tokenDetails);
    console.log("Token is valid", isValid);

    if (!isValid) {
      return NextResponse.json({ message: "Invalid or expired token" });
    }

    return NextResponse.json({ message: "Token is valid" });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ message: "Internal server error" });
  }
}

export async function POST(req: Request) {
  const { email } = await req.json();
  console.log("Email received from request", email);

  if (!email) {
    return NextResponse.json({ message: "Email is required" });
  }

  try {
    // Check if the email exists in the database
    const user = await db.profile.findFirst({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: "Email not found" });
    }

    // Create a reset token and save it in the database
    const resetToken = await createResetToken(user.id);
    console.log("Reset token created", resetToken);

    // Send the password reset email
    await sendResetEmail(user.name, email, resetToken);


    return NextResponse.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error sending reset email:", error);
    return NextResponse.json({ message: "Internal server error" });
  }
}
