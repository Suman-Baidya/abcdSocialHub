"use client";

import React, { memo } from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
}

export const EmptyState = memo(function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  actionIcon: ActionIcon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 rounded-2xl border border-dashed border-border bg-card/40 text-center space-y-3.5 animate-in fade-in">
      <div className="w-12 h-12 rounded-2xl bg-muted/80 border border-border flex items-center justify-center text-muted-foreground shadow-xs">
        <Icon className="w-6 h-6" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20 transition-all active:scale-95 cursor-pointer mt-1"
        >
          {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
});

