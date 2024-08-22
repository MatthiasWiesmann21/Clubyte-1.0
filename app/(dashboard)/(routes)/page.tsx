"use client"
import { initialProfile } from "@/lib/initial-profile";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import authOptions from "@/lib/auth"; // Adjust the import path as needed
import { useEffect } from "react";

export default function Home() {
  let profile = null;
  useEffect( ()=>{
    initialProfile().then(resp=>{
      console.log("Initial profile fetched" , resp )
      profile = resp;
    }, err=>{
      console.log("An error occured while fetching initial profile" , err)
    })
  })

  if (profile) {
    return redirect("/dashboard");
  }

  // Optional: handle cases where profile or user is missing
  // e.g., redirect to a sign-in page or show an error message
  return redirect("/auth/sign-in");
}
