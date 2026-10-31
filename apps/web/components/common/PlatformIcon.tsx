"use client";

import React, { memo } from "react";
import {
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  MessageSquare,
  Share2,
} from "lucide-react";

export type PlatformType =
  | "INSTAGRAM"
  | "INSTAGRAM_BUSINESS"
  | "FACEBOOK"
  | "FACEBOOK_PAGE"
  | "LINKEDIN"
  | "TWITTER"
  | "X"
  | "X_TWITTER"
  | "YOUTUBE"
  | "WHATSAPP";

interface PlatformIconProps {
  platform: PlatformType | string;
  className?: string;
}

const PLATFORM_MAP: Record<string, { icon: any; color: string; label: string }> = {
  INSTAGRAM: { icon: Instagram, color: "text-pink-500", label: "Instagram" },
  INSTAGRAM_BUSINESS: { icon: Instagram, color: "text-pink-500", label: "Instagram" },
  FACEBOOK: { icon: Facebook, color: "text-blue-500", label: "Facebook" },
  FACEBOOK_PAGE: { icon: Facebook, color: "text-blue-500", label: "Facebook" },
  LINKEDIN: { icon: Linkedin, color: "text-sky-400", label: "LinkedIn" },
  TWITTER: { icon: Twitter, color: "text-foreground", label: "X (Twitter)" },
  X: { icon: Twitter, color: "text-foreground", label: "X" },
  X_TWITTER: { icon: Twitter, color: "text-foreground", label: "X (Twitter)" },
  YOUTUBE: { icon: Youtube, color: "text-red-500", label: "YouTube" },
  WHATSAPP: { icon: MessageSquare, color: "text-emerald-500", label: "WhatsApp" },
};

export const PlatformIcon = memo(function PlatformIcon({
  platform,
  className = "w-4 h-4",
}: PlatformIconProps) {
  const normalized = platform.toUpperCase().replace(/[-\s]/g, "_");
  const config = PLATFORM_MAP[normalized] || {
    icon: Share2,
    color: "text-muted-foreground",
    label: platform,
  };

  const Icon = config.icon;

  return <Icon className={`${className} ${config.color}`} aria-label={config.label} />;
});

