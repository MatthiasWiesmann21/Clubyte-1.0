import { db } from "@/lib/db";
import { getSession } from "next-auth/react";
import { NextResponse } from "next/server";

export async function GET(req: any) {
  try {
    const session = await getSession({ req });
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const key = req.nextUrl.searchParams.get("key");
    let id = null;
    const idData = await db.folder.findFirst({
      select: {
        id: true,
      },
      where: { key: key },
    });

    if (idData) id = idData.id;

    return NextResponse.json({ data: id });
  } catch (error) {
    console.log("[SUBSCRIPTION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
