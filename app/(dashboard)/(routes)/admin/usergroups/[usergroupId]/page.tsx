import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { LayoutGridIcon } from "lucide-react";

import { db } from "@/lib/db";
import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";

import { TitleForm } from "./_components/title-form";
import { Actions } from "./_components/actions";
import { languageServer } from "@/lib/check-language-server";
import authOptions from "@/lib/auth"; // Ensure this is properly configured
import GoBackButton from "@/components/goBackButton";
import UserList from "./_components/userList";

const UsergroupIdPage = async ({
  params,
}: {
  params: { usergroupId: string };
}) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const currentLanguage = await languageServer();

  if (!userId) {
    return redirect("/");
  }

  const usergroup = await db.usergroup.findUnique({
    where: {
      id: params.usergroupId,
      containerId: session?.user?.profile?.containerId,
    },
  });

  if (!usergroup) {
    return redirect("/");
  }

  // Fetch all users and mark them based on their membership status
  const allUsers = await db.profile.findMany();
  const users = allUsers.map((user) => ({
    ...user,
    isMember: user.usergroupId === usergroup.id,
  }));

  // Handle click to toggle membership status
  const toggleUserMembership = async (userId: string, isMember: boolean) => {
    if (isMember) {
      // Remove user from user group
      await db.profile.update({
        where: { id: userId },
        data: { usergroupId: null },
      });
    } else {
      // Add user to user group
      await db.profile.update({
        where: { id: userId },
        data: { usergroupId: usergroup.id },
      });
    }
    // Note: You'll need to re-fetch or update the users list to reflect the changes in the UI
  };

  const requiredFields = [usergroup.name];
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!usergroup.isPublished && (
        <Banner label={currentLanguage.usergroup_unpublish_banner} />
      )}
      <div className="p-6">
        <GoBackButton buttonText={currentLanguage.goBack_button_text} />
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">
              {currentLanguage.usergroup_setup_title}
            </h1>
            <span className="text-sm text-slate-700 dark:text-[#ffffff]">
              {currentLanguage.usergroup_setup_undertitle} {completionText}
            </span>
          </div>
          <Actions
            disabled={!isComplete}
            usergroupId={params.usergroupId}
            isPublished={usergroup.isPublished}
          />
        </div>
        <div className="mt-16">
          <div className="flex items-center gap-x-2">
            <IconBadge icon={LayoutGridIcon} />
            <h2 className="text-xl">
              {currentLanguage.category_setup_customize_title}
            </h2>
            <span className="pl-1 text-xs text-rose-600">
              {currentLanguage.requiredFields}
            </span>
          </div>
          <TitleForm initialData={usergroup} usergroupId={usergroup.id} />
          <UserList initialUsers={users} usergroupId={usergroup.id} />
        </div>
        {/** 
          * TODO: @saif Add User List Form
        <div className="mt-16 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutGridIcon} />
              <h2 className="text-xl">
                {currentLanguage.category_setup_customize_title}
              </h2>
              <span className="pl-1 text-xs text-rose-600">
                {currentLanguage.requiredFields}
              </span>
            </div>
            <AddUserListForm profiles={profiles} usergroupId={usergroup.id} />
          </div>
        </div>
        */}
      </div>
    </>
  );
};

export default UsergroupIdPage;
