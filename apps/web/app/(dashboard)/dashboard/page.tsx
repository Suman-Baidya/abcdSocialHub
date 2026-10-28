"use client";

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
  Send,
  Calendar,
  Mic,
  Palette,
  Share2,
} from "lucide-react";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";

export default function DashboardOverviewPage() {
  const { data: session } = useSession();

  const user = session?.user as any;
  const workspaceName = user?.workspaceName || "Primary Brand";
  const role = user?.role || "OWNER";

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
            Active brand: <span className="text-zinc-200 font-medium">{workspaceName}</span> • Regional Bengali & Indian English Autopilot
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/content"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00F0FF] hover:bg-[#00D4E0] text-[#0A0D14] font-semibold text-xs sm:text-sm transition-all shadow-md shadow-[#00F0FF]/20 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Promo</span>
          </Link>
        </div>
      </div>

      {/* Voice Assistant Mobile Quick-Draft Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#111827] via-[#0F1B2B] to-[#111827] border border-[#00F0FF]/30 shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/30 flex items-center justify-center shrink-0">
            <Mic className="w-5 h-5 text-[#00F0FF] animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
              <span>Voice-to-Poster Assistant</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00F0FF]/20 text-[#00F0FF] font-medium">NEW</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Tap the mic on mobile to speak your offer in Bengali or English. AI drafts 4-platform copy & 1080×1080 poster instantly.
            </p>
          </div>
        </div>

        <Link
          href="/content"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-semibold text-zinc-100 transition-all shrink-0 active:scale-95"
        >
          <Mic className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>Tap & Speak Offer</span>
        </Link>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] font-medium uppercase tracking-wider mb-2">
            <span>Published</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-zinc-100">12</div>
          <p className="text-[11px] text-zinc-400 mt-1">Facebook & Instagram</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] font-medium uppercase tracking-wider mb-2">
            <span>Queue</span>
            <Clock className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-zinc-100">4</div>
          <p className="text-[11px] text-zinc-400 mt-1">Scheduled for this week</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] font-medium uppercase tracking-wider mb-2">
            <span>Pending Review</span>
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-zinc-100">0</div>
          <p className="text-[11px] text-zinc-400 mt-1">All posts approved</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl">
          <div className="flex items-center justify-between text-zinc-400 text-[11px] font-medium uppercase tracking-wider mb-2">
            <span>Credits</span>
            <Coins className="w-3.5 h-3.5 text-[#00F0FF]" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#00F0FF]">100</div>
          <p className="text-[11px] text-zinc-400 mt-1">Free tier reset in 3d</p>
        </div>
      </div>

      {/* Trajectory Area Chart */}
      <PerformanceChart />

      {/* The Mandatory Autopilot Report Grid (Report-First Design) */}
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
                <span className="text-[10px] text-emerald-400 font-medium">Success</span>
              </div>
              <p className="text-zinc-400">
                1080×1080 Pillow rendering engine with Noto Sans Bengali font loaded. Cloudinary CDN configured.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.04] text-xs leading-relaxed">
              <div className="flex items-center justify-between mb-1">
                <span className="text-zinc-200 font-medium">Zero-Cost Neural Audio</span>
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
                <span className="text-zinc-200 font-medium">Weekend Festival Promo</span>
                <span className="text-[10px] text-sky-400 font-medium">Tomorrow, 10:00 AM</span>
              </div>
              <p className="text-zinc-400">
                Automatic broadcast scheduled to WhatsApp Leads list and Instagram feed.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.04] text-xs leading-relaxed">
              <div className="flex items-center justify-between mb-1">
                <span className="text-zinc-200 font-medium">Weekly ROI Digest</span>
                <span className="text-[10px] text-zinc-400 font-medium">Sunday 8:00 PM</span>
              </div>
              <p className="text-zinc-400">
                Weekly summary of WhatsApp inquiries and clicks dispatched to business owner email.
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
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.04] text-xs text-zinc-400 leading-relaxed text-center py-6">
            <p className="text-zinc-200 font-medium mb-1">Queue is clear! 🎉</p>
            No high-risk claims or pending approvals waiting for review. All scheduled posts have passed the guardrail checks.
          </div>
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
