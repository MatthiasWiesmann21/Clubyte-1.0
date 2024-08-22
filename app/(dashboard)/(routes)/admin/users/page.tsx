import { getSession } from "next-auth/react"; // Import getSession from NextAuth
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { isAdmin, isOperator } from "@/lib/roleCheckServer";
import { isOwner } from "@/lib/owner";

const UserPage = async () => {
  const session = await getSession(); // Get the session from NextAuth

  if (!session?.user) {
    return redirect("/auth/sign-in"); // Redirect to the sign-in page if not authenticated
  }

  const userId = session.user.id; // Extract userId from session

  const isRoleAdmins = await isAdmin();
  const isRoleOperator = await isOperator();
  const canAccess = isRoleAdmins || isRoleOperator || (userId && await isOwner(userId));

  if (!canAccess) {
    return redirect("/search");
  }

  const profiles = await db.profile.findMany({
    where: {
      containerId: process.env.CONTAINER_ID,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-6">
      <DataTable columns={columns} data={profiles} />
    </div>
  );
};

export default UserPage;
