import "~/styles/globals.css";
import type React from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Toaster } from "~/components/ui/sonner";
import { LoadingSpinner } from "~/components/ui/loadingSpinner";

export default function FolderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* TODO */}
            </div>
            <nav className="flex items-center space-x-2">
              <SignedOut>
                <SignInButton mode="modal" />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <Toaster
        icons={{
          loading: <LoadingSpinner />,
        }}
        visibleToasts={5}
        richColors
      />
    </div>
  );
}
