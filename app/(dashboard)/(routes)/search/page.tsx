import authOptions from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getCourses } from "@/actions/get-courses";
import { CoursesList } from "@/components/courses-list";
import { Categories } from "./_components/categories";
import { Metadata } from "next";
import { CourseCounter } from "@/components/courseCounter";
import getBase64 from "@/lib/getLocalbase64";

export const metadata: Metadata = {
  title: "Browse",
};

interface SearchPageProps {
  searchParams: {
    title: string;
    categoryId: string;
  };
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  // Get the session from NextAuth
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    // Redirect if not authenticated
    return redirect("/");
  }

  const profile = await db.profile.findUnique({
    where: {
      id: userId,
    },
  });

  if (profile?.name === null) {
    // Redirect if profile name is not set
    return redirect("/profile/manageUsername");
  }

  const container: any = await db.container.findUnique({
    where: {
      id: session?.user?.profile?.containerId,
      courses: {
        some: {},
      },
    },
  });

  const existingCourses = await db.course.count({
    where: {
      containerId: session?.user?.profile?.containerId,
    },
  });

  const categoriesWithCourseCounts = await db.category.findMany({
    where: {
      isPublished: true,
      isCourseCategory: true,
      containerId: session?.user?.profile?.containerId,
    },
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: { courses: true }, // Ensure 'courses' matches your schema relation name
      },
    },
  });

  const courses = await getCourses({
    userId,
    ...searchParams,
    containerId: session?.user?.profile?.containerId,
  });

  const containerColors: any = await db?.container?.findUnique({
    where: {
      id: session?.user?.profile?.containerId,
    },
  });

  return (
    <>
      <div className="space-y-4 p-4">
        <CourseCounter
          maxCourses={container?.maxCourses ?? 0}
          courses={existingCourses}
        />
        <Categories
          items={categoriesWithCourseCounts}
          ThemeOutlineColor={container?.ThemeOutlineColor!}
          DarkThemeOutlineColor={container?.DarkThemeOutlineColor!}
        />
        <CoursesList
          items={courses}
          ThemOutlineColor={containerColors?.ThemeOutlineColor!}
          DarkThemeOutlineColor={containerColors?.DarkThemeOutlineColor!}
        />
      </div>
    </>
  );
};

export default SearchPage;
