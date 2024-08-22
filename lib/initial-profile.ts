import { getSession, signIn } from "next-auth/react";
import { db } from "./db";

export const initialProfile = async () => {
  const session = await getSession();

  if (!session?.user?.id) {
    // Redirect to sign-in if no user is authenticated
    signIn();
    return;
  }

  // Attempt to find the existing profile first
  const existingProfile = await db.profile.findFirst({
    where: {
      userId: session.user.id,
    },
  });

  // If the profile exists, update it
  if (existingProfile) {
    const updatedProfile = await db.profile.update({
      where: {
        id: session.user.id,
      },
      data: {
        imageUrl: session.user.image || existingProfile.imageUrl,
        email: session.user.email || existingProfile.email,
        isOnline: "Online",
        // You may update other fields as needed
      },
    });
    return updatedProfile;
  } else {
    // If the profile does not exist, create a new one
    const newProfile = await db.profile.create({
      data: {
        userId: session.user.id,
        name: session.user.name || "User",
        password : '',
        imageUrl: session.user.image || "",
        email: session.user.email || "",
        containerId: process.env.CONTAINER_ID!,
        isOnline: "Online",
        isBanned: "NOT BANNED",
      },
    });
    return newProfile;
  }
};
