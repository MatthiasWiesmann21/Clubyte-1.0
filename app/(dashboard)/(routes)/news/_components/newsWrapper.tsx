"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { PostCard } from "./post-card";
import { Category, Post } from "@prisma/client";
import { useLanguage } from "@/lib/check-language";
import { Categories } from "./categories";
import ClubyteLoader from "@/components/ui/clubyte-loader";
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";
import { PostFavoriteCard } from "./postFavorite-card";
import { BookX, NewspaperIcon, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";

type PostWithProgressWithCategory = Post & {
  category: Category | null;
  likesCount: number;
  favoritesCount: number;
  currentLike: boolean;
  currentFavorite: boolean;
  commentsWithLikes: any;
  commentsCount: number;
};

interface NewsWrapperProps {
  searchParams: {
    categoryId: string;
  };
  categories: any;
  ThemeOutlineColor: string;
  DarkThemeOutlineColor: string;
  profileImage: string;
  profileRole: string;
}

const NewsWrapper = ({
  searchParams,
  categories,
  ThemeOutlineColor,
  DarkThemeOutlineColor,
  profileImage,
  profileRole,
}: NewsWrapperProps) => {
  const { categoryId } = searchParams;
  const [posts, setPosts] = useState<PostWithProgressWithCategory[]>([]);
  const [isLoading, setLoading] = useState(false);
  const { theme } = useTheme();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const { onOpen } = useModal();

  const currentLanguage = useLanguage();

  const getPosts = async (reset = false) => {
    setLoading(true);
    const response = await axios?.get(
      categoryId
        ? `/api/posts?page=${reset ? 1 : page}&categoryId=${categoryId}`
        : `/api/posts?page=${reset ? 1 : page}`
    );
    const newPosts = response?.data?.data ?? [];

    if (reset) {
      setPosts(newPosts);
      setPage(1);
    } else {
      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
    }

    setLoading(false);
    setPage((prevPage) => prevPage + 1);
    setHasMore(newPosts.length > 0);
  };

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    getPosts(true);
  }, [categoryId]);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          getPosts();
        }
      },
      { threshold: 1 }
    );

    if (observer?.current) {
      // @ts-ignore
      observer?.current?.observe(document?.querySelector(".loading-indicator"));
    }

    return () => {
      if (observer?.current) {
        observer?.current?.disconnect();
      }
    };
  }, [hasMore, isLoading, categoryId]);

  const favoritePosts = posts?.filter((post) => post?.currentFavorite);

  return (
    <div className="space-y-4 px-4 pt-4 dark:bg-[#110524]">
      <div className="flex flex-col items-start justify-center md:flex-row md:space-x-4">
        {/* Main Newsfeed Section */}
        <div className="w-full max-w-3xl">
          <Categories
            items={categories}
            ThemeOutlineColor={ThemeOutlineColor}
            DarkThemeOutlineColor={DarkThemeOutlineColor}
          />
          {posts?.map((item) => (
            <PostCard
              key={item?.id}
              id={item?.id}
              title={item?.title}
              imageUrl={item?.imageUrl ?? ""}
              category={item?.category?.name ?? ""}
              description={item?.description ?? ""}
              createdAt={new Date(item?.publishTime!).toDateString()}
              publisherName={item?.publisherName!}
              publisherImageUrl={item?.publisherImageUrl!}
              colorCode={item?.category?.colorCode!}
              likesCount={item?.likesCount}
              favoritesCount={item?.favoritesCount}
              currentLike={item?.currentLike}
              currentFavorite={item?.currentFavorite}
              commentsWithLikes={item?.commentsWithLikes}
              commentsCount={item?.commentsCount}
              updateLikeComment={getPosts}
              profileImage={profileImage}
            />
          ))}
          <div className="loading-indicator" />
          {isLoading ? (
            <div className="flex min-h-screen items-center justify-center">
              {theme === "dark" ? (
                <ClubyteLoader
                  className="h-64 w-64"
                  theme="dark"
                  color="110524"
                />
              ) : (
                <ClubyteLoader
                  className="h-64 w-64"
                  theme="light"
                  color="ffffff"
                />
              )}
            </div>
          ) : (
            !isLoading &&
            posts?.length === 0 && (
              <div className="mt-10 text-center text-sm text-muted-foreground">
                {currentLanguage.news_no_posts_found}
              </div>
            )
          )}
        </div>

        {/* My Favorites Section (hidden on mobile) */}
        <div className="sticky top-4 w-full">
          {profileRole === "ADMIN" ? (
            <Button
            className="inline-flex items-center rounded-3xl hidden lg:inline-flex w-42"
            variant="outline"
            onClick={() => onOpen("createPost")}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>{currentLanguage.post_createPost_button_text}</span>
          </Button>
          
          ) : (
            <div className="mb-20"></div>
          )}
          <div className="mt-11 hidden w-full max-w-lg rounded-lg p-2 outline outline-slate-200 dark:outline-[#1e293b] lg:block">
            <h1 className="mb-4 text-2xl font-medium">
              {currentLanguage.news_myFavorites_title}
            </h1>
            {/* Render favorite posts (example static content for now) */}
            {favoritePosts?.length === 0 && (
              <div className="flex h-16 items-center justify-center text-sm text-muted-foreground">
                <NewspaperIcon className="m-1" size={24} />
                <span>{currentLanguage?.news_no_posts_found}</span>
              </div>
            )}
            {favoritePosts?.map((item) => (
              <PostFavoriteCard
                key={item?.id}
                id={item?.id}
                category={item?.category?.name ?? ""}
                description={item?.description ?? ""}
                createdAt={new Date(item?.publishTime!).toDateString()}
                publisherName={item?.publisherName!}
                publisherImageUrl={item?.publisherImageUrl!}
                colorCode={item?.category?.colorCode!}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise?.resolve(NewsWrapper), { ssr: false });
