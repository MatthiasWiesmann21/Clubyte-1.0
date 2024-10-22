import Link from "next/link";
import { getCourses } from "@/actions/get-courses";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { languageServer } from "@/lib/check-language-server";
import FavoriteChaptersList from "./_components/favoriteCHaptersList";

const FavoriteChapters = async () => {
  const session = await getServerSession(authOptions);
  const currentLanguage = await languageServer();
  // console.log("user session", session);
  if (!session?.user) {
    return redirect("/");
  }
  if (!session?.user?.role) {
    session.user.role = session?.user?.profile?.role || "USER";
  }

  const userId = session.user.id;

  const courses = await getCourses({
    userId,
    containerId: session?.user?.profile?.containerId,
  });

  const container: any = await db.container.findUnique({
    where: {
      id: session?.user?.profile?.containerId,
    },
  });
  return (
    <div className="space-y-4 p-4 dark:bg-[#110524]">
      <Link
        href={`/dashboard`}
        className="mb-6 flex items-center text-sm transition hover:opacity-75"
      ><ArrowLeft className="mr-2 h-4 w-4" />
        {currentLanguage.courses_list_backToDashboard_button_text}</Link>
      <FavoriteChaptersList courses={courses} colors={container?.colors} />
    </div>
  );
};

export default FavoriteChapters;
