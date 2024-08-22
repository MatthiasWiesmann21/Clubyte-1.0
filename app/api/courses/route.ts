import { getSession } from "next-auth/react";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { isOwner } from "@/lib/owner";
import { isAdmin, isOperator } from "@/lib/roleCheckServer";

export async function GET(req: Request) {
  try {
    const session = await getSession({ req : req as any });
    const userId = session?.user?.id;

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const courseId = new URL(req.url).pathname.split("/")[2];
    const course = await db.course.findUnique({
      where: {
        id: courseId,
        containerId: process.env.CONTAINER_ID,
      },
      include: {
        chapters: {
          where: {
            isPublished: true,
          },
          include: {
            userProgress: {
              where: {
                userId,
              },
            },
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession({ req : req as any});
    const userId = session?.user?.id;
    const { title } = await req.json();

    const isRoleAdmins = await isAdmin();
    const isRoleOperator = await isOperator();
    const canAccess = isRoleAdmins || isRoleOperator || await isOwner(userId);

    if (!userId || !canAccess) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const container = await db.container.findUnique({
      where: {
        id: process.env.CONTAINER_ID,
      },
    });

    const courses = await db.course.count({
      where: {
        containerId: process.env.CONTAINER_ID,
      },
    });

    if (
      container &&
      container.maxCourses !== null &&
      courses >= container.maxCourses
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.course.create({
      data: {
        userId,
        title,
        containerId: process.env.CONTAINER_ID || "",
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
