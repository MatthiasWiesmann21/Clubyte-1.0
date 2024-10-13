import Image from "next/image";
import { useState } from "react";
import { UserAvatar } from "@/components/user-avatar";
import LikeComment from "./likeComment";
import { PostPreview } from "@/components/post-preview";
import ClubyteLoader from "@/components/ui/clubyte-loader";
import { useTheme } from "next-themes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";
import { Profile } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PostFavoriteCardProps {
  id: string;
  description: string;
  createdAt: string;
  publisherName: string;
  publisherImageUrl: string;
  category: string;
  colorCode?: string;
}

export const PostFavoriteCard = ({
  id,
  description,
  createdAt,
  publisherName,
  publisherImageUrl,
  category,
  colorCode,
}: PostFavoriteCardProps) => {
  return (
    <TooltipProvider>
      <div className="group my-5 h-full overflow-hidden rounded-lg border bg-[#f6f8fa] py-1 hover:shadow-sm dark:border-[#2e3135] dark:bg-[#1b1f23]">
        <div className="group h-full overflow-hidden hover:shadow-sm">
          <div className="m-4 flex flex-col">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <UserAvatar
                  src={publisherImageUrl}
                  className="min-h-64 min-w-64 max-w-64 max-h-64"
                />
                <div className="ml-2 flex flex-col justify-center">
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="font-600 mr-2 line-clamp-1 text-start text-base text-black dark:text-white">
                        {publisherName}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="whitespace-normal text-sm">
                        {publisherName}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <div className="text-xs text-black text-muted-foreground dark:text-white">
                    {createdAt}
                  </div>
                </div>
              </div>
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
