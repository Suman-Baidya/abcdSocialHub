"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Smartphone,
  Coins,
  ArrowUpRight,
  PlusCircle,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { AutopilotBriefing } from "@/components/dashboard/AutopilotBriefing";
import { ChannelHealthWidget } from "@/components/dashboard/ChannelHealthWidget";
import { RecentPostsCarousel } from "@/components/dashboard/RecentPostsCarousel";
import { CreditQuotaRing } from "@/components/dashboard/CreditQuotaRing";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";

interface DashboardData {
  workspace: {
    id: string;
    name: string;
    organizationName: string;
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
  };
  credits: {
    allocated: number;
    used: number;
    remaining: number;
    percentageUsed: number;
    planName: string;
  };
  channels: any;
  recentPosts: any[];
}

export default function DashboardOverviewPage() {
  const { data: session, status: authStatus } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/dashboard/summary");
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("PERMISSION_DENIED");
        }
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchSummary();
    } else if (authStatus === "unauthenticated") {
      setLoading(false);
      setError("Please sign in to view your dashboard");
    }
  }, [authStatus, fetchSummary]);

  // ==========================================
  // STATE 1: PERMISSION-DENIED STATE
  // ==========================================
  if (error === "PERMISSION_DENIED") {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#111722]/90 border border-rose-500/30 text-center space-y-4 backdrop-blur-xl">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-100">Access Restricted</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your current user role does not have authorization to view this workspace dashboard.
            Please contact your organization owner for role permissions.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs font-semibold text-zinc-200"
          >
            Switch Account
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // STATE 2: ERROR STATE (WITH RETRY ACTION)
  // ==========================================
  if (error && !loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#111722]/90 border border-amber-500/30 text-center space-y-4 backdrop-blur-xl">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-100">Dashboard Unavailable</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">{error}</p>
          <button
            onClick={fetchSummary}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00F0FF] hover:bg-[#00D4E0] text-[#0A0D14] font-semibold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // STATE 3: LOADING SKELETON STATE
  // ==========================================
  if (loading || !data) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-white/[0.08] rounded-lg" />
            <div className="h-4 w-72 bg-white/[0.04] rounded-lg" />
          </div>
          <div className="h-10 w-36 bg-white/[0.08] rounded-xl" />
        </div>

        {/* Briefing Banner Skeleton */}
        <div className="h-56 rounded-2xl bg-white/[0.03] border border-white/[0.06]" />

        {/* 4 Stat Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/[0.03] border border-white/[0.06]" />
          ))}
        </div>

        {/* Channels & Quota Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-48 rounded-2xl bg-white/[0.03] border border-white/[0.06]" />
          <div className="h-48 rounded-2xl bg-white/[0.03] border border-white/[0.06]" />
        </div>

        {/* Recent Posts Skeleton */}
        <div className="h-64 rounded-2xl bg-white/[0.03] border border-white/[0.06]" />
      </div>
    );
  }

  const { workspace, stats, autopilot, credits, channels, recentPosts } = data;

  // ==========================================
  // STATE 4: SUCCESS / ACTIVE STATE (INCL. EMPTY WORKSPACE HANDLING)
  // ==========================================
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <span>Autopilot Report</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live IST
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Active brand: <span className="text-zinc-200 font-medium">{workspace.businessName}</span> • Regional Bengali & Indian English Autopilot
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchSummary}
            className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Refresh Dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/content"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00F0FF] hover:bg-[#00D4E0] text-[#0A0D14] font-semibold text-xs sm:text-sm transition-all shadow-md shadow-[#00F0FF]/20 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Promo</span>
          </Link>
        </div>
      </div>

      {/* 1. Daily Executive Autopilot Briefing Banner */}
      <AutopilotBriefing
        businessName={workspace.businessName}
        stats={stats}
        autopilot={autopilot}
        phoneNumber={workspace.phoneNumber}
      />

      {/* 2. 4 Core Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] font-medium uppercase tracking-wider mb-2">
            <span>Published</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-zinc-100">
            {stats.publishedCount}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Facebook & Instagram</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] font-medium uppercase tracking-wider mb-2">
            <span>Queue</span>
            <Clock className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-zinc-100">
            {stats.scheduledCount}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Scheduled for this week</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] font-medium uppercase tracking-wider mb-2">
            <span>Pending Review</span>
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-zinc-100">
            {stats.inReviewCount}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {stats.inReviewCount > 0 ? "Awaiting owner magic link" : "All posts approved"}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] font-medium uppercase tracking-wider mb-2">
            <span>Credits Left</span>
            <Coins className="w-3.5 h-3.5 text-[#00F0FF]" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#00F0FF]">
            {credits.remaining}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">{credits.planName} tier quota</p>
        </div>
      </div>

      {/* 3. Channel Health & Credit Quota Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChannelHealthWidget channels={channels} onRefresh={fetchSummary} />
        </div>
        <div>
          <CreditQuotaRing
            allocated={credits.allocated}
            used={credits.used}
            remaining={credits.remaining}
            percentageUsed={credits.percentageUsed}
            planName={credits.planName}
          />
        </div>
      </div>

      {/* 4. Real-Time Creative Feed & Carousel */}
      <RecentPostsCarousel posts={recentPosts} />

      {/* 5. Trajectory Area Chart */}
      <PerformanceChart />

      {/* 6. The Mandatory Autopilot Report Grid (Report-First Design) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: What Happened */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h2>What Happened (Last 24h)</h2>
          </div>
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.04] text-xs leading-relaxed">
              <div className="flex items-center justify-between mb-1">
                <span className="text-zinc-200 font-medium">Bengali Poster Pipeline Active</span>
                <span className="text-[10px] text-emerald-400 font-medium">Verified</span>
              </div>
              <p className="text-zinc-400">
                1080×1080 Pillow rendering engine with Noto Sans Bengali font loaded. Cloudinary CDN configured.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.04] text-xs leading-relaxed">
              <div className="flex items-center justify-between mb-1">
                <span className="text-zinc-200 font-medium">Neural Voice Synthesis</span>
                <span className="text-[10px] text-emerald-400 font-medium">Ready</span>
              </div>
              <p className="text-zinc-400">
                Microsoft Edge-TTS neural speech enabled for Bengali & Indian English promotional reels.
              </p>
            </div>
          </div>
        </div>

        {/* Column 2: What is Planned Next */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
            <Clock className="w-4 h-4 text-sky-400" />
            <h2>Planned Next</h2>
          </div>
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.04] text-xs leading-relaxed">
              <div className="flex items-center justify-between mb-1">
                <span className="text-zinc-200 font-medium">
                  {autopilot.nextScheduled?.title || "Regional Festival Promotion"}
                </span>
                <span className="text-[10px] text-sky-400 font-medium">
                  {autopilot.nextScheduled
                    ? new Date(autopilot.nextScheduled.scheduledFor).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Asia/Kolkata",
                      }) + " IST"
                    : "Scheduled Queue"}
                </span>
              </div>
              <p className="text-zinc-400">
                Automated publishing dispatch to Facebook Page and Instagram Business feed.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.04] text-xs leading-relaxed">
              <div className="flex items-center justify-between mb-1">
                <span className="text-zinc-200 font-medium">Weekly ROI Digest</span>
                <span className="text-[10px] text-zinc-400 font-medium">Sunday 8:00 PM IST</span>
              </div>
              <p className="text-zinc-400">
                Summary of WhatsApp inquiries, reach, and clicks dispatched to business owner.
              </p>
            </div>
          </div>
        </div>

        {/* Column 3: What Needs Human Review */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2>Needs Human Review</h2>
          </div>

          {autopilot.pendingReviewItem ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-zinc-300 leading-relaxed space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-400">Review Required</span>
                <span className="text-[10px] text-zinc-400">
                  {new Date(autopilot.pendingReviewItem.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
              <p className="text-zinc-300 font-medium">{autopilot.pendingReviewItem.title}</p>
              <p className="text-zinc-400 text-[11px]">
                High-risk offer or festive campaign requires 1-tap mobile approval before publishing.
              </p>
              <Link
                href="/content"
                className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs transition-colors"
              >
                <span>Inspect in Studio</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.04] text-xs text-zinc-400 leading-relaxed text-center py-6">
              <p className="text-zinc-200 font-medium mb-1">Queue is clear! 🎉</p>
              No high-risk claims or pending approvals waiting for review. All scheduled posts have passed guardrail checks.
            </div>
          )}

          <Link
            href="/content"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-200 font-medium text-xs transition-all active:scale-95"
          >
            <span>Draft New Promo in Studio</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#00F0FF]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
