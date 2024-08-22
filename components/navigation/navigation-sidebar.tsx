import { redirect } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NavigationAction } from "./navigation-action";
import { NavigationItem } from "./navigation-item";
import { getSession } from "next-auth/react"; // Import getSession from NextAuth

export const NavigationSidebar = async () => {
  // Get the session from NextAuth
  const session = await getSession();
  
  // Check if session exists and has a user ID
  if (!session?.user?.id) {
    return redirect("/");
  }

  const profile = await currentProfile();

  if (!profile) {
    return redirect("/");
  }

  const servers = await db.server.findMany({
    orderBy: {
      createdAt: "asc",
    },
    where: {
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  return (
    <div className="flex h-full w-full flex-col items-center space-y-4 bg-[#E3E5E8] py-3 text-primary dark:bg-[#1E1F22]">
      <NavigationAction />
      <ScrollArea className="w-full flex-1">
        {servers.map((server) => (
          <div key={server.id} className="mb-4">
            <NavigationItem
              id={server.id}
              name={server.name}
              imageUrl={server.imageUrl}
            />
          </div>
        ))}
      </ScrollArea>
      <div className="mt-auto flex flex-col items-center gap-y-4 pb-3"></div>
    </div>
  );
};
