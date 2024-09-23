"use client";
import { useState, useEffect } from "react";
import { Categories } from "./categories";
import { useSession } from "next-auth/react";
import EventFilterSidebar from "./filter-sidebar";
import { PastandFuture } from "./past&future";
import { useRouter } from "next/navigation";
import { EventsList } from "@/components/events-list ";

const LiveEventWrapper = ({
  liveEvents,
  categories,
  searchParams,
  container,
}: any): JSX.Element => {
  const { data: session, status } = useSession();
  const [liveEvent, setLiveEvent] = useState([]);
  const router = useRouter();

  useEffect(() => {
    setLiveEvent(liveEvents);
  }, [liveEvents]);

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
        <EventFilterSidebar
          liveEvents={liveEvent}
          setLiveEvent={setLiveEvent}
          PrimaryButtonColor={container?.PrimaryButtonColor!}
          DarkPrimaryButtonColor={container?.DarkPrimaryButtonColor!}
          categories={undefined}
          searchParams={undefined}
        />
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
      />
    </div>
  );
};

export default LiveEventWrapper;