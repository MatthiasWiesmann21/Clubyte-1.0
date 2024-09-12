import { NextApiRequest } from "next";
import { db } from "@/lib/db";
import authOptions from "@/lib/auth";
import { getServerSession } from "next-auth";
export const currentProfilePages = async (req: NextApiRequest) => {
  try{
  // Get the session from NextAuth
  const session = await getServerSession(authOptions);
  
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
  }catch(err){
    console.log("An error occured while accessing current profile:" , err)
  }
  return null;

};
