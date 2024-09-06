import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import { getServerSession } from "next-auth";
export async function POST(req: Request) {
  try {
    // Get the session from NextAuth
      const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Check if user is authenticated
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Extract data from the request
    const requestBody = await req.json();
    const { postId, liveEventId } = requestBody;

    // Fetch comments for a specific post
    const comment = await db.comment.findMany({
      select: {
        text: true,
        id: true,
        createdAt: true,
        subComment: {
          select: {
            id: true,
            text: true,
          },
        },
        profile: {
          select: {
            id: true,
            imageUrl: true,
            name: true,
            email: true,
          },
        },
        likes: {
          select: {
            id: true,
          },
        },
      },
      where: { postId: postId },
    });

    // Fetch chat messages for a specific live event
    const chat = await db.comment.findMany({
      select: {
        text: true,
        id: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            imageUrl: true,
            name: true,
            email: true,
          },
        },
      },
      where: { liveEventId },
    });

    return NextResponse.json({ data: postId ? comment : chat });
  } catch (error) {
    console.log("[SUBSCRIPTION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
