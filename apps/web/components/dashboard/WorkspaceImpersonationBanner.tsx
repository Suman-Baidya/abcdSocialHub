"use client";

import { useEffect, useState, useCallback } from "react";
import { Eye, LogOut, Loader2, User, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ImpersonationState {
  isImpersonating: boolean;
  workspace?: {
    id: string;
    name: string;
    businessName: string;
  } | null;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    allowedPages?: string[];
  } | null;
}

export function WorkspaceImpersonationBanner() {
  const router = useRouter();
  const [state, setState] = useState<ImpersonationState | null>(null);
  const [exiting, setExiting] = useState(false);

  const checkImpersonation = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/impersonate");
      if (res.ok) {
        const data = await res.json();
        if (data.isImpersonating) {
          setState(data);
        } else {
          setState(null);
        }
      }
    } catch {
      setState(null);
    }
  }, []);

  useEffect(() => {
    checkImpersonation();
  }, [checkImpersonation]);

  const handleExit = async () => {
    try {
      setExiting(true);
      const res = await fetch("/api/admin/impersonate", { method: "DELETE" });
      if (res.ok) {
        setState(null);
        router.push("/admin/tenants");
        router.refresh();
        window.location.href = "/admin/tenants";
      }
    } catch (err) {
      console.error("Failed to exit inspection:", err);
    } finally {
      setExiting(false);
    }
  };

  if (!state || !state.isImpersonating) return null;

  const isUserSimulation = !!state.user;
  const wsName = state.workspace?.businessName || state.workspace?.name || "Customer Workspace";

  return (
    <div className="sticky top-16 z-20 w-full bg-gradient-to-r from-amber-500/15 via-primary/15 to-amber-500/15 border-b border-amber-500/30 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs backdrop-blur-xl shadow-md transition-all animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
          <Eye className="w-3.5 h-3.5 animate-pulse" />
        </div>

        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
            {isUserSimulation ? "Simulating User" : "Inspecting Workspace"}
          </span>

          {isUserSimulation ? (
            <div className="flex items-center gap-1.5 flex-wrap font-semibold text-foreground truncate">
              <span className="text-foreground font-bold">{state.user?.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary/20 text-primary border border-primary/30 uppercase">
                {state.user?.role}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground font-normal">{wsName}</span>
            </div>
          ) : (
            <span className="font-bold text-foreground truncate">{wsName}</span>
          )}

          <span className="text-muted-foreground truncate hidden lg:inline">
            • Live customer environment active for real-time diagnostics & troubleshooting
          </span>
        </div>
      </div>

      <button
        onClick={handleExit}
        disabled={exiting}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/90 hover:bg-card border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-semibold shadow-sm transition-all active:scale-95 shrink-0 cursor-pointer disabled:opacity-50"
        title="Exit inspection and restore your Developer / Super Admin superpowers"
      >
        {exiting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <LogOut className="w-3.5 h-3.5" />
        )}
        <span>Reset to Developer Dashboard</span>
      </button>
    </div>
  );
}
