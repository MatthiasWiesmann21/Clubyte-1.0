import { getServerSession } from "next-auth/next";
import { Chapter, Course, UserProgress } from "@prisma/client";
import { redirect } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { db } from "@/lib/db";
import { CourseProgress } from "@/components/course-progress";
import authOptions from "@/lib/auth"; // Assuming you have the auth options set up
import { CourseSidebarItem } from "./course-sidebar-item";
import Progress from "./progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DescriptionModal } from "@/components/modals/description-modal";
import { Button } from "@/components/ui/button";
import { Edit, Info } from "lucide-react";
import { languageServer } from "@/lib/check-language-server";
import Link from "next/link";
import { useIsAdmin } from "@/lib/roleCheck";
import { isAdmin, isClientAdmin } from "@/lib/roleCheckServer";
import { CourseInfoModal } from "@/components/modals/course-info-modal";

interface CourseSidebarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
  ThemeOutlineColor: string;
}

export const CourseSidebar = async ({
  course,
  progressCount,
  ThemeOutlineColor,
}: CourseSidebarProps) => {
  const session = await getServerSession(authOptions);
  const currentLanguage = await languageServer();
  const isRoleAdmin = await isAdmin();
  const isRoleClientAdmin = await isClientAdmin();

  const canAccess = isRoleAdmin || isRoleClientAdmin;

  if (!session?.user?.id) {
    return redirect("/");
  }

  const userId = session.user.id;

  const purchase = await db.purchase.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      },
    },
  });

  const progress =
    course.chapters.reduce(
      (
        acc: number,
        chapter: Chapter & { userProgress: UserProgress[] | null }
      ) => acc + (chapter.userProgress?.[0]?.progress || 0),
      0
    ) / course.chapters.length;

  return (
    <TooltipProvider>
      <div className="m-3 flex hidden md:block h-full flex-col overflow-y-auto rounded-xl border-2 bg-slate-100 shadow-sm dark:bg-[#0c0319]">
        <div className="flex flex-col border-b p-6">
          <div className="flex justify-between">
            <Tooltip>
              <TooltipTrigger>
                <h1 className="line-clamp-2 whitespace-normal break-words text-start font-semibold">
                  {course.title}
                </h1>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <h1 className="h-full max-w-[300px] whitespace-normal font-semibold">
                  {course.title}
                </h1>
              </TooltipContent>
            </Tooltip>
            <div>
            <Tooltip>
              <TooltipTrigger>
                <CourseInfoModal description={course.description!} title={course.title!} level={course.level!} duration={course.duration!} chapters={course.chapters.length} ThemeOutlineColor={ThemeOutlineColor}> 
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <Info width={16} height={16} />
                  </Button>
                </CourseInfoModal>
                <TooltipContent side="bottom">
                  <p className="h-full max-w-[300px] whitespace-normal font-semibold">
                    {currentLanguage.courses_sidebar_infoDescription}
                  </p>
                </TooltipContent>
              </TooltipTrigger>
            </Tooltip>
            {canAccess  && (
              <Link href={`/admin/courses/${course.id}`}>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <Edit width={16} height={16} />
              </Button>
            </Link>
            )}
            
            </div>
        </div>
          {purchase && (
            <div className="mt-4">
              <Progress progress={progress} />
            </div>
          )}
        </div>
        <ScrollArea>
          <div className="flex w-full flex-col border-t-2">
            {course.chapters.map((chapter) => (
              <CourseSidebarItem
                key={chapter.id}
                id={chapter.id}
                label={chapter.title}
                isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
                courseId={course.id}
                isLocked={!chapter.isFree && !purchase}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
};
