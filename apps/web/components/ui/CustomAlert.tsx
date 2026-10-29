"use client";

import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";

export type AlertType = "success" | "error" | "info" | "warning";

export function CustomAlert({
  type = "info",
  title,
  children,
  action,
}: {
  type?: AlertType;
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const styles = {
    success: "bg-emerald-500/10 border-emerald-500/25 text-emerald-300",
    error: "bg-rose-500/10 border-rose-500/25 text-rose-300",
    warning: "bg-amber-500/10 border-amber-500/25 text-amber-300",
    info: "bg-[#00F0FF]/10 border-[#00F0FF]/25 text-[#00F0FF]",
  };

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-[#00F0FF] shrink-0" />,
  };

  return (
    <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${styles[type]}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icons[type]}</div>
        <div className="space-y-0.5 text-xs">
          {title && <h5 className="font-semibold text-zinc-100">{title}</h5>}
          <div className="text-zinc-300 leading-relaxed">{children}</div>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
