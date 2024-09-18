// app/api/container-icon/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function GET() {

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect("/");
  }

  const container = await db.container.findUnique({
    where: {
      id: session?.user?.profile?.containerId,
    },
  });

  return NextResponse.json({ icon: container?.icon });
}
