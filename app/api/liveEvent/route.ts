import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import authOptions from "@/lib/auth"; // Ensure this is the path to your NextAuth configuration
import { isOwner } from "@/lib/owner";
import { isAdmin, isOperator } from "@/lib/roleCheckServer";
import { parse } from "url";

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
    const userId = session?.user?.id;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // Extract query parameters
    const { query } = parse(req.url!, true); // Parse the URL to extract query params
    const { categoryId, title, state } = query; // Extract the categoryId and title from the query params

    // Define the date filter based on `state`
    let dateFilter = {};
    const currentDate = new Date();

    if (state === "past") {
      dateFilter = { startDateTime: { lte: currentDate } }; // Past events
    } else if (state === "future") {
      dateFilter = { startDateTime: { gt: currentDate } }; // Future events
    }

    const liveEvent = await db.liveEvent.findMany({
      where: {
        isPublished: true,
        containerId: session?.user?.profile?.containerId,
        ...(categoryId && { categoryId: categoryId as string }), // Conditionally apply the filter for categoryId
        ...(title && { title: { contains: title as string } }), // Conditionally apply the filter for title
        ...dateFilter,
      },
      include: {
        favorites: true,
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const profile = await db?.profile?.findFirst({
      select: {
        id: true,
      },
      where: {
        userId: userId,
      },
    });

    const result = liveEvent?.map((each) => {
      const currentFavorite = each?.favorites?.some(
        (favorite: any) => favorite?.profileId === profile?.id
      );
      return { ...each, currentFavorite };
    });
    return NextResponse.json(result);
  } catch (error) {
    console.log("[LIVE_EVENT_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
