"use client";

import { useLanguage } from "@/lib/check-language";
import { useIsAdmin } from "@/lib/roleCheck";
import { Infinity, Info, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

type ContainerwithamountofCoursesProps = {
  courses: number;
  maxCourses: number;
  isFrontend?: boolean;
};

export const CourseCounter = ({
  maxCourses,
  courses,
  isFrontend,
}: ContainerwithamountofCoursesProps) => {
  const currentLanguage = useLanguage();
  const isRoleAdmins = useIsAdmin();
  const canAccess = isRoleAdmins;
  const maxCourseDisplay =
    maxCourses > 50 ? (
      <>
        <Infinity className="ml-1 inline h-5 w-5" />
      </>
    ) : (
      maxCourses
    );

  return (
    canAccess && (
      <div className="text-prima flex w-full items-center rounded-full border border-black p-3 text-center text-sm text-slate-400 dark:border-white">
        <div className="space-between flex items-center">
        <Info className="mr-2 h-5 w-5" />
        <span>
          {currentLanguage.search_courseCounter_currentCourses} {courses} /{" "}
        </span>
        {maxCourseDisplay}
        </div>
        <div className="ml-auto">
        {isFrontend && (
           <Link href="/admin/create/course">
           <Button className="rounded-3xl" variant="outline">
             <PlusCircle className="mr-2 h-4 w-4" />
             {currentLanguage.courses_createCourse_button_text}
           </Button>
         </Link>
        )}
        </div>
      </div>
    )
  );
};
