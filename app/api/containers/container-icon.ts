// app/api/container-icon/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const container = await db.container.findUnique({
    where: {
      id: process.env.CONTAINER_ID,
    },
  });

  return NextResponse.json({ icon: container?.icon });
}
