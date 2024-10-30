"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO } from "socket.io-client";

type SocketContextType = {
  socket: any | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

// Create a singleton for the socket instance
let socketInstance: any;

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socketInstance) {
      // Initialize socket instance only once
      socketInstance = new (ClientIO as any)(
        process.env.NEXT_PUBLIC_SITE_URL!,
        {
          path: "/api/socket/io",
          addTrailingSlash: false,
        }
      );

      socketInstance.on("connect_error", (err: any) => {
        console.error("Connection error:", err.message);
      });

      socketInstance.on("connect", () => {
        setIsConnected(true);
        console.log("Socket connected");
      });

      socketInstance.on("disconnect", () => {
        setIsConnected(false);
        console.log("Socket disconnected");
      });
    }

    return () => {
      // Clean up on unmount
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
