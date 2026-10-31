"use client";

import React, { memo } from "react";

interface LoadingSkeletonProps {
  type?: "metrics" | "table" | "cards";
  count?: number;
}

export const LoadingSkeleton = memo(function LoadingSkeleton({
  type = "metrics",
  count = 4,
}: LoadingSkeletonProps) {
  if (type === "metrics") {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-3.5 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-3 sm:p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-muted" />
              <div className="w-12 h-4 rounded-full bg-muted" />
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="w-16 h-3 rounded bg-muted" />
              <div className="w-24 h-6 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "cards") {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl border border-border bg-card p-4 flex items-center justify-between"
          >
            <div className="space-y-2 w-1/3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
            <div className="w-20 h-8 rounded-xl bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3 animate-pulse">
      <div className="h-8 bg-muted rounded-xl w-1/4" />
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-10 bg-muted/60 rounded-xl w-full" />
        ))}
      </div>
    </div>
  );
});

