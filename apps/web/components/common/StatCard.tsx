"use client";

import React, { memo } from "react";
import { LucideIcon } from "lucide-react";

export type StatVariant = "primary" | "emerald" | "sky" | "amber" | "rose" | "purple";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: StatVariant;
  badge?: {
    text: string;
    variant?: "success" | "info" | "warning" | "neutral";
  };
  subtitle?: string;
  onClick?: () => void;
}

const VARIANT_STYLES: Record<StatVariant, { iconBg: string; iconColor: string; borderHover: string }> = {
  primary: {
    iconBg: "bg-primary/10 border-primary/20",
    iconColor: "text-primary",
    borderHover: "hover:border-primary/40",
  },
  emerald: {
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    iconColor: "text-emerald-500",
    borderHover: "hover:border-emerald-500/40",
  },
  sky: {
    iconBg: "bg-sky-500/10 border-sky-500/20",
    iconColor: "text-sky-400",
    borderHover: "hover:border-sky-500/40",
  },
  amber: {
    iconBg: "bg-amber-500/10 border-amber-500/20",
    iconColor: "text-amber-400",
    borderHover: "hover:border-amber-500/40",
  },
  rose: {
    iconBg: "bg-rose-500/10 border-rose-500/20",
    iconColor: "text-rose-400",
    borderHover: "hover:border-rose-500/40",
  },
  purple: {
    iconBg: "bg-purple-500/10 border-purple-500/20",
    iconColor: "text-purple-400",
    borderHover: "hover:border-purple-500/40",
  },
};

const BADGE_STYLES = {
  success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  info: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

export const StatCard = memo(function StatCard({
  title,
  value,
  icon: Icon,
  variant = "primary",
  badge,
  subtitle,
  onClick,
}: StatCardProps) {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-border bg-card p-3 sm:p-3.5 md:p-4 shadow-sm transition-all duration-200 ${
        styles.borderHover
      } ${onClick ? "cursor-pointer active:scale-98" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border ${styles.iconBg} ${styles.iconColor}`}
        >
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>

        {badge && (
          <span
            className={`text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full border ${
              BADGE_STYLES[badge.variant || "neutral"]
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      <div className="mt-2 sm:mt-2.5">
        <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wider block truncate">
          {title}
        </span>
        <h4 className="mt-0.5 text-lg sm:text-xl md:text-2xl font-bold text-foreground tracking-tight truncate">
          {value}
        </h4>
        {subtitle && (
          <span className="text-[10px] text-muted-foreground mt-0.5 block truncate">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
});

