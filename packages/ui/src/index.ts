import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STATUS_VARIANTS = {
  PUBLISHED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  SCHEDULED: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  IN_REVIEW: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  FAILED: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  PAUSED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
} as const;
