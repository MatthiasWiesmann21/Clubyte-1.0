import { NextApiRequest } from "next";
import { getSession } from "next-auth/react"; // Import getSession from NextAuth
import { db } from "@/lib/db";

export const currentProfilePages = async (req: NextApiRequest) => {
  // Get the session from NextAuth
  const session = await getSession({ req });
  
  // Check if session exists and has a user ID
  if (!session?.user?.id) {
    return null;
  }

  const profile = await db.profile.findFirst({
    where: {
      userId: session.user.id,
    },
  });

  return profile;
};
