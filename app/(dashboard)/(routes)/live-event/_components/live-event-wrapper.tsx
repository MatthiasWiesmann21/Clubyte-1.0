"use client";
import { useState, useEffect, use } from "react";
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
import { useModal } from "@/hooks/use-modal-store";

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
  const { onOpen } = useModal();

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
            <Button
              className="mx-2 rounded-3xl text-start text-xs"
              variant="outline"
              onClick={() => onOpen("createLiveEvent")}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              {currentLanguage.liveEvent_createEvent_button_text}
            </Button>
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
