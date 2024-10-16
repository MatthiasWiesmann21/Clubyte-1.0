import { NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import { getServerSession } from "next-auth";
import { getCourses } from "@/actions/get-courses";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req?.url);
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  try {
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const courses: any[] = await getCourses({
      userId,
      ...searchParams,
      containerId: session?.user?.profile?.containerId,
    });

    const profile = await db?.profile?.findFirst({
      select: {
        id: true,
      },
      where: {
        userId: userId,
      },
    });

    const result = courses?.map((each) => {
      const currentFavorite = each?.favorites?.some(
        (favorite: any) => favorite?.profileId === profile?.id
      );
      return { ...each, currentFavorite };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.log("[COURSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
