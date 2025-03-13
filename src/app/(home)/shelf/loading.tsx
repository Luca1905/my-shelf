import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center">
      <div
        className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"
        role="status"
        aria-label="Loading spinner"
      />
      <h2 className="text-xl font-semibold mb-2">Loading your Shelf...</h2>
      <p className="text-muted-foreground">Please wait a moment.</p>
    </div>
  );
}
