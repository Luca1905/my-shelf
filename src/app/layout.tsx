import "~/styles/globals.css";
import { type Metadata, type Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { PostHogProvider } from "./_providers/posthog-provider";
import { Inter } from "next/font/google";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";

const inter = Inter({ subsets: ["latin"], weight: ["600"] });

export const metadata: Metadata = {
  title: {
    default: "My Shelf",
    template: "%s | My Shelf",
  },
  description: "Securely store, access, and share your files from anywhere. My Shelf provides a simple and efficient way to manage your digital life.",
  keywords: ["file storage", "cloud storage", "file sharing", "document management"],
  authors: [{ name: "My Shelf" }],
  creator: "My Shelf",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
  ],
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#000" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <head />
        <body
          className={`${inter.className} bg-background text-foreground antialiased`}
          style={{ overflow: 'hidden' }}
        >
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          <PostHogProvider>{children}</PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
