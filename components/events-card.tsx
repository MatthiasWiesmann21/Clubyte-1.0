"use client";

import Image from "next/image";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
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

interface EventsCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  categoryColorCode: string;
  startDateTime: Date | null | any;
  endDateTime: Date | null | any;
  color: string;
  ThemOutlineColor: string;
  DarkThemeOutlineColor: string;
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
  color,
  ThemOutlineColor,
  DarkThemeOutlineColor,
}: EventsCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const { onOpen } = useModal();

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
      <Link
        href={`/live-event/${id}`}
        className="rounded-lg border-2 transition duration-500 ease-in-out"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          borderColor: isHovered ? getBorderColor() : "transparent",
        }}
      >
        <div className="group h-full overflow-hidden rounded-lg bg-slate-100/60 p-2 transition hover:shadow-sm dark:border-[#1f182b] dark:bg-[#0c0319]">
          {/* Image and Date/Time Section */}
          <div className="relative flex">
            <div className="relative aspect-video w-2/3 overflow-hidden rounded-l-md">
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
            <div className="flex w-1/3 flex-col items-center justify-center rounded-r-md bg-gray-100 p-2 text-center dark:bg-gray-800">
              <p className="text-xl font-bold">
                {moment(startDateTime).format("DD")}
              </p>
              <p className="text-md font-semibold">
                {moment(startDateTime).format("MMM")}
              </p>
              <p className="text-sm">{moment(startDateTime).format("YYYY")}</p>
              <span className="mt-3 w-full rounded-md bg-gray-200 px-2 py-1 pb-3 text-xs font-medium dark:bg-gray-700">
                <p className="mt-2 text-xs font-semibold">
                  {moment(startDateTime).format("dddd")}
                </p>
                <p className="mt-2 text-xs font-medium">
                  {moment(startDateTime).format("HH:mm")}
                </p>
              </span>
            </div>
          </div>

          <div className="mt-3 p-2">
            <div>
              <CategoryItemCard
                label={category}
                colorCode={categoryColorCode}
              />
            </div>

            {/* Event Title */}
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
          </div>
        </div>
      </Link>
    </TooltipProvider>
  );
};
