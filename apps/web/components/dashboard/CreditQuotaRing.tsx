"use client";

import Link from "next/link";
import { Coins, ArrowUpRight, Zap } from "lucide-react";

interface CreditQuotaRingProps {
  allocated: number;
  used: number;
  remaining: number;
  percentageUsed: number;
  planName: string;
}

export function CreditQuotaRing({
  allocated,
  used,
  remaining,
  percentageUsed,
  planName,
}: CreditQuotaRingProps) {
  // SVG circle calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentageUsed / 100) * circumference;

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-[#00F0FF]" />
          <h3 className="text-sm font-semibold text-zinc-100">Credit Balance</h3>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20">
          {planName} Plan
        </span>
      </div>

      <div className="flex items-center gap-5">
        {/* Circular SVG Meter */}
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-white/[0.06]"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-[#00F0FF] transition-all duration-1000 ease-out"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-bold text-zinc-100">{remaining}</span>
            <span className="text-[9px] uppercase tracking-wider text-zinc-400">Left</span>
          </div>
        </div>

        {/* Breakdown & Top-Up */}
        <div className="space-y-2 flex-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Monthly Quota</span>
            <span className="text-zinc-200 font-medium">{allocated} credits</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Used This Cycle</span>
            <span className="text-zinc-200 font-medium">{used} credits</span>
          </div>

          <Link
            href="/billing"
            className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-[#00F0FF] font-semibold text-xs transition-all active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-[#00F0FF]" />
            <span>Top-Up / Upgrade</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
