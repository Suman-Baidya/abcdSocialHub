"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Coins,
  ArrowUpRight,
  PlusCircle,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  Layers,
  Send,
} from "lucide-react";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";
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

  // STATE 1: PERMISSION-DENIED
  if (error === "PERMISSION_DENIED") {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#111722] border border-rose-500/30 text-center space-y-4 backdrop-blur-xl">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-zinc-100">Access Restricted</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your user role does not have authorization to inspect this workspace.
            Please contact your organization owner for permission grant.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs font-semibold text-zinc-200"
          >
            Switch Account
          </Link>
        </div>
      </div>
    );
  }

  // STATE 2: ERROR
  if (error && !loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#111722] border border-amber-500/30 text-center space-y-4 backdrop-blur-xl">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-zinc-100">Dashboard Unavailable</h2>
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

  // STATE 3: LOADING
  if (loading || !data) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-pulse">
        <div className="h-6 w-48 bg-zinc-800 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-zinc-900/60 border border-zinc-800" />
          ))}
        </div>
        <div className="h-56 rounded-2xl bg-zinc-900/60 border border-zinc-800" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-48 rounded-2xl bg-zinc-900/60 border border-zinc-800" />
          <div className="h-48 rounded-2xl bg-zinc-900/60 border border-zinc-800" />
        </div>
      </div>
    );
  }

  const { workspace, stats, autopilot, credits, channels, recentPosts } = data;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* TailAdmin Standard Page Breadcrumb */}
      <PageBreadcrumb pageTitle="Autopilot Report" parentTitle="Dashboard" parentHref="/dashboard" />

      {/* 1. TailAdmin Standard 4-Metric Grid (EcommerceMetrics style) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
        {/* Metric Card 1: Published */}
        <div className="rounded-2xl border border-zinc-800 bg-[#111722]/80 p-5 md:p-6 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Published Posts
              </span>
              <h4 className="mt-1.5 text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {stats.publishedCount}
              </h4>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowUp className="w-3 h-3" />
              <span>+12.4%</span>
            </div>
          </div>
        </div>

        {/* Metric Card 2: Queue */}
        <div className="rounded-2xl border border-zinc-800 bg-[#111722]/80 p-5 md:p-6 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20">
            <Clock className="w-5 h-5 text-sky-400" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Scheduled Queue
              </span>
              <h4 className="mt-1.5 text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {stats.scheduledCount}
              </h4>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <span>IST Queue</span>
            </div>
          </div>
        </div>

        {/* Metric Card 3: Pending Review */}
        <div className="rounded-2xl border border-zinc-800 bg-[#111722]/80 p-5 md:p-6 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Review Required
              </span>
              <h4 className="mt-1.5 text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {stats.inReviewCount}
              </h4>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <span>Mobile Link</span>
            </div>
          </div>
        </div>

        {/* Metric Card 4: Credits Left */}
        <div className="rounded-2xl border border-zinc-800 bg-[#111722]/80 p-5 md:p-6 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/20">
            <Coins className="w-5 h-5 text-[#00F0FF]" />
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Available Credits
              </span>
              <h4 className="mt-1.5 text-2xl sm:text-3xl font-bold text-[#00F0FF] tracking-tight">
                {credits.remaining}
              </h4>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
              <span>{credits.planName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Executive Autopilot Briefing Banner */}
      <AutopilotBriefing
        businessName={workspace.businessName}
        stats={stats}
        autopilot={autopilot}
        phoneNumber={workspace.phoneNumber}
      />

      {/* 3. Channel Health & Credit Quota Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
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

      {/* 4. Creative Feed & Recent Posters Carousel */}
      <RecentPostsCarousel posts={recentPosts} />

      {/* 5. Trajectory Area Chart */}
      <PerformanceChart />

      {/* 6. Standard 3-Column Report Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
        {/* Column 1: What Happened */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#111722]/80 border border-zinc-800 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3>Execution Activity (Last 24h)</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs leading-relaxed">
              <div className="flex items-center justify-between mb-1">
                <span className="text-zinc-200 font-medium">Regional Poster Synthesis</span>
                <span className="text-[10px] text-emerald-400 font-medium">Verified</span>
              </div>
              <p className="text-zinc-400">
                1080×1080 Pillow rendering engine with Noto Sans Bengali font loaded. Cloudinary CDN configured.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs leading-relaxed">
              <div className="flex items-center justify-between mb-1">
                <span className="text-zinc-200 font-medium">Neural Voice Synthesis</span>
                <span className="text-[10px] text-emerald-400 font-medium">Active</span>
              </div>
              <p className="text-zinc-400">
                Microsoft Edge-TTS neural speech enabled for Bengali and Indian English promotional reels.
              </p>
            </div>
          </div>
        </div>

        {/* Column 2: What is Planned Next */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#111722]/80 border border-zinc-800 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
            <Clock className="w-4 h-4 text-sky-400" />
            <h3>Scheduled Operations</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs leading-relaxed">
              <div className="flex items-center justify-between mb-1">
                <span className="text-zinc-200 font-medium">
                  {autopilot.nextScheduled?.title || "Regional Promo Distribution"}
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

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs leading-relaxed">
              <div className="flex items-center justify-between mb-1">
                <span className="text-zinc-200 font-medium">Weekly Performance Digest</span>
                <span className="text-[10px] text-zinc-400 font-medium">Sunday 8:00 PM IST</span>
              </div>
              <p className="text-zinc-400">
                Summary of WhatsApp inquiries, reach, and clicks dispatched to business owner.
              </p>
            </div>
          </div>
        </div>

        {/* Column 3: What Needs Human Review */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#111722]/80 border border-zinc-800 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3>Action & Review Required</h3>
          </div>

          {autopilot.pendingReviewItem ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-zinc-300 leading-relaxed space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-400">Approval Required</span>
                <span className="text-[10px] text-zinc-400">
                  {new Date(autopilot.pendingReviewItem.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
              <p className="text-zinc-200 font-medium">{autopilot.pendingReviewItem.title}</p>
              <p className="text-zinc-400 text-[11px]">
                High-risk promotion or festive deal requires mobile approval before automatic publishing.
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
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 leading-relaxed text-center py-6">
              <p className="text-zinc-200 font-medium mb-1">Queue is Clear</p>
              All scheduled promotions have been reviewed and approved. All posts have passed guardrail checks.
            </div>
          )}

          <Link
            href="/content"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-zinc-800 text-zinc-200 font-medium text-xs transition-all active:scale-95"
          >
            <span>Draft New Campaign in Studio</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#00F0FF]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
