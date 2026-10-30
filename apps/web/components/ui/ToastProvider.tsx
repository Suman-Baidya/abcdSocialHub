"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";
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
    success: (title: string, description?: string, duration?: number) => void;
    error: (title: string, description?: string, duration?: number) => void;
    info: (title: string, description?: string, duration?: number) => void;
    warning: (title: string, description?: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastCardProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
}

function ToastCard({ toast, onRemove }: ToastCardProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const duration = toast.duration || 4000;
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleDismiss = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => {
      onRemove(toast.id);
    }, 240);
  }, [isExiting, onRemove, toast.id]);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  const typeStyles = {
    success: {
      border: "border-emerald-500/30",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
      progress: "bg-emerald-500",
      badge: "bg-emerald-500/10 text-emerald-500",
    },
    error: {
      border: "border-red-500/40",
      icon: <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />,
      progress: "bg-red-500",
      badge: "bg-red-500/10 text-red-500",
    },
    warning: {
      border: "border-amber-500/35",
      icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
      progress: "bg-amber-500",
      badge: "bg-amber-500/10 text-amber-500",
    },
    info: {
      border: "border-primary/35",
      icon: <Info className="w-4 h-4 text-primary shrink-0" />,
      progress: "bg-primary",
      badge: "bg-primary/10 text-primary",
    },
  }[toast.type];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto w-full rounded-2xl border bg-card/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden transition-all text-card-foreground select-none ${
        typeStyles.border
      } ${isExiting ? "animate-toast-out" : "animate-toast-in"}`}
      role="status"
    >
      <div className="p-3.5 sm:p-4 flex items-start gap-3">
        <div className="shrink-0 mt-0.5">{typeStyles.icon}</div>

        <div className="flex-1 min-w-0 space-y-0.5 pr-1">
          <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug truncate">
            {toast.title}
          </h4>
          {toast.description && (
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {toast.description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Out Bar */}
      <div className="w-full bg-muted/40 h-1 overflow-hidden shrink-0">
        <div
          className={`h-full ${typeStyles.progress} will-change-transform`}
          style={{
            animation: `toast-progress ${duration}ms linear forwards`,
            animationPlayState: isPaused ? "paused" : "running",
          }}
          onAnimationEnd={handleDismiss}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, description, duration = 4000 }: Omit<ToastItem, "id">) => {
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, type, title, description, duration };

      setToasts((prev) => [...prev.slice(-3), newToast]);
    },
    []
  );

  const toast = {
    success: (title: string, description?: string, duration?: number) =>
      showToast({ type: "success", title, description, duration }),
    error: (title: string, description?: string, duration?: number) =>
      showToast({ type: "error", title, description, duration }),
    info: (title: string, description?: string, duration?: number) =>
      showToast({ type: "info", title, description, duration }),
    warning: (title: string, description?: string, duration?: number) =>
      showToast({ type: "warning", title, description, duration }),
  };

  const toastContainer = (
    <div
      aria-live="polite"
      className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-[110] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-1.5rem)] sm:w-96 pointer-events-none"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}
      {mounted && createPortal(toastContainer, document.body)}
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
