"use client";

import {
  CheckCircle,
  Lock,
  MoreVertical,
  Pencil,
  PlayCircle,
  Trash,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import axios from "axios";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/check-language";
import { useIsAdmin } from "@/lib/roleCheck";

interface CourseSidebarItemProps {
  label: string;
  id: string;
  isCompleted: boolean;
  courseId: string;
  isLocked: boolean;
}

export const CourseSidebarItem = ({
  label,
  id,
  isCompleted,
  courseId,
  isLocked,
}: CourseSidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const currentLanguage = useLanguage();
  const isAdmin = useIsAdmin();

  const Icon = isLocked ? Lock : isCompleted ? CheckCircle : PlayCircle;
  const isActive =
    pathname?.split("/")[pathname?.split("/")?.length - 1] === id;

  const onClick = () => {
    router.push(`/courses/${courseId}/chapters/${id}`);
  };

  const onDelete = async () => {
    try {
      await axios.delete(`/api/courses/${courseId}/chapters/${id}`);
      toast.success("Chapter deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            type="button"
            className={cn(
              "flex items-center gap-x-2 pl-2 text-sm font-[500] transition-all hover:bg-slate-300/20 w-full",
              isActive && " bg-slate-200/20 hover:bg-slate-200/20 ",
              isCompleted && "text-emerald-700 hover:text-emerald-700",
              isCompleted && isActive && "bg-emerald-200/20"
            )}
          >
            <div className="flex items-center py-4 w-full">
              <div className="flex items-center pr-1">
                <Icon
                  size={18}
                  className={cn(
                    "w-12 text-black transition-all dark:text-white",
                    isActive && "w-12 text-slate-500",
                    isCompleted && "text-emerald-60 w-12"
                  )}
                />
              </div>
              <span className="line-clamp-2 text-start">{label}</span>
              <div className="ml-auto">
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/admin/courses/${courseId}/chapters/${id}`}>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          {currentLanguage.course_card_edit}
                        </DropdownMenuItem>
                      </Link>
                      <ConfirmModal onConfirm={onDelete}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex w-full justify-start p-2"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          {currentLanguage.course_card_delete}
                        </Button>
                      </ConfirmModal>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            <div
              className={cn(
                "ml-auto h-full border-2 border-slate-700 opacity-0 transition-all",
                isActive && "opacity-100",
                isCompleted && "border-emerald-700"
              )}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-2">
          <p className="whitespace-normal font-semibold">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
