import Image from "next/image";
import { useState } from "react";
import { UserAvatar } from "@/components/user-avatar";
import { PostPreview } from "@/components/post-preview";
import ClubyteLoader from "@/components/ui/clubyte-loader";
import { useTheme } from "next-themes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CourseFavoriteCardProps {
  id: string;
  description: string;
  category: string;
  colorCode?: string;
}

export const CourseFavoriteCard = ({
  id,
  description,
  category,
  colorCode,
}: CourseFavoriteCardProps) => {
  return (
    <TooltipProvider>
      <div className="group my-5 h-full overflow-hidden rounded-lg border bg-[#f6f8fa] py-1 hover:shadow-sm dark:border-[#2e3135] dark:bg-[#1b1f23]">
        <div className="group h-full overflow-hidden hover:shadow-sm">
          <div className="m-4 flex flex-col">
            <div className="flex items-start justify-between">
              {category && (
                <div
                  className={`flex items-center gap-x-1 rounded-full border px-3 py-2 text-xs font-[600] transition`}
                  style={{ borderColor: colorCode }}
                >
                  <div className="truncate">{category}</div>
                </div>
              )}
            </div>
            <div className="font-400 text-sm text-black dark:text-white">
              <PostPreview value={description} />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
