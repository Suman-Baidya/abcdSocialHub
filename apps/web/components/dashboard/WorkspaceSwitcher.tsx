"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ChevronDown, Building2, Plus, Check } from "lucide-react";

export function WorkspaceSwitcher() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const currentWorkspaceName = (session?.user as any)?.workspaceName || "Primary Brand";
  const currentWorkspaceId = (session?.user as any)?.workspaceId;

  // Placeholder workspaces list (can be loaded dynamically)
  const workspaces = [
    { id: currentWorkspaceId, name: currentWorkspaceName },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-card hover:bg-muted border border-border text-xs sm:text-sm font-medium text-foreground transition-all shadow-sm"
      >
        <div className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Building2 className="w-3.5 h-3.5" />
        </div>
        <span className="truncate max-w-[110px] sm:max-w-[160px]">{currentWorkspaceName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 sm:left-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Workspaces & Brands
            </div>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs sm:text-sm text-left font-medium text-foreground hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="truncate">{ws.name}</span>
                </div>
                <Check className="w-4 h-4 text-primary" />
              </button>
            ))}

            <div className="my-1 border-t border-border" />

            <button
              onClick={() => {
                setOpen(false);
                alert("Multi-brand creation modal ready. Configure in Brand Kit!");
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Brand Client</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
