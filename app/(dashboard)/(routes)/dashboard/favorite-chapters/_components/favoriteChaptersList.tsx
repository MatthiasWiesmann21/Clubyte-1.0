"use client";
import React, { useEffect, useState } from "react";
// @ts-ignore
import CanvasJSReact from "@canvasjs/react-charts";
import Image from "next/image";
import { Container } from "@prisma/client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useLanguage } from "@/lib/check-language";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip,
} from "@/components/tooltip";
import { Eye } from "lucide-react";

const FavoriteChaptersList = ({
  colors,
  courses,
}: {
  colors: Container | any;
  courses: any;
}) => {
  const currentLanguage = useLanguage();
  const [coursesProgress, setCoursesProgress] = useState([]);
  const [hoveredCourse, setHoveredCourse] = useState<number | null>(null);
  const { theme } = useTheme();

  const getButtonColor = () => {
    if (theme === "dark") {
      return colors?.DarkPrimaryButtonColor!;
    }
    return colors?.PrimaryButtonColor!;
  };

  const sortedChapters = courses.flatMap((course: any) =>
    course.chapters.map((chapter: any) => {
      return {
        ...course,
        ...chapter,
        courseName: course?.title,
        currentFavorite: chapter?.favorites,
      };
    })
  );

  return (
    <TooltipProvider>
      <div className="graphParent flex justify-between">
        <div className="min-w-xs mr-2 w-full rounded border-2 dark:border-[#221b2e] dark:bg-[#0D071A]">
          <div className="flex items-center justify-between bg-slate-200 p-2 dark:bg-[#150D22]">
            <p className="w-[45%] text-xs">
              {currentLanguage.dashboard_popularChapter_chapterName_text}
            </p>
            <p className="w-[45%] text-xs">
              {currentLanguage.dashboard_popularChapter_courseName_text}
            </p>
            <p className="w-[10%] text-xs">
              {currentLanguage.dashboard_popularChapter_action_text}
            </p>
          </div>
          {sortedChapters
            ?.sort(
              (a: any, b: any) => (b.totalCount || 0) - (a.totalCount || 0)
            )
            ?.map((each: any, index: React.SetStateAction<number | null>) => (
              <div
                key={each?.id}
                className="flex items-center justify-between p-2"
              >
                <Tooltip>
                  <TooltipTrigger className="flex w-[45%] items-center">
                    <Image
                      alt="img"
                      src={each?.imageUrl}
                      objectFit="contain"
                      width={64}
                      height={36}
                      className="rounded-sm"
                    />
                    <div className="ml-2">
                      <p className="m-0 line-clamp-1 text-start">
                        {each?.title}
                      </p>
                      <p className="m-0 line-clamp-1 text-start text-xs text-gray-500">
                        {each?.category?.name}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibolb h-full max-w-[300px] whitespace-normal">
                      {each?.title}
                    </p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger className="w-[45%] text-start">
                    <p className="line-clamp-1">{each?.courseName}</p>
                    <p className="line-clamp-1 text-xs text-gray-500">
                      {each?.category?.name}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="h-full max-w-[300px] whitespace-normal font-semibold">
                      {each?.courseName}
                    </p>
                  </TooltipContent>
                </Tooltip>
                <div className="flex w-[10%]">
                  <Tooltip>
                    <TooltipTrigger>
                      <Link
                        href={`/courses/${each?.courseId}/chapters/${each?.id}`}
                      >
                        <div
                          onMouseEnter={() => setHoveredCourse(index)}
                          onMouseLeave={() => setHoveredCourse(null)}
                          className="rounded-full border-2 p-1 text-xs transition duration-300 ease-in-out"
                          style={{
                            borderColor: getButtonColor(),
                            backgroundColor:
                              hoveredCourse === index ? getButtonColor() : "",
                          }}
                        >
                          <Eye
                            className="h-5 w-5"
                            style={{
                              color: hoveredCourse === index ? "#ffffff" : "",
                            }}
                          />
                        </div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="h-full max-w-[300px] whitespace-normal font-semibold">
                        {
                          currentLanguage.dashboard_courseTable_viewCourse_button_text
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default FavoriteChaptersList;