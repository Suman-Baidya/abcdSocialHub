"use client";

import React, { memo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
}

export const ErrorState = memo(function ErrorState({
  title = "Failed to load data",
  message,
  onRetry,
  retrying = false,
}: ErrorStateProps) {
  return (
    <div className="min-h-[360px] flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-card border border-rose-500/30 text-center space-y-4 backdrop-blur-xl shadow-lg">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500 shadow-xs">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-sm sm:text-base font-bold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            disabled={retrying}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retrying ? "animate-spin" : ""}`} />
            <span>{retrying ? "Retrying..." : "Retry Connection"}</span>
          </button>
        )}
      </div>
    </div>
  );
});
