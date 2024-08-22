import { db } from "@/lib/db";
import { getSession } from "next-auth/react";
export const currentProfile = async () => {
  try {
    const session = await getSession();
    if (!session?.user?.id) 
    {   
      return null;
    }
    const profile = await db?.profile?.findFirst({
      where: { 
        userId: session.user.id ,
        containerId: process.env.CONTAINER_ID
      },
      include: {
        container: true,
      },
    });
    if (!profile) {
      return null;
    }
    return profile;
  } catch (error) {
    console.log("An error occured in current profile" , error );
    return null;
  }
};

// export const currentProfile = async () => {
//   const { userId } = auth();

//   if (!userId) {
//     return null;
//   }

//   const profile = await db.profile.findUnique({
//     where: {
//       userId,
//       containerId: process.env.CONTAINER_ID
//     }
//   });

//   return profile;
// }