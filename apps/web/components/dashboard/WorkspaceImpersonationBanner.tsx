"use client";

import { useEffect, useState, useCallback } from "react";
import { Eye, LogOut, ArrowRight, Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

interface ImpersonatedWorkspace {
  id: string;
  name: string;
  businessName: string;
}

export function WorkspaceImpersonationBanner() {
  const router = useRouter();
  const [impersonated, setImpersonated] = useState<ImpersonatedWorkspace | null>(null);
  const [loading, setLoading] = useState(false);
  const [exiting, setExiting] = useState(false);

  const checkImpersonation = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/impersonate");
      if (res.ok) {
        const data = await res.json();
        if (data.isImpersonating && data.workspace) {
          setImpersonated(data.workspace);
        } else {
          setImpersonated(null);
        }
      }
    } catch {
      setImpersonated(null);
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
        setImpersonated(null);
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

  if (!impersonated) return null;

  return (
    <div className="sticky top-16 z-20 w-full bg-gradient-to-r from-amber-500/15 via-primary/15 to-amber-500/15 border-b border-amber-500/30 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs backdrop-blur-xl shadow-md transition-all animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
          <Eye className="w-3.5 h-3.5 animate-pulse" />
        </div>

        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
            Inspecting Workspace
          </span>
          <span className="font-bold text-foreground truncate">
            {impersonated.businessName}
          </span>
          <span className="text-muted-foreground truncate hidden md:inline">
            ({impersonated.name}) • Live customer context & channels loaded
          </span>
        </div>
      </div>

      <button
        onClick={handleExit}
        disabled={exiting}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/90 hover:bg-card border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-semibold shadow-sm transition-all active:scale-95 shrink-0 cursor-pointer disabled:opacity-50"
      >
        {exiting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <LogOut className="w-3.5 h-3.5" />
        )}
        <span>Exit Inspection</span>
      </button>
    </div>
  );
}
