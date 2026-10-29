"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmText?: string;
  onConfirm?: () => void;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function CustomModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmText = "Confirm",
  onConfirm,
  isDestructive = false,
  isLoading = false,
}: CustomModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[#111722] border border-white/[0.1] shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {description && (
          <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
        )}

        {children}

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200"
          >
            Cancel
          </button>

          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 ${
                isDestructive
                  ? "bg-rose-500 hover:bg-rose-600 text-white"
                  : "bg-[#00F0FF] hover:bg-[#00D4E0] text-[#0A0D14]"
              }`}
            >
              {isLoading ? "Processing..." : confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
