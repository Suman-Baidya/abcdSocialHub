"use client";

import Link from "next/link";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  FileEdit,
  ArrowRight,
  Palette,
  Layers,
  ArrowUpRight,
  Check,
  Type,
  Phone,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";
import { RecentPostsCarousel } from "@/components/dashboard/RecentPostsCarousel";

interface CreatorStudioViewProps {
  data: {
    workspace: {
      id: string;
      name: string;
      businessName: string;
      phoneNumber?: string;
    };
    stats: {
      publishedCount: number;
      scheduledCount: number;
      inReviewCount: number;
      totalCount: number;
    };
    autopilot: {
      nextScheduled?: { id: string; title: string; scheduledFor: string } | null;
      pendingReviewItem?: { id: string; title: string; createdAt: string } | null;
      upcomingScheduled?: any[];
    };
    brand?: {
      businessName: string;
      tagline?: string;
      primaryColor?: string;
      secondaryColor?: string;
      defaultLanguage?: string;
      phoneNumber?: string;
    } | null;
    recentPosts: any[];
  };
}

export function CreatorStudioView({ data }: CreatorStudioViewProps) {
  const { workspace, stats, autopilot, brand, recentPosts } = data;

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* 1. Header with Strictly 2-3 word title and 7-8 word description */}
      <PageBreadcrumb
        pageTitle="Creator Studio"
        description="Draft AI copy, design regional posters, schedule."
        hideBreadcrumb={true}
      >
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/25 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Creative Seat</span>
          </span>
          <Link
            href="/content"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold transition-all shadow-md shadow-primary/20 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New AI Post</span>
          </Link>
        </div>
      </PageBreadcrumb>

      {/* 2. Creator 4-Metric Grid (TailAdmin responsive 2x2 on Mobile, 4x1 on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-3.5">
        {/* Metric 1: Drafts & Review */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-3.5 md:p-4 transition-all hover:border-purple-500/40 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <FileEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <span>Review Stage</span>
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate block">
              Drafts in Progress
            </span>
            <h4 className="mt-0.5 text-lg sm:text-xl md:text-2xl font-bold text-foreground tracking-tight">
              {stats.inReviewCount}
            </h4>
          </div>
        </div>

        {/* Metric 2: Scheduled Queue */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-3.5 md:p-4 transition-all hover:border-sky-500/40 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <span>Queue Ready</span>
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate block">
              Scheduled Posts
            </span>
            <h4 className="mt-0.5 text-lg sm:text-xl md:text-2xl font-bold text-foreground tracking-tight">
              {stats.scheduledCount}
            </h4>
          </div>
        </div>

        {/* Metric 3: Published Assets */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-3.5 md:p-4 transition-all hover:border-emerald-500/40 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span>Published</span>
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate block">
              Published Live
            </span>
            <h4 className="mt-0.5 text-lg sm:text-xl md:text-2xl font-bold text-foreground tracking-tight">
              {stats.publishedCount}
            </h4>
          </div>
        </div>

        {/* Metric 4: Total Creations */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-3.5 md:p-4 transition-all hover:border-primary/40 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-muted text-foreground border border-border">
              <span>AI Engine</span>
            </div>
          </div>
          <div className="mt-2 sm:mt-2.5">
            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate block">
              Total Creations
            </span>
            <h4 className="mt-0.5 text-lg sm:text-xl md:text-2xl font-bold text-primary tracking-tight">
              {stats.totalCount}
            </h4>
          </div>
        </div>
      </div>

      {/* 3. Hero Section: Quick AI Generation Hub */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 md:p-6 backdrop-blur-xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3.5">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Quick AI Creative Generators</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Launch targeted regional campaigns with localized copywriting and Pillow-rendered visuals.
            </p>
          </div>
          <Link
            href="/content"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <span>Open Advanced Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Card A: Bengali Festive Poster */}
          <Link
            href="/content"
            className="group p-4 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  1080×1080 Square
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">বাংলা</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-purple-400 transition-colors">
                Bengali Festive Poster
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Generate high-resolution regional promotional posters with Noto Sans Bengali typography and brand banner.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>Create Poster</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Card B: Instagram Carousel */}
          <Link
            href="/content"
            className="group p-4 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 hover:border-sky-500/40 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Multi-Slide Hook
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">IG Reel / Post</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-sky-400 transition-colors">
                Instagram Carousel Copy
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Craft multi-slide educational carousels, attention-grabbing opening hooks, and high-conversion bio links.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-sky-400 group-hover:translate-x-1 transition-transform">
              <span>Draft Carousel</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Card C: WhatsApp Promo Blast */}
          <Link
            href="/content"
            className="group p-4 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Direct CTA
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">WhatsApp</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-emerald-400 transition-colors">
                WhatsApp Promo Copy
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Synthesize persuasive limited-time deals, festival greetings, and click-to-chat inquiry messages.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Draft WhatsApp Copy</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Creative Pipeline & Brand Guidelines Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 items-stretch">
        {/* Left Column (2 Cols): Review & Approval Queue */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-4 sm:p-5 backdrop-blur-xl shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-amber-500" />
                <span>Creative Review Pipeline</span>
              </h3>
              <span className="text-[11px] text-muted-foreground">
                {stats.inReviewCount} Draft{stats.inReviewCount === 1 ? "" : "s"} Awaiting Sign-off
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {autopilot.pendingReviewItem ? (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                        In Review
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {autopilot.pendingReviewItem.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Created on {new Date(autopilot.pendingReviewItem.createdAt).toLocaleDateString("en-IN")}.
                      Awaiting workspace owner or client sign-off.
                    </p>
                  </div>
                  <Link
                    href="/content"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-semibold shrink-0 transition-colors"
                  >
                    <span>Edit in Studio</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-muted/40 border border-border text-center space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                    <Check className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground">Creative Pipeline is Up-to-Date</h4>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    All current campaigns have been approved or scheduled. Ready to generate your next regional promotion!
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Next Scheduled Queue:</span>
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span>
                {autopilot.nextScheduled
                  ? new Date(autopilot.nextScheduled.scheduledFor).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    }) + " at " +
                    new Date(autopilot.nextScheduled.scheduledFor).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Kolkata",
                    }) + " IST"
                  : "No pending queue"}
              </span>
            </span>
          </div>
        </div>

        {/* Right Column (1 Col): Active Brand Guidelines Quick Palette */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 backdrop-blur-xl shadow-sm space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                <span>Brand Identity Palette</span>
              </h3>
              <Link
                href="/brand"
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>Edit Kit</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Business Entity</span>
                  <span className="text-xs font-bold text-foreground truncate max-w-[140px]">
                    {brand?.businessName || workspace.businessName}
                  </span>
                </div>
                {brand?.tagline && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">Tagline</span>
                    <span className="text-xs text-foreground truncate max-w-[140px]">
                      {brand.tagline}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Default Language</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
                    {brand?.defaultLanguage || "Bengali"}
                  </span>
                </div>
              </div>

              {/* Brand Typography & Color Chips */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Design Standards
                </span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-primary" />
                    <span>Font Engine</span>
                  </span>
                  <span className="font-semibold text-foreground">Noto Sans Bengali</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-primary" />
                    <span>Brand Colors</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                      style={{ backgroundColor: brand?.primaryColor || "#00F0FF" }}
                      title="Primary Color"
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                      style={{ backgroundColor: brand?.secondaryColor || "#0A0D14" }}
                      title="Secondary Color"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <span className="text-[11px] text-muted-foreground block text-center">
              Pillow & Cairo fonts synchronized with Cloudinary CDN.
            </span>
          </div>
        </div>
      </div>

      {/* 5. Recent Poster Canvas Creations Carousel */}
      <RecentPostsCarousel posts={recentPosts} />
    </div>
  );
}
