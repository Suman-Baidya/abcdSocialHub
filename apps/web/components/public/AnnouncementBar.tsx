"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

interface AnnouncementBarProps {
  announcement?: {
    enabled: boolean;
    badge: string;
    text: string;
    linkText: string;
    linkUrl: string;
  };
}

export function AnnouncementBar({ announcement }: AnnouncementBarProps) {
  if (!announcement || !announcement.enabled) return null;

  return (
    <aside
      aria-label="Announcement"
      className="relative z-50 bg-gradient-to-r from-primary/10 via-sky-500/10 to-primary/10 border-b border-primary/20 text-xs py-2 px-4 text-center backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap text-muted-foreground">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold text-[10px] tracking-wider uppercase border border-primary/30">
          <Sparkles className="w-2.5 h-2.5" />
          <span>{announcement.badge || "NEW"}</span>
        </span>
        <span className="text-foreground font-medium text-xs">
          {announcement.text}
        </span>
        {announcement.linkText && (
          <Link
            href={announcement.linkUrl || "/services"}
            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline ml-1 cursor-pointer"
          >
            <span>{announcement.linkText}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </aside>
  );
}

