import { Category, LiveEvent } from "@prisma/client";
import { EventCard } from "@/components/events-card";
import Link from "next/link";
import { Button } from "./ui/button";
import { NewspaperIcon, PlusCircle } from "lucide-react";
import { useLanguage } from "@/lib/check-language";
import { PostFavoriteCard } from "@/app/(dashboard)/(routes)/news/_components/postFavorite-card";

type EventsWithProgressWithCategory = LiveEvent & {
  category: Category | null;
  currentFavorite: boolean;
};

interface EventsListProps {
  items: EventsWithProgressWithCategory[];
  ThemeOutlineColor: string;
  DarkThemeOutlineColor: string;
  getLiveEvents: any;
  profileRole: string;
}

export const EventsList = ({
  items,
  ThemeOutlineColor,
  DarkThemeOutlineColor,
  getLiveEvents,
  profileRole,
}: EventsListProps) => {
  const currentLanguage = useLanguage();
  const favoritePosts = items?.filter((post) => post?.currentFavorite);
  return (
    <div className="flex">
      <div className="w-full">
        <div
          className="flex w-full gap-2"
          // className="grid gap-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-4"
        >
          {items.map((item: any) => (
            <EventCard
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              imageUrl={item.imageUrl!}
              category={item?.category?.name!}
              categoryColorCode={item?.category?.colorCode!}
              startDateTime={item?.startDateTime}
              endDateTime={item?.endDateTime}
              color={item?.color}
              ThemOutlineColor={ThemeOutlineColor!}
              DarkThemeOutlineColor={DarkThemeOutlineColor!}
              currentFavorite={item?.currentFavorite}
              getLiveEvents={getLiveEvents}
            />
          ))}
        </div>
        {items.length === 0 && (
          <div className="mt-10 text-center text-sm text-muted-foreground">
            No Events found
          </div>
        )}
      </div>
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
  );
};
