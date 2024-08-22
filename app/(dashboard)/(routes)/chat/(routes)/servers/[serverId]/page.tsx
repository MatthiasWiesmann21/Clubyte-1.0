import { getSession } from "next-auth/react"; // Import NextAuth's getSession
import { redirect } from "next/navigation";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

interface ServerIdPageProps {
  params: {
    serverId: string;
  };
}

const ServerIdPage = async ({ params }: ServerIdPageProps) => {
  const session = await getSession();

  if (!session?.user) {
    return redirect("/api/auth/signin"); // Redirect to the sign-in page if not authenticated
  }

  const profile = await currentProfile();

  if (!profile) {
    return redirect("/api/auth/signin"); // Redirect to the sign-in page if profile is not found
  }

  const server = await db.server.findUnique({
    where: {
      id: params.serverId,
      containerId: process.env.CONTAINER_ID,
      members: {
        some: {
          profileId: profile.id,
          containerId: process.env.CONTAINER_ID,
        },
      },
    },
    include: {
      channels: {
        where: {
          name: "general",
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  const initialChannel = server?.channels[0];

  if (initialChannel?.name !== "general") {
    return null;
  }

  return redirect(`/chat/servers/${params.serverId}/channels/${initialChannel?.id}`);
};

export default ServerIdPage;
