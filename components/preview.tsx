"use client";

import { useLanguage } from "@/lib/check-language";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import "react-quill/dist/quill.bubble.css";
import { Separator } from "./ui/separator";
import { Clock, GraduationCap } from "lucide-react";
import { formatDuration } from "@/lib/formatDuration";

interface PreviewProps {
  value: string;
  duration: string;
  level: string;
  ThemeOutlineColor: string;
}

export const Preview = ({ value, duration, level, ThemeOutlineColor }: PreviewProps) => {
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    []
  );
  const currentLanguage = useLanguage();

  return (
    <div className="mt-4 rounded-lg border-2 bg-slate-100 pt-3 dark:bg-[#0c0319]">
      <span className="ml-4 text-sm font-bold">
        {currentLanguage.chapter_aboutcourse_title}
      </span>
      <div className="mx-4 grid grid-cols-2 text-sm font-bold items-center">
        {duration && (
          <div className="flex items-center my-2">
            <Clock
              className="h-5 w-5" // ensure fixed width and height here as well
              style={{ color: ThemeOutlineColor }}
            />
            <span className="ml-1 text-xs">
              {formatDuration(duration.toString())}
            </span>
          </div>
        )}
        {level && (
          <div className="flex items-center my-2">
            <GraduationCap
              className="h-5 w-5" // fixed size for GraduationCap
              style={{ color: ThemeOutlineColor }}
            />
            <span className="ml-1 text-xs">
              {level || currentLanguage.course_card_no_level}
            </span>
          </div>
        )}
      </div>
      <Separator />
      <span className="text-gray-500">
        <ReactQuill theme="bubble" value={value} readOnly />
      </span>
    </div>
  );
};
