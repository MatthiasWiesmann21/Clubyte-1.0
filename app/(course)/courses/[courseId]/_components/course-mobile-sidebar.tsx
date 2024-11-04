import { Menu } from "lucide-react";
import { Chapter, Course, UserProgress } from "@prisma/client";

import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";

import { CourseSidebarMobile } from "./course-sidebar-mobile";

interface CourseMobileSidebarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
  ThemeOutlineColor: string;
};

export const CourseMobileSidebar = ({ 
  course,
  progressCount,
  ThemeOutlineColor,
}: CourseMobileSidebarProps) => {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <CourseSidebarMobile
          course={course}
          progressCount={progressCount}
          ThemeOutlineColor={ThemeOutlineColor}
        />
      </SheetContent>
    </Sheet>
  )
}