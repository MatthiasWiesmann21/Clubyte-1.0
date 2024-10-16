"use client";
import { useState, useEffect } from "react";
import { Categories } from "./categories";
import { useSession } from "next-auth/react";
import EventFilterSidebar from "./filter-sidebar";
import { PastandFuture } from "./past&future";
import { useRouter } from "next/navigation";
import { EventsList } from "@/components/events-list ";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useLanguage } from "@/lib/check-language";
import axios from "axios";

interface LiveEventWrapperProps {
  liveEvents: any;
  categories: any;
  searchParams: any;
  container: any;
  profileRole: string;
}

export const LiveEventWrapper = ({
  liveEvents,
  categories,
  searchParams,
  container,
  profileRole,
}: LiveEventWrapperProps) => {
  const { data: session, status } = useSession();
  const [liveEvent, setLiveEvent] = useState(liveEvents || []);
  const router = useRouter();
  const currentLanguage = useLanguage();

  const getLiveEvents = async () => {
    const response = await axios?.get(`/api/liveEvent`);
    setLiveEvent(response?.data);
  };

  useEffect(() => {
    getLiveEvents();
  }, []);

  if (status === "loading") {
    return <div>Loading...</div>; // Optionally show a loading state while fetching session
  }

  if (!session) {
    router.push("/auth/signin");
    return <></>; // Ensure a valid JSX element is always returned
  }

  const userId = session.user?.id;

  return (
    <div className="space-y-4 p-4">
      <div className="mr-1 flex justify-between">
        <div className="flex">
          <PastandFuture
            setLiveEvent={setLiveEvent}
            getEvent={{
              userId,
              ...searchParams,
              containerId: session?.user?.profile?.containerId,
            }}
            liveEvent={liveEvent}
            ThemeOutlineColor={container?.ThemeOutlineColor!}
            DarkThemeOutlineColor={container?.DarkThemeOutlineColor!}
          />
          {profileRole === "ADMIN" && (
            <Link href="/admin/create/liveEvent" className="mx-4">
              <Button className="rounded-3xl" variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                {currentLanguage.liveEvent_createEvent_button_text}
              </Button>
            </Link>
          )}
        </div>
        <div>
          <EventFilterSidebar
            liveEvents={liveEvent}
            setLiveEvent={setLiveEvent}
            PrimaryButtonColor={container?.PrimaryButtonColor!}
            DarkPrimaryButtonColor={container?.DarkPrimaryButtonColor!}
            categories={undefined}
            searchParams={undefined}
          />
        </div>
      </div>
      <Categories
        items={categories}
        ThemeOutlineColor={container?.ThemeOutlineColor!}
        DarkThemeOutlineColor={container?.DarkThemeOutlineColor!}
      />
      <EventsList
        items={liveEvent?.map((each: any) => ({
          ...each,
          color: container?.navDarkBackgroundColor,
        }))}
        ThemeOutlineColor={container?.ThemeOutlineColor!}
        DarkThemeOutlineColor={container?.DarkThemeOutlineColor!}
        getLiveEvents={getLiveEvents}
        profileRole={profileRole}
      />
    </div>
  );
};

export default LiveEventWrapper;
