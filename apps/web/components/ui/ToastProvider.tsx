"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

export { CustomModal } from "./CustomModal";
export { CustomAlert } from "./CustomAlert";

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

      setToasts((prev) => [...prev.slice(-4), newToast]);

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
