import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center">
      <div
        className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"
        role="status"
        aria-label="Loading spinner"
      />
      <h2 className="mb-2 text-xl font-semibold">Loading your Shelf...</h2>
      <p className="text-muted-foreground">Please wait a moment.</p>
    </div>
  );
}
