"use client";

import React, { memo } from "react";
import { CheckCircle2, Clock, AlertTriangle, AlertCircle, Pause } from "lucide-react";

export type StatusType =
  | "PUBLISHED"
  | "APPROVED"
  | "SCHEDULED"
  | "IN_REVIEW"
  | "PENDING"
  | "FAILED"
  | "SUSPENDED"
  | "PAUSED"
  | "ACTIVE";

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<string, { label: string; classNames: string; icon: any }> = {
  PUBLISHED: {
    label: "Published",
    classNames: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25",
    icon: CheckCircle2,
  },
  APPROVED: {
    label: "Approved",
    classNames: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25",
    icon: CheckCircle2,
  },
  ACTIVE: {
    label: "Active",
    classNames: "bg-emerald-500/10 text-emerald-500 border-emerald-500/25",
    icon: CheckCircle2,
  },
  SCHEDULED: {
    label: "Scheduled",
    classNames: "bg-sky-500/10 text-sky-400 border-sky-500/25",
    icon: Clock,
  },
  IN_REVIEW: {
    label: "In Review",
    classNames: "bg-amber-500/10 text-amber-400 border-amber-500/25",
    icon: Clock,
  },
  PENDING: {
    label: "Pending",
    classNames: "bg-amber-500/10 text-amber-400 border-amber-500/25",
    icon: Clock,
  },
  FAILED: {
    label: "Failed",
    classNames: "bg-rose-500/10 text-rose-400 border-rose-500/25",
    icon: AlertCircle,
  },
  SUSPENDED: {
    label: "Suspended",
    classNames: "bg-rose-500/10 text-rose-400 border-rose-500/25",
    icon: AlertTriangle,
  },
  PAUSED: {
    label: "Paused",
    classNames: "bg-muted text-muted-foreground border-border",
    icon: Pause,
  },
};

export const StatusBadge = memo(function StatusBadge({
  status,
  label,
  size = "sm",
}: StatusBadgeProps) {
  const normalized = status.toUpperCase().replace(/\s+/g, "_");
  const config = STATUS_CONFIG[normalized] || {
    label: status,
    classNames: "bg-muted text-muted-foreground border-border",
    icon: Clock,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border ${
        config.classNames
      } ${
        size === "sm"
          ? "text-[9px] sm:text-[10px] px-2 py-0.5"
          : "text-xs px-2.5 py-1"
      }`}
    >
      <Icon className={size === "sm" ? "w-2.5 h-2.5 sm:w-3 sm:h-3" : "w-3.5 h-3.5"} />
      <span>{label || config.label}</span>
    </span>
  );
});
