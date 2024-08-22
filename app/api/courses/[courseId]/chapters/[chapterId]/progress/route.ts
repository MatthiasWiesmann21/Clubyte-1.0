import { getSession } from "next-auth/react";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const session = await getSession({ req : req as any });
    const user = session?.user;

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { isCompleted } = await req.json();

    const userProgress = await db.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId: user.id,
          chapterId: params.chapterId,
        }
      },
      update: {
        isCompleted
      },
      create: {
        userId: user.id,
        chapterId: params.chapterId,
        isCompleted,
      }
    });

    return NextResponse.json(userProgress);
  } catch (error) {
    console.log("[CHAPTER_ID_PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
