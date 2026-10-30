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
    <div className="h-full flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-card border border-border shadow-sm space-y-3.5">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Credit Balance</h3>
        </div>
        <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary border border-primary/20">
          {planName} Plan
        </span>
      </div>

      <div className="flex items-center gap-4 my-auto">
        {/* Circular SVG Meter */}
        <div className="relative w-20 h-20 sm:w-22 sm:h-22 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-muted"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-primary transition-all duration-1000 ease-out"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Remaining Count */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-foreground leading-none">{remaining}</span>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">Left</span>
          </div>
        </div>

        {/* Breakdown & Top-Up */}
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Monthly Quota</span>
            <span className="text-foreground font-semibold">{allocated}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Used This Cycle</span>
            <span className="text-foreground font-semibold">{used}</span>
          </div>

          <Link
            href="/billing"
            className="w-full mt-1.5 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-muted hover:bg-accent border border-border text-primary font-semibold text-xs transition-all active:scale-95 cursor-pointer"
          >
            <Zap className="w-3 h-3 fill-primary" />
            <span>Top-Up / Upgrade</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
