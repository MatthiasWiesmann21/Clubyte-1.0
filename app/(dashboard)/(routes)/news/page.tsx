import dynamic from "next/dynamic";
import { Category, Post } from "@prisma/client";
import NewsWrapper from "./_components/newsWrapper";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { redirect } from "next/navigation";

type PostWithProgressWithCategory = Post & {
  category: Category | null;
  likesCount: number;
  currentLike: boolean;
  commentsWithLikes: any;
  commentsCount: number;
};

interface SearchPageProps {
  searchParams: {
    categoryId: string;
  };
}

const NewsPage = async ({ searchParams }: SearchPageProps) => {

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect("/");
  }

  const profileImage = await db?.profile?.findUnique({
    where: {
      id: session?.user?.profile?.id,
    },
    select: {
      imageUrl: true,
    },
  });

  const categories = await db?.category?.findMany({
    where: {
      isPublished: true,
      isNewsCategory: true,
      containerId: session?.user?.profile?.containerId,
    },
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  const container: any = await db.container.findUnique({
    where: {
      id: session?.user?.profile?.containerId,
    },
  });

  return (
    <NewsWrapper
      searchParams={searchParams}
      categories={categories}
      ThemeOutlineColor={container?.ThemeOutlineColor!}
      DarkThemeOutlineColor={container?.DarkThemeOutlineColor!}
      profileImage={profileImage?.imageUrl!}
      // TODO: Add course, chapter, liveEvent to the props
    />
  );
};

export default dynamic(() => Promise?.resolve(NewsPage), { ssr: false });
