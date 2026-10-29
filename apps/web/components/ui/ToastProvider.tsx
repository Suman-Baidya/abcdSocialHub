"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Sparkles,
} from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, "id">) => void;
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, description, duration = 4000 }: Omit<ToastItem, "id">) => {
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, type, title, description, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]); // Keep maximum 5 on screen

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const toast = {
    success: (title: string, description?: string) =>
      showToast({ type: "success", title, description }),
    error: (title: string, description?: string) =>
      showToast({ type: "error", title, description }),
    info: (title: string, description?: string) =>
      showToast({ type: "info", title, description }),
    warning: (title: string, description?: string) =>
      showToast({ type: "warning", title, description }),
  };

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}

      {/* Floating Toast Container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl p-3.5 border shadow-2xl backdrop-blur-xl flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${
              t.type === "success"
                ? "bg-[#111A24]/95 border-emerald-500/30 text-emerald-400"
                : t.type === "error"
                ? "bg-[#1E1114]/95 border-rose-500/30 text-rose-400"
                : t.type === "warning"
                ? "bg-[#1E1810]/95 border-amber-500/30 text-amber-400"
                : "bg-[#101722]/95 border-[#00F0FF]/30 text-[#00F0FF]"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {t.type === "error" && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {t.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {t.type === "info" && <Info className="w-4 h-4 text-[#00F0FF]" />}
            </div>

            <div className="flex-1 space-y-0.5 pr-2">
              <h4 className="text-xs font-semibold text-zinc-100">{t.title}</h4>
              {t.description && (
                <p className="text-[11px] text-zinc-400 leading-relaxed">{t.description}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

/**
 * Custom Alert Banner component for inline warnings/info
 */
export function CustomAlert({
  type = "info",
  title,
  children,
  action,
}: {
  type?: ToastType;
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

/**
 * Custom Confirmation Popup Dialog
 */
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
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmText?: string;
  onConfirm?: () => void;
  isDestructive?: boolean;
  isLoading?: boolean;
}) {
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
