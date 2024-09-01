import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      throw "Please provide all fields";
    }
    const existingUser = await db.profile.findFirst({
      where: {
        email,
      },
    });
    if (existingUser) {
      throw "A user with this email already exists";
    }
    // YOU MAY WANT TO ADD SOME VALIDATION HERE
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.profile.create({
      data: {
        userId: `user_${Date.now()}`,
        name,
        email,
        password: hashedPassword,
        containerId: process.env.CONTAINER_ID || "",
        imageUrl: "",
        isOnline: "Online",
        isBanned: "NOT BANNED",
      },
    });
    console.log("User created successfully", user, {
      name,
      email,
      password,
      hashedPassword,
      user,
    });
  } catch (e) {
    console.log("Error occured while registering user", { e });
    let errorMessage = "An error occurred";
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    if (typeof e == "string") {
      errorMessage = e;
    }
    return NextResponse.json({ error: errorMessage });
  }
  return NextResponse.json({ message: "success" });
}

const sendEmail = async (toEmail: string, message: string) => {
  const username = process.env.NEXT_PUBLIC_EMAIL_USERNAME;
  const password = process.env.NEXT_PUBLIC_EMAIL_PASSWORD;
  const fromEmail = process.env.NEXT_PUBLIC_FROM_EMAIL;
  const transporter = nodemailer.createTransport({
    host: process.env.NEXT_PUBLIC_EMAIL_HOST,
    port: ~~(process.env.NEXT_PUBLIC_EMAIL_PORT!),
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
    const mail = await transporter.sendMail({
      from: username,
      to: toEmail,
      replyTo: fromEmail,
      subject: `Website activity from ${toEmail}`,
      html: `
        <p>Name: ${message} </p>
        <p>Email: ${toEmail} </p>
        <p>Message: ${message} </p>
        `,
    });

    console.log({ message: "Success: email was sent" , mail });
  } catch (error) {
    console.log("An error occured while sending email:", error);
  }
};
// sendEmail("malikahsan19962016@gmail.com", "Hello world");