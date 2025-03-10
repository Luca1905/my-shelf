import React from "react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div
          className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"
          aria-label="Loading spinner"
        ></div>
        <h2 className="text-xl font-semibold">Loading your Shelf...</h2>
        <p className="text-muted-foreground">Please wait a moment.</p>
      </div>
    </div>
  );
}
