import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { initialProfile } from "@/lib/initial-profile";
import { InitialModal } from "@/components/modals/initial-modal";
import { currentProfile } from "@/lib/current-profile";

const SetupPage = async () => {
  const profile = await currentProfile();
  const server = await db.server.findFirst({
    orderBy: {
      createdAt: "asc",
    },
    where: {
      containerId: process.env.CONTAINER_ID!,
      members: {
        some: {},
      },
    },
  });
  console.log("Setup page server found" , server );
  const serverwithProfile = await db.server.findFirst({
    where: {
      containerId: process.env.CONTAINER_ID!,
      members: {
        some: {
          profileId: (profile || {}).id,
        },
      },
    },
  });

  if (!server) {
    return <InitialModal />;
  }

  if (server) {
    if (!serverwithProfile) {
      const createMember = await db.member.create({
        data: {
          serverId: server.id,
          profileId: (profile || {}).id || '',
          containerId: process.env.CONTAINER_ID!,
        },
      });
    }
      // Redirect to the dashboard page
    return (
      redirect(`/chat/servers/${server.id}`)
    );
  };
};

export default SetupPage;