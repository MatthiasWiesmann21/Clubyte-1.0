"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Info,
  MoreVertical,
  Pencil,
  PlayCircle,
  Star,
  Trash,
} from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { useTheme } from "next-themes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import ClubyteLoader from "./ui/clubyte-loader";
import { CategoryItemCard } from "@/app/(dashboard)/(routes)/live-event/_components/category-item-card";
import { Button } from "./ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { DescriptionModal } from "./modals/description-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ConfirmModal } from "./modals/confirm-modal";
import { useLanguage } from "@/lib/check-language";
import { useIsAdmin } from "@/lib/roleCheck";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

interface EventsCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  categoryColorCode: string;
  startDateTime: Date | null | any;
  endDateTime: Date | null | any;
  ThemOutlineColor: string;
  DarkThemeOutlineColor: string;
  currentFavorite: boolean;
  getLiveEvents: any;
}

export const EventCard = ({
  id,
  title,
  description,
  imageUrl,
  category,
  categoryColorCode,
  startDateTime,
  endDateTime,
  ThemOutlineColor,
  DarkThemeOutlineColor,
  currentFavorite,
  getLiveEvents,
}: EventsCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const { onOpen } = useModal();
  const currentLanguage = useLanguage();
  const isAdmin = useIsAdmin();
  const router = useRouter();

  const onDelete = async () => {
    try {
      setIsLoading(true);

      await axios.delete(`/api/liveEvent/${id}`);

      toast.success("Event deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const isLive =
    new Date(startDateTime) <= new Date() &&
    new Date(
      new Date(endDateTime)?.setMinutes(new Date(endDateTime)?.getMinutes() + 1)
    ) >= new Date();

  const getBorderColor = () => {
    return theme === "dark" ? DarkThemeOutlineColor : ThemOutlineColor;
  };

  return (
    <TooltipProvider>
      <div
        className="w-full rounded-lg border-2 transition duration-300 ease-in-out"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          borderColor: isHovered ? getBorderColor() : "",
        }}
      >
        <div className="group h-full overflow-hidden rounded-lg bg-slate-100 p-2 transition dark:border-[#1f182b] dark:bg-[#0c0319] hover:shadow-lg">
          {/* Image and Date/Time Section */}
          <Link href={`/live-event/${id}`} className="relateive flex">
            <div className="relative aspect-video w-full md:w-2/3 overflow-hidden rounded-md md:rounded-l-md md:rounded-r-none">
              {isLive && (
                <p className="absolute left-2 top-2 z-10 flex rounded-md bg-rose-600 p-1 text-white dark:bg-rose-600 dark:text-white">
                  Live
                  <PlayCircle className="pl-1" />
                </p>
              )}
              {/* Show a placeholder or spinner while the image is loading */}
              {isLoading && (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {theme === "dark" ? (
                      <ClubyteLoader
                        className="h-64 w-64"
                        theme="dark"
                        color="0c0319"
                      />
                    ) : (
                      <ClubyteLoader
                        className="h-64 w-64"
                        theme="light"
                        color="f7f9fb"
                      />
                    )}
                  </span>
                </div>
              )}
              <Image
                fill
                className={`h-full w-full object-cover transition-opacity duration-500 ${
                  isLoading ? "opacity-0" : "opacity-100"
                }`}
                alt={title}
                src={imageUrl}
                onLoadingComplete={() => setIsLoading(false)}
              />
            </div>
            {/* Date and Time Section */}
            <div className="flex w-1/3 flex-col max-h-44 hidden md:block items-center py-6 justify-center md:rounded-r-md md:rounded-l-none bg-slate-300 p-2 text-center dark:bg-gray-800">
              <p className="text-xl font-bold">
                {moment(startDateTime).format("DD")}
              </p>
              <p className="text-lg font-semibold">
                {moment(startDateTime).format("MMM")}
              </p>
              <p className="text-sm font-medium">{moment(startDateTime).format("YYYY")}</p>
              <p className="text-sm font-medium">{moment(startDateTime).format("HH:mm")}</p>
            </div>
          </Link>
          <div className="mt-3 flex items-center justify-between">
            <div className="mr-4">
            <CategoryItemCard label={category} colorCode={categoryColorCode} />
            </div>
            <div className="flex items-center justify-between">
              <Star
                size={16}
                fill={!!currentFavorite ? "#FFD700" : "#ffffff00"}
                className="mx-1 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 w-7 h-7 p-1 rounded-md transition duration-200 ease-in-out hover:scale-110"
                style={!!currentFavorite ? { color: "#FFD700" } : {}}
                onClick={async () => {
                  const response = await axios?.post(`/api/favorite/create`, {
                    liveEventId: id,
                  });
                  if (response?.status === 200) getLiveEvents();
                }}
              />
              <DescriptionModal description={description}>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Info width={16} height={16} />
                </Button>
              </DescriptionModal>
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
                    <Link href={`/admin/live-event/${id}`}>
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        {currentLanguage.course_card_edit}
                      </DropdownMenuItem>
                    </Link>
                    <ConfirmModal onConfirm={onDelete}>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isLoading}
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
          {/* Event Title */}
          <Link className="" href={`/live-event/${id}`}>
            <Tooltip>
              <TooltipTrigger>
                <div className="line-clamp-2 py-2 text-start text-sm font-medium md:text-base">
                  {title}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="whitespace-normal text-sm font-medium">
                  {title}
                </div>
              </TooltipContent>
            </Tooltip>
            <div className="flex block md:hidden gap-2 items-center py-2 justify-center rounded-md bg-slate-300 mt-2 text-center dark:bg-gray-800">
              <p className="text-md font-bold">
                {moment(startDateTime).format("DD")}
              </p>
              <p className="text-sm font-medium">
                {moment(startDateTime).format("MMM")}
              </p>
              <p className="text-md font-medium">{moment(startDateTime).format("YYYY")}</p>
              <p className="text-md font-medium">{moment(startDateTime).format("HH:mm")}</p>
            </div>
          </Link>
        </div>
      </div>
    </TooltipProvider>
  );
};
