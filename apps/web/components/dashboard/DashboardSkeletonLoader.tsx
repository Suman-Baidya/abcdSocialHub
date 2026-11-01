"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export function DashboardSkeletonLoader() {
  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden relative">
      {/* 1. Sleek Top Glowing Progress Beam */}
      <div className="fixed top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse z-50" />

      {/* 2. Sidebar Skeleton (Desktop Only) */}
      <aside className="hidden xl:flex w-[270px] border-r border-border bg-card/80 shrink-0 h-screen flex-col justify-between p-4 space-y-6">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="h-12 flex items-center gap-3 px-2 border-b border-border/60 pb-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-xs animate-pulse">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="w-28 h-3.5 bg-muted rounded-md animate-pulse" />
              <div className="w-20 h-2 bg-muted/60 rounded-md animate-pulse" />
            </div>
          </div>

          {/* Nav Links Shimmer */}
          <div className="space-y-2">
            <div className="w-16 h-2 bg-muted/50 rounded mb-3 px-2" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-9 rounded-xl bg-muted/40 animate-pulse flex items-center px-3 gap-3 border border-transparent"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-4 h-4 rounded bg-muted/80 shrink-0" />
                <div
                  className="h-3 rounded bg-muted/70"
                  style={{ width: `${60 + (i % 3) * 20}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom User Pill Shimmer */}
        <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 flex items-center gap-3 animate-pulse">
          <div className="w-9 h-9 rounded-xl bg-muted shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="w-24 h-3 bg-muted rounded" />
            <div className="w-16 h-2 bg-muted/60 rounded" />
          </div>
        </div>
      </aside>

      {/* 3. Main Dashboard Skeleton Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar Header Skeleton */}
        <header className="h-16 border-b border-border bg-card/50 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="xl:hidden w-8 h-8 rounded-lg bg-muted/70 animate-pulse" />
            <div className="w-32 sm:w-44 h-4 bg-muted/70 rounded-md animate-pulse" />
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex w-44 md:w-56 h-8 rounded-xl bg-muted/40 border border-border/60 items-center px-3 animate-pulse">
              <div className="w-20 h-2.5 bg-muted/60 rounded" />
            </div>
            <div className="w-8 h-8 rounded-xl bg-muted/60 animate-pulse" />
            <div className="w-8 h-8 rounded-xl bg-muted/60 animate-pulse" />
            <div className="w-8 h-8 rounded-xl bg-primary/20 animate-pulse" />
          </div>
        </header>

        {/* Page Content Skeleton */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* Page Title & Subtitle Shimmer */}
          <div className="space-y-2">
            <div className="w-48 h-6 sm:h-7 bg-muted rounded-lg animate-pulse" />
            <div className="w-72 sm:w-96 h-3.5 bg-muted/60 rounded animate-pulse" />
          </div>

          {/* 4 Stat Cards Shimmer */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border border-border bg-card/70 space-y-3 animate-pulse shadow-2xs"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-muted/80" />
                  <div className="w-12 h-3.5 rounded-full bg-muted/50" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="w-16 h-5 rounded bg-muted/90" />
                  <div className="w-24 h-2.5 rounded bg-muted/60" />
                </div>
              </div>
            ))}
          </div>

          {/* Main Card / Analytics Shimmer */}
          <div className="rounded-2xl border border-border bg-card/60 p-5 sm:p-6 space-y-4 animate-pulse shadow-xs">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="w-40 h-4 bg-muted rounded" />
              <div className="w-20 h-3 bg-muted/60 rounded" />
            </div>
            <div className="space-y-2.5 pt-2">
              <div className="h-10 rounded-xl bg-muted/40 w-full" />
              <div className="h-10 rounded-xl bg-muted/30 w-full" />
              <div className="h-10 rounded-xl bg-muted/20 w-full" />
            </div>
          </div>
        </main>
      </div>

      {/* 4. Elegant Bottom Loading Status Pill */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 rounded-full bg-card/95 border border-border shadow-xl backdrop-blur-md text-xs font-medium text-foreground animate-in fade-in zoom-in-95 duration-200">
        <div className="relative flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="absolute w-3.5 h-3.5 rounded-full bg-primary/40 animate-ping" />
        </div>
        <span>Loading ABCD Social...</span>
      </div>
    </div>
  );
}
