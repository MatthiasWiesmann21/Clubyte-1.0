import { redirect } from "next/navigation";
import { ArrowLeft, User2Icon } from "lucide-react";

import { db } from "@/lib/db";
import { IconBadge } from "@/components/icon-badge";

import { TitleForm } from "./_components/title-form";
import { languageServer } from "@/lib/check-language-server";
import { currentProfile } from "@/lib/current-profile";
import { EmailForm } from "./_components/email-form";
import { ImageForm } from "./_components/image-form";
import Link from "next/link";

const UserNamePage = async () => {
  const user = await currentProfile();
  const currentLanguage = await languageServer();
  if (!user?.id) {
    return redirect("/sign-in");
  }

  const profile = await db.profile.findUnique({
    where: {
      id: user?.id,
    },
  });

  if (!profile) {
    return redirect("/sign-up");
  }

  return (
    <div className="p-4">
      <Link
        href={`/dashboard`}
        className="mb-6 flex items-center text-sm transition hover:opacity-75"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {currentLanguage.profile_backToDashboard_button_text}
      </Link>
      <div className="mt-8 items-center justify-center">
        <div>
          <div className="flex items-center gap-x-2">
            <IconBadge icon={User2Icon} />
            <h2 className="text-xl">
              {currentLanguage.profile_change_customize_username}
            </h2>
          </div>
          <TitleForm initialData={profile} profileId={profile.id} />
          <EmailForm initialData={profile} profileId={profile.id} />
          <ImageForm initialData={profile} profileId={profile.id} />
        </div>
      </div>
    </div>
  );
};

export default UserNamePage;
