"use client"
import { initialProfile } from "@/lib/initial-profile";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import authOptions from "@/lib/auth"; // Adjust the import path as needed
import { useEffect } from "react";

export default function Home() {
 return redirect("/dashboard");
}
