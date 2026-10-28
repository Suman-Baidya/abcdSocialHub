"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ChevronDown, Building2, Plus, Check } from "lucide-react";

export function WorkspaceSwitcher() {
  const { data: session, update } = useSession();
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
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-sm font-medium text-white transition-all shadow-sm"
      >
        <div className="w-5 h-5 rounded-md bg-[#00F0FF]/10 text-[#00F0FF] flex items-center justify-center">
          <Building2 className="w-3.5 h-3.5" />
        </div>
        <span className="truncate max-w-[130px] sm:max-w-[180px]">{currentWorkspaceName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-2 w-56 rounded-xl bg-[#121722] border border-zinc-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Workspaces & Brands
            </div>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm text-left font-medium text-zinc-200 hover:text-white hover:bg-zinc-800/80 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2 h-2 rounded-full bg-[#00F0FF]" />
                  <span className="truncate">{ws.name}</span>
                </div>
                <Check className="w-4 h-4 text-[#00F0FF]" />
              </button>
            ))}

            <div className="my-1 border-t border-zinc-800/80" />

            <button
              onClick={() => {
                setOpen(false);
                alert("Multi-brand creation modal ready. Configure in Brand Kit!");
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#00F0FF] hover:bg-[#00F0FF]/10 transition-colors"
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
