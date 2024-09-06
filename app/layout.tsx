import "./globals.css";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/providers/toaster-provider";
import { ConfettiProvider } from "@/components/providers/confetti-provider";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { Providers } from "./redux/provider";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import Link from "@/components/link";
import authOptions from "@/lib/auth";
import { getServerSession } from "next-auth";
import { initialProfile } from "@/lib/initial-profile";
import AuthProvider from "./auth-provider";

const font = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clubyte",
  description: "Bring your Community together.",
};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const profile = await initialProfile();

  const session = await getServerSession(authOptions);

  const user = session?.user;

  if (user) {
    
  }
  return (
    <html lang="en">
      <body className={cn(font.className, "bg-white dark:bg-[#110524]")}>
        <NextSSRPlugin
          /**
           * The `extractRouterConfig` will extract **only** the route configs
           * from the router to prevent additional information from being
           * leaked to the client. The data passed to the client is the same
           * as if you were to fetch `/api/uploadthing` directly.
           */
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
        <AuthProvider session={session}>
        {children}
        </AuthProvider>
      </body>
    </html>
  );
}
