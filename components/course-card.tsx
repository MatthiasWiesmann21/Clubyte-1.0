"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { CourseProgress } from "@/components/course-progress";
import { useState } from "react";
import { useTheme } from "next-themes";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ClubyteLoader from "./ui/clubyte-loader";
import { BookOpen, Clock, GraduationCap, Lightbulb, Medal, Star } from "lucide-react";
import { useLanguage } from "@/lib/check-language";

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl: string;
  chaptersLength: number;
  duration: number;
  level: string;
  price: number;
  isFeatured: boolean;
  isBestseller: boolean;
  isNew: boolean;
  progress: number | null;
  category: string;
  categoryColorCode: string;
  ThemOutlineColor: string;
  DarkThemeOutlineColor: string;
}

export const FreeText = () => {
  return <p className="text-md font-medium text-slate-700 md:text-sm">Free</p>;
};

export const CourseCard = ({
  id,
  title,
  imageUrl,
  chaptersLength,
  duration,
  level,
  isFeatured,
  isBestseller,
  isNew,
  price,
  progress,
  category,
  categoryColorCode,
  ThemOutlineColor,
  DarkThemeOutlineColor,
}: CourseCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const currentLanguage = useLanguage();

  const getBorderColor = () => {
    return theme === "dark" ? DarkThemeOutlineColor : ThemOutlineColor;
  };

  return (
    <TooltipProvider>
      <Link
        href={`/courses/${id}`}
        className="rounded-lg border-2 transition duration-500 ease-in-out"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          borderColor: isHovered ? getBorderColor() : "transparent",
        }}
      >
        <div className="group h-full w-full overflow-hidden rounded-lg bg-slate-100/60 p-2 transition dark:bg-[#0c0319]">
          <div className="relative aspect-video w-full overflow-hidden rounded-md border-2 border-slate-300/50 dark:border-slate-700/60">
            <div className="absolute left-2 top-2 z-10 flex space-x-2">
              {isBestseller && (
                <p className="flex rounded-md bg-yellow-500 p-1 text-sm text-white">
                  <Medal className="pr-1" width={18} height={18} />
                  {currentLanguage.course_card_bestseller}
                  Best seller
                </p>
              )}
              {isNew && (
                <p className="flex rounded-md bg-rose-600 p-1 text-sm text-white dark:bg-rose-600 dark:text-white">
                  <Lightbulb className="pr-1" width={18} height={18} />
                  {currentLanguage.course_card_new}
                  New
                </p>
              )}
              {isFeatured && (
                <p className="flex rounded-md bg-blue-500 p-1 text-sm text-white">
                  <Star className="pr-1" width={18} height={18} />
                  {currentLanguage.course_card_featured}
                  Featured
                </p>
              )}
            </div>
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
              className={`object-cover transition-opacity duration-500 ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
              alt={title}
              src={imageUrl}
              onLoadingComplete={() => setIsLoading(false)}
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Tooltip>
              <TooltipTrigger>
                <span
                  style={{ borderColor: categoryColorCode }}
                  className="line-clamp-1 max-w-[130px] rounded-[12px] border-2 px-3 py-1 text-start text-[12px]"
                >
                  {category}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="whitespace-normal text-sm font-semibold">
                  {category}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="mt-2 flex flex-col">
            <Tooltip>
              <TooltipTrigger>
                <p className="my-2 line-clamp-2 text-start text-[16px] font-semibold">
                  {title}
                </p>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-2">
                <p className="whitespace-normal text-sm font-semibold">
                  {title}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center">
              <div className="flex h-[24px] w-[24px] items-center justify-center">
                <div className="rounded-full bg-[#f7f9fb] p-1 dark:bg-[#2a2235]">
                  <BookOpen
                    width={14}
                    height={14}
                    style={{ color: ThemOutlineColor }}
                  />
                </div>
              </div>
              <span className="ml-1 text-xs">
                {chaptersLength} {chaptersLength < 2 ? "Chapter" : "Chapters"}
              </span>
            </div>
            <div className="flex items-center">
              <div className="flex h-[24px] w-[24px] items-center justify-center">
                <div className="rounded-full bg-[#f7f9fb] p-1 dark:bg-[#2a2235]">
                  <Clock
                    width={14}
                    height={14}
                    style={{ color: ThemOutlineColor }}
                  />
                </div>
              </div>
              <span className="ml-1 text-xs">
                {duration} {duration === 1 ? "Hour" : "Hours"}
              </span>
            </div>
            <div className="flex items-center">
              <div className="flex h-[24px] w-[24px] items-center justify-center">
                <div className="rounded-full bg-[#f7f9fb] p-1 dark:bg-[#2a2235]">
                  <GraduationCap
                    width={14}
                    height={14}
                    style={{ color: ThemOutlineColor }}
                  />
                </div>
              </div>
              <span className="ml-1 text-xs">{level || "No Level"}</span>
            </div>
          </div>
          {progress !== null ? (
            <CourseProgress
              variant={progress === 100 ? "success" : "default"}
              size="sm"
              value={progress}
            />
          ) : (
            <p className="my-2 text-[16px] font-bold text-slate-700 dark:text-slate-200 md:text-sm">
              {price === 0 ? "Free" : formatPrice(price)}
            </p>
          )}
        </div>
      </Link>
    </TooltipProvider>
  );
};
