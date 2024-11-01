import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url =
    new URL(request.url)?.origin === "http://localhost:3000"
      ? "https://cludev1.clubyte.live"
      : new URL(request.url)?.origin;

  const container = await db.container.findFirst({
    where: { domain: url },
  });

  return NextResponse.json(container);
}
