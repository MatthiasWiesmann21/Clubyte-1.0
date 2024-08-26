import { redirect }from "next/navigation";
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
 
  const profile = await currentProfile();
  const server = await db.server.findUnique({
    where: {
      id: params.serverId,
      members: {
        some: {
          profileId: profile?.id||'',
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
