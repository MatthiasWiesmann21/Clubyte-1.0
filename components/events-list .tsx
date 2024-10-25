import { Category, LiveEvent } from "@prisma/client";
import { EventCard } from "@/components/events-card";
import Link from "next/link";
import { Button } from "./ui/button";
import { NewspaperIcon, PlusCircle } from "lucide-react";
import { useLanguage } from "@/lib/check-language";
import { PostFavoriteCard } from "@/app/(dashboard)/(routes)/news/_components/postFavorite-card";
import { EventFavoriteCard } from "@/app/(dashboard)/(routes)/live-event/_components/eventFavorite-card";
import { Separator } from "./ui/separator";

type EventsWithProgressWithCategory = LiveEvent & {
  category: Category | null;
  currentFavorite: boolean;
};

interface EventsListProps {
  items: EventsWithProgressWithCategory[];
  ThemeOutlineColor: string;
  DarkThemeOutlineColor: string;
  getLiveEvents: any;
}

export const EventsList = ({
  items,
  ThemeOutlineColor,
  DarkThemeOutlineColor,
  getLiveEvents,
}: EventsListProps) => {
  const currentLanguage = useLanguage();
  const favoriteEvents = items?.filter((event) => event?.currentFavorite);
  return (
    <div className="flex w-full flex-col items-start justify-center gap-4">
      <div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
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
    </div>
  );
};
