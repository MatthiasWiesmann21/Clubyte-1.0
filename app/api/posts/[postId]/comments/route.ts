import { getSession } from "next-auth/react";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { isOwner } from "@/lib/owner";

export async function POST(req: Request) {
  try {
    // Get the session from NextAuth
    const session = await getSession({ req } as any);

    // Extract userId from the session
    const userId = session?.user?.id;
    const { title } = await req.json();

    // Check if userId exists and if the user is the owner
    if (!userId || !await isOwner(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Create the post in the database
    const post = await db.post.create({
      data: {
        title,
        containerId: process.env.CONTAINER_ID || '',
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    console.log("[COURSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
