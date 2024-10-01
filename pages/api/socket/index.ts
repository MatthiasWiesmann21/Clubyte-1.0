import { Server as SocketServer } from "socket.io";
import { NextApiRequest, NextApiResponse } from "next";
import { Server as HTTPServer } from "http";
import { db } from "@/lib/db";

type NextApiResponseWithIO = NextApiResponse & {
  socket: {
    server: HTTPServer & { io?: SocketServer };
  };
};

const ACTIVE_STATUSES = ["Online", "Not Available", "Do Not Disturb"];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseWithIO
) {
  if (!res.socket.server.io) {
    console.log("Initializing new Socket.IO instance");

    const io = new SocketServer(res.socket.server as any, {
      path: "/api/socket",
      transports: ["websocket", "polling"],
    });

    res.socket.server.io = io;

    io.on("connection", async (socket) => {
      console.log("New client connected");

      // Listen for the `join` event to receive profileId from the client
      socket.on("join", async ({ profileId }) => {
        const profile = await db.profile.findUnique({
          where: { id: profileId },
        });
        if (!profile) return;
        console.log(`User with profile IDzz ${profileId} has joined.`);

        if (profile.isOnline === "Offline") {
          await db.profile.update({
            where: { id: profileId },
            data: { isOnline: "Online" },
          });
        }
        // Emit the updated online user count
        const onlineUsersCount = await db.profile.count({
          where: { isOnline: { in: ACTIVE_STATUSES } },
        });
        io.emit("userCount", onlineUsersCount);
        // Store the profileId in the socket instance for reference on disconnect
        socket.data.profileId = profileId;
      });

      // Listen for `statusUpdate` event and update the status
      socket.on("statusUpdate", async ({ profileId, newStatus }) => {
        await db.profile.update({
          where: { id: profileId },
          data: { isOnline: newStatus },
        });

        // Broadcast the updated online user count to all clients
        const onlineUsersCount = await db.profile.count({
          where: { isOnline: { in: ACTIVE_STATUSES } },
        });
        io.emit("userCount", onlineUsersCount);
      });

      // Listen for disconnections
      socket.on("disconnect", async () => {
        const profileId = socket.data.profileId;
        if (!profileId) return;

        console.log(`Client with profile ID ${profileId} disconnected.`);

        // Update the profile status to "Offline" on disconnect
        const profile = await db.profile.findUnique({
          where: { id: profileId },
        });
        if (!profile) return;

        if (profile.isOnline === "Online") {
          await db.profile.update({
            where: { id: profileId },
            data: { isOnline: "Offline" },
          });

          // Emit the updated online user count after disconnection
          const onlineUsersCountAfterDisconnect = await db.profile.count({
            where: { isOnline: { in: ACTIVE_STATUSES } },
          });
          io.emit("userCount", onlineUsersCountAfterDisconnect);
        }
      });
    });
  } else {
    console.log("Socket.IO already initialized");
  }

  res.end();
}
