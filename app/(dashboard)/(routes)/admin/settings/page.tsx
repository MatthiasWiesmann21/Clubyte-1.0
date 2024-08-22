import { getSession } from "next-auth/react"; // Import getSession from NextAuth
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { languageServer } from "@/lib/check-language-server";
import { isOwner } from "@/lib/owner";
import { isAdmin, isOperator } from "@/lib/roleCheckServer";
import { MenuRoutes } from "./menu-routes";

const CustomizeMenuPage = async () => {
  const session = await getSession(); // Get the session from NextAuth
  const currentLanguage = await languageServer();

  if (!session?.user) {
    return redirect("/auth/sign-in"); // Redirect to sign-in page if not authenticated
  }

  const userId = session.user.id; // Extract userId from session

  const isRoleAdmins = await isAdmin();
  const isRoleOperator = await isOperator();
  const canAccess = isRoleAdmins || isRoleOperator || (userId && await isOwner(userId));

  if (!canAccess) {
    return redirect("/search");
  }

  const container = await db.container.findUnique({
    where: {
      id: process.env.CONTAINER_ID,
    },
  });

  if (!container) {
    return redirect("/");
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">
              {currentLanguage?.customize_customizeCcontainer_title}
            </h1>
          </div>
        </div>
        <MenuRoutes container={container}/>
      </div>
    </>
  );
};

export default CustomizeMenuPage;
