import { getSession } from "next-auth/react";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    // Get the session from NextAuth
    const session = await getSession({ req : req as any});
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the category exists
    const category = await db.category.findUnique({
      where: {
        id: params.categoryId,
        containerId: process.env.CONTAINER_ID,
      }
    });

    if (!category) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Update the category to be published
    const publishedCategory = await db.category.update({
      where: {
        id: params.categoryId,
        containerId: process.env.CONTAINER_ID,
      },
      data: {
        isPublished: true,
      }
    });

    return NextResponse.json(publishedCategory);
  } catch (error) {
    console.log("[CATEGORY_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
