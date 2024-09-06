import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { isAdmin, isOperator } from "@/lib/roleCheckServer";
import { isOwner } from "@/lib/owner";
import authOptions  from "@/lib/auth"; // Ensure this is properly configured

const CategoriesPage = async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const isRoleAdmins = await isAdmin();
  const isRoleOperator = await isOperator();
  const canAccess = isRoleAdmins || isRoleOperator || (userId && await isOwner(userId));

  if (!userId || !canAccess) {
    return redirect("/search");
  }

  const categories = await db.category.findMany({
    where: {
      containerId: process.env.CONTAINER_ID,
    },
  });

  return (
    <div className="p-6">
      {/* @ts-ignore */}
      <DataTable columns={columns} data={categories} />
    </div>
  );
};

export default CategoriesPage;
