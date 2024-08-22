import { getSession } from "next-auth/react";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { isOwner } from "@/lib/owner";

export async function POST(
  req: Request,
) {
  try {
    // Get the session from NextAuth
    const session = await getSession({ req  : req as any});
    const userId = session?.user?.id;

    // Extract data from the request
    const { name, imageUrl, link, clientPackage, maxCourses } = await req.json();

    // Check if the user is authenticated and an owner
    if (!userId || !await isOwner(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Create a new container
    const container = await db.container.create({
      data: {
        name,
        imageUrl,
        link,
        clientPackage,
        maxCourses,
      }
    });

    // Return the newly created container
    return NextResponse.json(container);
  } catch (error) {
    console.log("[CONTAINER_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
