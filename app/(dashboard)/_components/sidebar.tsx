import PrivacyPolicyModal from "@/components/modals/privacy-policy-modal";
import { Logo } from "./logo";
import { SidebarRoutes } from "./sidebar-routes";
import { languageServer } from "@/lib/check-language-server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

export const Sidebar = async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const currentLanguage = await languageServer();

  const container = await db.container.findUnique({
    where: {
      id: process.env.CONTAINER_ID,
    },
  });

  const profile = await db.profile.findFirst({
    where: {
      userId: userId!,
    },
  });

  return (
    <div className="flex h-full flex-col overflow-y-auto border-r bg-white shadow-sm dark:bg-[#0A0118]">
      <PrivacyPolicyModal profile={profile} />
      <div className="flex items-center justify-center h-[80px]">
        <Logo
          imageUrl={container?.imageUrl || ""}
          imageUrlDark={container?.imageUrlDark || ""}
          link={container?.link || ""}
        />
      </div>
      <div className="flex w-full flex-col border-t ">
        <SidebarRoutes
          navPrimaryColor={container?.navPrimaryColor || "#ff00ff"}
          navDarkPrimaryColor={container?.navDarkPrimaryColor || "#ff00ff"}
          navBackgroundColor={container?.navBackgroundColor || "#ff00ff"}
          navDarkBackgroundColor={container?.navDarkBackgroundColor || "#ff00ff"}
        />
      </div>
      {container?.clientPackage != "EXPERT" && (
        <div className="flex flex-grow items-end justify-center pb-5">
          <a href="https://clubyte.live" className="hover:cursor-pointer" target="_blank">
            <div className="flex items-center">
              <span className="text-xs font-medium text-gray-600">Made by</span>
              <svg
                width="100"
                height="60"
                viewBox="0 0 800 450"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* SVG content */}
              </svg>
            </div>
          </a>
        </div>
      )}
    </div>
  );
};
