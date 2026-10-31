"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ChevronDown, Building2, Plus, Check, Eye, LogOut } from "lucide-react";
import Link from "next/link";

export function WorkspaceSwitcher() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [impersonated, setImpersonated] = useState<{ id: string; name: string; businessName: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/impersonate")
      .then((r) => r.json())
      .then((data) => {
        if (data.isImpersonating && data.workspace) {
          setImpersonated(data.workspace);
        } else {
          setImpersonated(null);
        }
      })
      .catch(() => {});
  }, []);

  const currentWorkspaceName = impersonated
    ? impersonated.businessName || impersonated.name
    : (session?.user as any)?.workspaceName || "Primary Brand";
  const currentWorkspaceId = impersonated ? impersonated.id : (session?.user as any)?.workspaceId;

  const handleExitImpersonation = async () => {
    setOpen(false);
    await fetch("/api/admin/impersonate", { method: "DELETE" });
    window.location.href = "/admin/tenants";
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium transition-all shadow-sm ${
          impersonated
            ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
            : "bg-card hover:bg-muted border-border text-foreground"
        }`}
      >
        <div
          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
            impersonated ? "bg-amber-500/20 text-amber-400" : "bg-primary/10 text-primary"
          }`}
        >
          {impersonated ? <Eye className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
        </div>
        <span className="truncate max-w-[100px] sm:max-w-[150px] font-semibold">{currentWorkspaceName}</span>
        {impersonated && (
          <span className="hidden lg:inline text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 uppercase">
            Inspecting
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 sm:left-0 mt-2 w-64 rounded-xl bg-card border border-border shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {impersonated ? "Inspecting Customer Brand" : "Active Brand Workspace"}
            </div>

            <div className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-foreground bg-muted/60">
              <div className="flex items-center gap-2 truncate">
                <div className={`w-2 h-2 rounded-full ${impersonated ? "bg-amber-400" : "bg-primary"}`} />
                <span className="truncate font-semibold">{currentWorkspaceName}</span>
              </div>
              <Check className="w-4 h-4 text-primary shrink-0" />
            </div>

            {impersonated ? (
              <>
                <div className="my-1 border-t border-border" />
                <button
                  onClick={handleExitImpersonation}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-amber-300 hover:bg-amber-500/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit Inspection & Return</span>
                </button>
              </>
            ) : (
              <>
                <div className="my-1 border-t border-border" />
                <Link
                  href="/admin/tenants"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Manage All Tenant Workspaces</span>
                </Link>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
