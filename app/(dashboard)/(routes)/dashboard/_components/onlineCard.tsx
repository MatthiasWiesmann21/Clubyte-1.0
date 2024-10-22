"use client";
import { Users } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { useLanguage } from "@/lib/check-language";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

let socket: any;

export const OnlineCard = ({ profileId }: { profileId: string }) => {
  const currentLanguage = useLanguage();
  const [userCount, setUserCount] = useState(0);
  console.log("profileId", profileId);

  useEffect(() => {
    if (!socket) {
      socketInitializer();
    }

    // // Cleanup on unmount to prevent memory leaks
    // return () => {
    //   if (socket) {
    //     socket.disconnect();
    //   }
    // };
  }, []);

  const socketInitializer = async () => {
    await fetch("/api/socket"); // Initialize the socket

    console.log("Attempting to connect to socket...");

    // Check if socket is already initialized
    socket = io({
      path: "/api/socket",
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      // Emit the profileId to the server after connection
      socket.emit("join", { profileId });
    });

    socket.on("userCount", (count: number) => {
      setUserCount(count);
    });
  };
  return (
    <div className="flex items-center gap-x-2 rounded-md border-2 p-3 dark:border-[#221b2e] dark:bg-[#0D071A]">
      <IconBadge variant={"default"} icon={Users} />
      <div>
        <p className="text-sm text-gray-600">
          {currentLanguage?.infocard_currentOnlineUsers}
        </p>
        <p className="font-medium">
          {userCount < 10 ? `0${userCount}` : userCount}
        </p>
      </div>
    </div>
  );
};
