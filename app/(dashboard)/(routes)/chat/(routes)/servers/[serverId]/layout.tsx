import { getSession } from "next-auth/react"; // Import NextAuth's getSession
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { ServerSidebar } from "@/components/server/server-sidebar";

const ServerIdLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { serverId: string };
}) => {
  const session = await getSession(); // Get session from NextAuth

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
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (!server) {
    return redirect("/"); // Redirect to home if server is not found
  }

  return (
    <div className="flex h-full">
      <div className="h-full max-w-[250px] sm:hidden xs:hidden md:flex flex-col">
        <ServerSidebar serverId={params.serverId} />
      </div>
      <main className="w-full">{children}</main>
    </div>
  );
};

export default ServerIdLayout;
