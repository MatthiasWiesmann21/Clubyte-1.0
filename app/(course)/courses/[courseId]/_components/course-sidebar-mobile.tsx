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
import { isAdmin } from "@/lib/roleCheckServer";
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

export const CourseSidebarMobile = async ({
  course,
  progressCount,
  ThemeOutlineColor,
}: CourseSidebarProps) => {
  const session = await getServerSession(authOptions);
  const currentLanguage = await languageServer();
  const canAccess = await isAdmin();

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
      <div className="flex h-full flex-col overflow-y-auto border-r bg-slate-100/60 shadow-sm dark:bg-[#0c0319]">
        <div className="flex flex-col border-b p-4">
          <div className="flex justify-between items-center gap-2">
            <h1 className="line-clamp-2 break-all text-start font-semibold"> 
              {course.title}
            </h1>
            <div>
            <CourseInfoModal description={course.description!} title={course.title!} level={course.level!} duration={course.duration!} chapters={course.chapters.length} ThemeOutlineColor={ThemeOutlineColor}> 
            <Button variant="ghost" className="h-8 w-8 p-0">
                  <Info width={16} height={16} />
                </Button>
              </CourseInfoModal>
              {canAccess && (
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
          <div className="flex w-full flex-col">
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
