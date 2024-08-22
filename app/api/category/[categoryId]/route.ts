import { getSession } from "next-auth/react";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    // Get the session from NextAuth
    const session = await getSession({ req : req as any });
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

    // Delete the category
    const deletedCategory = await db.category.delete({
      where: {
        id: params.categoryId,
        containerId: process.env.CONTAINER_ID,
      },
    });

    return NextResponse.json(deletedCategory);
  } catch (error) {
    console.log("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

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

    const { categoryId } = params;
    const values = await req.json();

    // Update the category
    const category = await db.category.update({
      where: {
        id: categoryId,
        containerId: process.env.CONTAINER_ID,
      },
      data: {
        ...values,
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
