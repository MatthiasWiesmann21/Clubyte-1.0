import authOptions from "@/lib/auth";
import { getServerSession } from "next-auth";import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isOwner } from "@/lib/owner";
import { isAdmin, isOperator } from "@/lib/roleCheckServer";

export async function POST(req: Request) {
  try {
    // Get the session from NextAuth
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, color } = await req.json();

    // Check roles and access permissions
    const isRoleAdmins = await isAdmin();
    const isRoleOperator = await isOperator();
    const canAccess = isRoleAdmins || isRoleOperator || isOwner(userId);

    if (!canAccess) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Create the category
    const category = await db.category.create({
      data: {
        name,
        colorCode: color,
        containerId: session?.user?.profile?.containerId!,
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
