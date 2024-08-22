import { getSession } from "next-auth/react"; // Import NextAuth's getSession
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";

interface InviteCodePageProps {
  params: {
    inviteCode: string;
  };
}

const InviteCodePage = async ({ params }: InviteCodePageProps) => {
  const session = await getSession(); // Get session from NextAuth

  if (!session?.user) {
    return redirect("/api/auth/signin"); // Redirect to the sign-in page if not authenticated
  }

  const profile = await currentProfile();

  if (!profile) {
    return redirect("/api/auth/signin"); // Redirect to the sign-in page if profile is not found
  }

  if (!params.inviteCode) {
    return redirect("/search"); // Redirect to search if invite code is not provided
  }

  const existingServer = await db.server.findFirst({
    where: {
      inviteCode: params.inviteCode,
      containerId: process.env.CONTAINER_ID,
      members: {
        some: {
          profileId: profile.id
        }
      }
    }
  });

  if (existingServer) {
    return redirect(`/chat/servers/${existingServer.id}`); // Redirect to the server if it exists
  }

  const server = await db.server.update({
    where: {
      inviteCode: params.inviteCode,
    },
    data: {
      members: {
        create: [
          {
            profileId: profile.id,
            containerId: process.env.CONTAINER_ID || '',
          }
        ]
      }
    }
  });

  if (server) {
    return redirect(`/chat/servers/${server.id}`); // Redirect to the newly created server
  }

  return null; // If no server created, return null
}

export default InviteCodePage;
