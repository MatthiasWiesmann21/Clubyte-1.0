"use client";

import { useLanguage } from "@/lib/check-language";
import { useIsAdmin } from "@/lib/roleCheck";
import { Infinity, Info, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useModal } from "@/hooks/use-modal-store";

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
  const { onOpen } = useModal();

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
      <div className="text-prima flex w-full items-center rounded-lg border-2 p-3 text-center text-sm font-medium text-slate-400">
        <div className="space-between flex items-center">
          <Info className="mr-2 h-5 w-5" />
          <p className="text-md xs:text-xs text-start">
            {currentLanguage.search_courseCounter_currentCourses} 
          </p>
          <p className="ml-1 w-16 xs:text-xs">
            {courses} / {maxCourseDisplay}
          </p>
        </div>
        <div className="ml-auto">
          {isFrontend && (
            <Button
              className="rounded-lg border-2 border-slate-300 dark:border-slate-800 hover:border-slate-100 p-3 text-md xs:text-xs text-start"
              variant="outline"
              onClick={() => onOpen("createCourse")}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              {currentLanguage.courses_createCourse_button_text}
            </Button>
          )}
        </div>
      </div>
    )
  );
};
