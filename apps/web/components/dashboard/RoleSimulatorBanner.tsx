"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Sparkles, Shield, RefreshCw, X, ChevronDown, ChevronUp } from "lucide-react";
import { RoleType, SIMULATION_ROLES, ROLE_LABELS } from "@/lib/roles";

interface RoleSimulatorBannerProps {
  currentSimulatedRole?: RoleType | null;
  onSimulateRole: (role: RoleType | null) => void;
}

export function RoleSimulatorBanner({
  currentSimulatedRole,
  onSimulateRole,
}: RoleSimulatorBannerProps) {
  const { data: session } = useSession();
  const user = session?.user as any;

  const isDeveloper =
    user?.isDeveloper ||
    user?.role === "DEVELOPER" ||
    user?.email === "suman.baidya.pro@gmail.com";

  const isSuperAdmin =
    isDeveloper ||
    user?.isSuperAdmin ||
    user?.role === "SUPER_ADMIN" ||
    user?.email === "suman.baidya.pro@gmail.com";

  const [isOpen, setIsOpen] = useState(false);

  // Hidden completely if user is not a platform controller
  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 sm:px-6 py-1.5 sm:py-2 text-xs backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-amber-400 tracking-tight">Role Persona Simulator:</span>
            {currentSimulatedRole ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-[10px] border border-amber-500/30">
                <span>Simulating: {ROLE_LABELS[currentSimulatedRole]}</span>
                <button
                  type="button"
                  onClick={() => onSimulateRole(null)}
                  className="hover:opacity-75 cursor-pointer ml-1"
                  title="Reset to Real Account"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : (
              <span className="text-muted-foreground text-[11px]">
                Viewing as your real account ({user?.role || "SUPER_ADMIN"})
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-card hover:bg-muted border border-border text-[11px] font-semibold text-foreground transition-all cursor-pointer"
          >
            <span>{isOpen ? "Hide Roles" : "Switch Role"}</span>
            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {currentSimulatedRole && (
            <button
              type="button"
              onClick={() => onSimulateRole(null)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-semibold transition-all cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Role Switcher Buttons */}
      {isOpen && (
        <div className="max-w-7xl mx-auto pt-2.5 mt-2 border-t border-amber-500/20 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 animate-in fade-in">
          {SIMULATION_ROLES.map((r) => {
            const isActive = currentSimulatedRole === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => {
                  onSimulateRole(r);
                  setIsOpen(false);
                }}
                className={`px-2 py-1.5 rounded-lg text-left text-[11px] font-semibold transition-all cursor-pointer truncate ${
                  isActive
                    ? "bg-amber-500 text-zinc-950 font-bold shadow-xs"
                    : "bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground"
                }`}
                title={ROLE_LABELS[r]}
              >
                {r.replace("_", " ")}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
