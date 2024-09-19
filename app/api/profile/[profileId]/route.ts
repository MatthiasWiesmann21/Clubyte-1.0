import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth";
import { isOwner } from "@/lib/owner";
import { isAdmin } from "@/lib/roleCheckServer";

export async function DELETE(
  req: Request,
  { params }: { params: { profileId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const isRoleAdmins = await isAdmin();
    const canAccess = isRoleAdmins || (userId && await isOwner(userId));
    const profile = await db.profile.findUnique({
      where: {
        id: params.profileId,
      }
    });

    if (!profile) {
      return new NextResponse("Not found", { status: 404 });
    }

    const deletedProfile = await db.profile.delete({
      where: {
        id: params.profileId,
      },
    });

    return NextResponse.json(deletedProfile);
  } catch (error) {
    console.log("[PROFILE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { profileId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { profileId } = params;
    const values = await req.json();
    const profile = await db.profile.update({
      where: {
        id: profileId,
        containerId: session?.user?.profile?.containerId,
      },
      data: {
        ...values
      }
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.log("[PROFILE_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
