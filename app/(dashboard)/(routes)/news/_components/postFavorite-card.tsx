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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, MoreVertical, Pencil, Star, Trash } from "lucide-react";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { useLanguage } from "@/lib/check-language";
import { useRouter } from "next/navigation";
import { useIsAdmin } from "@/lib/roleCheck";
import axios from "axios";
import toast from "react-hot-toast";

interface PostFavoriteCardProps {
  id: string;
  description: string;
  createdAt: string;
  publisherName: string;
  publisherImageUrl: string;
  category: string;
  colorCode?: string;
  likesCount: number;
  currentFavorite: boolean;
  currentLike: boolean;
  updateLikeComment: any;
}

export const PostFavoriteCard = ({
  id,
  description,
  createdAt,
  publisherName,
  publisherImageUrl,
  category,
  colorCode,
  likesCount,
  currentLike,
  currentFavorite,
  updateLikeComment,
}: PostFavoriteCardProps) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const { theme } = useTheme();
  const currentLanguage = useLanguage();
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const onDelete = async () => {
    try {
      await axios.delete(`/api/posts/${id}`);
      toast.success("Post deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };
  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  return (
    <TooltipProvider>
      <div className="group my-5 h-full overflow-hidden rounded-lg border-2 bg-[#f6f8fa] hover:shadow-sm dark:border-[#2e3135] dark:bg-[#1b1f23]">
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
              <div className="flex items-center">
                {category && (
                  <div
                    className={`flex items-center gap-x-1 rounded-lg border-2 px-3 py-1 text-xs font-600 transition`}
                    style={{ borderColor: colorCode }}
                  >
                    <div className="truncate">{category}</div>
                  </div>
                )}
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="ml-2 h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/admin/posts/${id}`}>
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
            <div className="font-400 text-sm text-black dark:text-white">
              <PostPreview value={description} />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex">
                <div
                  onClick={async () => {
                    const response = await axios?.post(`/api/like/create`, {
                      postId: id,
                    });
                    if (response?.status === 200) updateLikeComment(true);
                  }}
                  className="m-2 flex cursor-pointer items-center justify-around "
                >
                  <Heart
                    className={
                      !!currentLike
                        ? "text-[#f43f5e] transition duration-200 ease-in-out hover:scale-110"
                        : "border-black transition duration-200 ease-in-out hover:scale-110"
                    }
                    fill={!!currentLike ? "#f43f5e" : "transparent"}
                  />
                  <span className="ml-2 mr-1">{likesCount}</span>
                  Likes
                </div>
                <div
                  onClick={async () => {
                    const response = await axios?.post(`/api/favorite/create`, {
                      postId: id,
                    });
                    if (response?.status === 200) updateLikeComment(true);
                  }}
                  className="m-2 flex cursor-pointer items-center justify-around "
                >
                  <Star
                    className={
                      !!currentFavorite
                        ? "text-[#FFD700] transition duration-200 ease-in-out hover:scale-110"
                        : "border-black transition duration-200 ease-in-out hover:scale-110"
                    }
                    fill={!!currentFavorite ? "#FFD700" : "transparent"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
