"use client";
import { CourseCard } from "./course-card";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/check-language";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "./ui/button";
import { NewspaperIcon, PlusCircle } from "lucide-react";
import { CourseFavoriteCard } from "@/app/(dashboard)/(routes)/dashboard/_components/courseFavorite-card";

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
    <div className="flex">
      <div className="w-full">
        <div
          className="flex w-full gap-2"
          // className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4"
        >
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
            {/* {"currentLanguage?.no_courses"} */}
          </div>
        )}
      </div>{" "}
      {/* My Favorites Section (hidden on mobile) */}
      <div className="sticky top-4 w-[400px]">
        {profileRole === "ADMIN" ? (
          <Link href="/admin/create/post">
            <Button className="rounded-3xl" variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              {currentLanguage.post_createPost_button_text}
            </Button>
          </Link>
        ) : (
          <div className="mb-20"></div>
        )}
        <div className="mt-11 hidden w-full max-w-lg rounded-lg p-2 outline outline-slate-200 dark:outline-[#1e293b] lg:block">
          <h1 className="mb-4 text-2xl font-medium">
            {currentLanguage.news_myFavorites_title}
          </h1>
          {/* Render favorite posts (example static content for now) */}
          {favoriteCourses?.length === 0 && (
            <div className="flex h-16 items-center justify-center text-sm text-muted-foreground">
              <NewspaperIcon className="m-1" size={24} />
              <span>{currentLanguage?.news_no_posts_found}</span>
            </div>
          )}
          {favoriteCourses?.map((item) => (
            <CourseFavoriteCard
              key={item?.id}
              id={item?.id}
              category={item?.category?.name ?? ""}
              description={item?.description ?? ""}
              colorCode={item?.category?.colorCode!}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
