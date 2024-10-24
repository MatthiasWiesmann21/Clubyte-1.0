"use client";
import { CourseCard } from "./course-card";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/check-language";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "./ui/button";
import { NewspaperIcon, PlusCircle } from "lucide-react";
import { CourseFavoriteCard } from "@/app/(dashboard)/(routes)/dashboard/_components/courseFavorite-card";
import { Separator } from "./ui/separator";

interface CoursesListProps {
  ThemOutlineColor: string;
  DarkThemeOutlineColor: string;
  profileRole: string;
}

export const CoursesList = ({
  ThemOutlineColor,
  DarkThemeOutlineColor,
  profileRole,
}: CoursesListProps) => {
  const searchParams = useSearchParams();
  const categoryId = searchParams?.get("categoryId") || "";
  const currentLanguage = useLanguage();
  const [items, setItems] = useState<any[]>([]);

  const getAllCourses = async () => {
    const response = await fetch(`/api/search?categoryId=${categoryId}`);
    const data = await response.json();
    setItems(data);
  };

  useEffect(() => {
    getAllCourses();
  }, []);

  const favoriteCourses = items?.filter((course) => course?.currentFavorite);
  return (
    <div className="flex w-[620px] lg:w-full">
      <div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {items.map((item) => (
            <CourseCard
              key={item.id}
              id={item.id}
              title={item.title}
              imageUrl={item.imageUrl!}
              description={item.description!}
              category={item?.category?.name!}
              categoryColorCode={item?.category?.colorCode!}
              progress={item.progress}
              chaptersLength={item.chapters.length}
              price={item.price!}
              duration={item?.duration!}
              level={item?.level!}
              isFeatured={item?.isFeatured!}
              isBestseller={item?.isBestseller!}
              isNew={item?.isNew!}
              currentFavorite={item?.currentFavorite!}
              ThemOutlineColor={ThemOutlineColor}
              DarkThemeOutlineColor={DarkThemeOutlineColor!}
              getAllCourses={getAllCourses}
            />
          ))}
        </div>
        {items.length === 0 && (
          <div className="mt-10 text-center text-sm text-muted-foreground">
            {currentLanguage?.no_courses}
          </div>
        )}
      </div>
      {/* My Favorites Section (hidden on mobile) */}
      <div className="top-4 w-[250px] xl:w-[400px]">
        {favoriteCourses?.length > 0 && (
          <div className="ml-2 hidden w-full max-w-lg rounded-lg p-2 outline outline-slate-200 dark:outline-[#1e293b] lg:block">
            <h1 className="mb-2 text-2xl font-medium">
              {currentLanguage.news_myFavorites_title}
            </h1>
            <Separator className="" />
            {favoriteCourses?.map((item) => (
              <CourseFavoriteCard
                key={item.id}
                id={item.id}
                title={item.title}
                imageUrl={item.imageUrl!}
                description={item.description!}
                category={item?.category?.name!}
                categoryColorCode={item?.category?.colorCode!}
                progress={item.progress}
                chaptersLength={item.chapters.length}
                price={item.price!}
                duration={item?.duration!}
                level={item?.level!}
                isFeatured={item?.isFeatured!}
                isBestseller={item?.isBestseller!}
                isNew={item?.isNew!}
                currentFavorite={item?.currentFavorite!}
                ThemOutlineColor={ThemOutlineColor}
                DarkThemeOutlineColor={DarkThemeOutlineColor!}
                getAllCourses={getAllCourses}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
