import { getSession } from "next-auth/react";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getSession({ req : req as any});
    const userId = session?.user?.id;
    const { url, postId } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: userId,
        containerId: process.env.CONTAINER_ID,
      }
    });

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const attachment = await db.attachment.create({
      data: {
        url,
        name: url.split("/").pop() || "attachment",
        courseId: params.courseId,
      }
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.log("[COURSE_ID_ATTACHMENTS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
