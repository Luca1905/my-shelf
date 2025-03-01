import "~/styles/globals.css";
import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { PostHogProvider } from "./_providers/posthog-provider";
import { Inter } from "next/font/google";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { Toaster } from "~/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], weight: "600" });

export const metadata: Metadata = {
  title: "My Shelf",
  description: "The home of your files",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body
          className={`${inter.className} dark bg-background text-foreground antialiased`}
        >
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          <PostHogProvider>
            {children}
            <Toaster />
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
