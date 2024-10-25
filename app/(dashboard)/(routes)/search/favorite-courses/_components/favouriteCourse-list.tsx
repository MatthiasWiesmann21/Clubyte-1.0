"use client";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/check-language";
import { useSearchParams } from "next/navigation";
import { CourseFavoriteCard } from "@/app/(dashboard)/(routes)/dashboard/_components/courseFavorite-card";
import { Separator } from "@/components/ui/separator";
import { CourseCard } from "@/components/course-card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CoursesListProps {
  ThemOutlineColor: string;
  DarkThemeOutlineColor: string;
  profileRole: string;
}

export const FavouriteCoursesList = ({
  ThemOutlineColor,
  DarkThemeOutlineColor,
  profileRole,
}: CoursesListProps) => {
  const searchParams = useSearchParams();
  const categoryId = searchParams?.get("categoryId") || "";
  const title = searchParams?.get("title") || "";
  const currentLanguage = useLanguage();
  const [items, setItems] = useState<any[]>([]);
  const [Favorites, setFavorites] = useState<any[]>([]);

  const getAllCourses = async () => {
    const response = await fetch(`/api/search?categoryId=${categoryId}`);
    const data = await response.json();
    setItems(data);
    setFavorites(data?.filter((course: any) => course?.currentFavorite));
  };

  useEffect(() => {
    getAllCourses();
  }, [categoryId, title]);

  return (
    <div className="flex w-full flex-col items-start justify-center gap-4">
      <Link
        href={`/search`}
        className="mb-2 flex items-center text-sm transition hover:opacity-75"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {currentLanguage.courses_list_backToCourses_button_text}
      </Link>
      {/* My Favorites Section (hidden on mobile) */}
      <div>
        {Favorites?.length > 0 && (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {Favorites?.map((item) => (
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
        )}
      </div>
    </div>
  );
};
