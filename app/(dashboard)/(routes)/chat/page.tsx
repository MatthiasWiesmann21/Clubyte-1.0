"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";
import { initialProfile } from "@/lib/initial-profile";
import { InitialModal } from "@/components/modals/initial-modal";

const SetupPage = () => {
  const router = useRouter();

  useEffect(() => {
    const setup = async () => {
      const profile : any = {} ; 
      // await initialProfile();

      if (!profile.id) {
        return; // Handle case where profile is not available
      }

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

      const serverwithProfile = await db.server.findFirst({
        where: {
          containerId: process.env.CONTAINER_ID!,
          members: {
            some: {
              profileId: profile.id,
            },
          },
        },
      });

      if (!server) {
        return; // Handle case where server is not found
      }

      if (server && !serverwithProfile) {
        await db.member.create({
          data: {
            serverId: server.id,
            profileId: profile.id,
            containerId: process.env.CONTAINER_ID!,
          },
        });
      }

      // Redirect to the dashboard page
      router.push(`/chat/servers/${server.id}`);
    };

    setup();
  }, [router]);

  return <InitialModal />;
};

export default SetupPage;
