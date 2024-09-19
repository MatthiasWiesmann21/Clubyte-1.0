import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import authOptions from "@/lib/auth"; // Ensure this is the path to your NextAuth configuration
import { isOwner } from "@/lib/owner";
import { isAdmin, isOperator } from "@/lib/roleCheckServer";

export async function POST(req: Request) {
  try {
    const session = await getServerSession({ req, ...authOptions });
    const userId = session?.user?.id;
    const { title } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isRoleAdmins = await isAdmin();
    const isRoleOperator = await isOperator();
    const canAccess = isRoleAdmins || isRoleOperator || isOwner(userId);

    if (!canAccess) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const liveEvent = await db.liveEvent.create({
      data: {
        userId,
        title,
        containerId: session?.user?.profile?.containerId!,
      },
    });

    return NextResponse.json(liveEvent);
  } catch (error) {
    console.log("[LIVE_EVENT_POST_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession({ req, ...authOptions });

    const liveEvent = await db.liveEvent.findMany({
      where: {
        isPublished: true,
        containerId: session?.user?.profile?.containerId,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(liveEvent);
  } catch (error) {
    console.log("[LIVE_EVENT_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
