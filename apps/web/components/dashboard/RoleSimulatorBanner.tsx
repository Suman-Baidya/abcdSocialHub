"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  Search,
  ArrowLeft,
  X,
  ChevronDown,
  ChevronUp,
  User,
  Building2,
  Check,
  Eye,
  Loader2,
  Filter,
} from "lucide-react";
import { RoleType, SIMULATION_ROLES, ROLE_LABELS } from "@/lib/roles";

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: string;
  workspaceId: string;
  workspaceName: string;
  businessName: string;
  allowedPages?: string[];
}

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
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [impersonatingUserId, setImpersonatingUserId] = useState<string | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<{
    id: string;
    name: string;
    role: string;
    businessName: string;
  } | null>(null);

  // Check active impersonation state on load
  useEffect(() => {
    fetch("/api/admin/impersonate")
      .then((res) => res.json())
      .then((data) => {
        if (data.isImpersonating && data.user) {
          setImpersonatedUser({
            id: data.user.id,
            name: data.user.name,
            role: data.user.role,
            businessName: data.workspace?.businessName || data.workspace?.name || "Customer Workspace",
          });
        } else {
          setImpersonatedUser(null);
        }
      })
      .catch(() => setImpersonatedUser(null));
  }, []);

  // Fetch all platform users when drawer is expanded
  useEffect(() => {
    if (isOpen && users.length === 0) {
      setLoadingUsers(true);
      fetch("/api/admin/users")
        .then((res) => res.json())
        .then((data) => {
          if (data.users) {
            setUsers(data.users);
          }
        })
        .catch((err) => console.error("Failed to load users:", err))
        .finally(() => setLoadingUsers(false));
    }
  }, [isOpen, users.length]);

  // Filter users based on selected role tab and search query
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole =
        selectedRoleFilter === "ALL" || u.role === selectedRoleFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.businessName.toLowerCase().includes(query);
      return matchesRole && matchesSearch;
    });
  }, [users, selectedRoleFilter, searchQuery]);

  // "Come Back" Action: Restores real developer / admin session
  const handleComeBack = async () => {
    try {
      await fetch("/api/admin/impersonate", { method: "DELETE" });
      onSimulateRole(null);
      setImpersonatedUser(null);
      window.location.reload();
    } catch (err) {
      console.error("Failed to exit simulation:", err);
      window.location.reload();
    }
  };

  // 1-Click User Selection: Impersonate exact user in stealth shadow mode
  const handleSelectUser = async (targetUser: PlatformUser) => {
    try {
      setImpersonatingUserId(targetUser.id);
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetUser.id,
          workspaceId: targetUser.workspaceId,
        }),
      });

      if (res.ok) {
        setIsOpen(false);
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Failed to impersonate user:", err);
    } finally {
      setImpersonatingUserId(null);
    }
  };

  // Hidden completely if user is not a platform controller
  if (!isSuperAdmin) {
    return null;
  }

  const isSimulatingActive = !!currentSimulatedRole || !!impersonatedUser;

  return (
    <div className="bg-amber-500/10 dark:bg-amber-500/10 border-b border-amber-300/40 dark:border-amber-500/25 px-3 sm:px-6 py-2 text-xs backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left Section: Active Simulation Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-amber-950 dark:text-amber-300 tracking-tight text-xs sm:text-[13px]">
              Role Persona Simulator:
            </span>

            {/* If impersonating a real customer user */}
            {impersonatedUser ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-950 dark:text-amber-200 font-bold text-[11px] border border-amber-300 dark:border-amber-500/40 shadow-xs">
                <User className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                <span>Simulating User: {impersonatedUser.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200/80 dark:bg-amber-500/30 uppercase font-mono">
                  {impersonatedUser.role}
                </span>
                <span className="text-muted-foreground font-normal">• {impersonatedUser.businessName}</span>
                <button
                  type="button"
                  onClick={handleComeBack}
                  className="hover:opacity-75 cursor-pointer ml-1 p-0.5 rounded-full hover:bg-amber-200 dark:hover:bg-amber-500/30"
                  title="Come Back to Developer Account"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : currentSimulatedRole ? (
              /* If simulating a generic role */
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-950 dark:text-amber-200 font-bold text-[11px] border border-amber-300 dark:border-amber-500/40 shadow-xs">
                <span>Simulating: {ROLE_LABELS[currentSimulatedRole]}</span>
                <button
                  type="button"
                  onClick={() => onSimulateRole(null)}
                  className="hover:opacity-75 cursor-pointer ml-1 p-0.5 rounded-full hover:bg-amber-200 dark:hover:bg-amber-500/30"
                  title="Come Back to Developer Account"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : (
              <span className="text-amber-900/70 dark:text-amber-200/60 text-[11px] font-medium">
                Viewing as your real account ({user?.role || "DEVELOPER"})
              </span>
            )}
          </div>
        </div>

        {/* Right Section: Dropdown Toggle & "Come Back" Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-muted border border-border text-xs font-semibold text-foreground transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <User className="w-3.5 h-3.5 text-primary" />
            <span>{isOpen ? "Close User Selector" : "Select User / Role"}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isSimulatingActive && (
            <button
              type="button"
              onClick={handleComeBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              title="Exit simulation and Come Back to Developer Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Come Back</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          Expandable Searchable User & Role Selector Drawer
         ───────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="max-w-7xl mx-auto pt-3 mt-2.5 border-t border-amber-300/40 dark:border-amber-500/25 space-y-3 animate-in fade-in slide-in-from-top-1">
          {/* Top Bar: Search Input & Role Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user by name, email, or business brand..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-card border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              <button
                type="button"
                onClick={() => setSelectedRoleFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedRoleFilter === "ALL"
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                All Roles ({users.length})
              </button>

              {SIMULATION_ROLES.map((r) => {
                const count = users.filter((u) => u.role === r).length;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRoleFilter(r)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                      selectedRoleFilter === r
                        ? "bg-amber-500 text-zinc-950 font-bold shadow-xs"
                        : "bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{r.replace("_", " ")}</span>
                    <span className="ml-1 opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Generic Role Test Buttons */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">Or test generic UI:</span>
            {SIMULATION_ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  onSimulateRole(r);
                  setIsOpen(false);
                }}
                className={`px-2 py-0.5 rounded-md border text-[10px] font-medium transition-all cursor-pointer ${
                  currentSimulatedRole === r
                    ? "bg-amber-500 text-zinc-950 border-amber-500 font-bold"
                    : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>

          {/* User Results Grid */}
          <div className="pt-1">
            <div className="flex items-center justify-between pb-1.5 text-[11px] text-muted-foreground">
              <span>Matching Users ({filteredUsers.length}):</span>
              <span className="font-mono text-[10px]">
                🔒 Stealth Shadow Mode: Changes are attributed naturally without exposing developer presence
              </span>
            </div>

            {loadingUsers ? (
              <div className="p-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Loading platform users directory...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground bg-card/60 rounded-xl border border-dashed border-border">
                No users found matching &quot;{searchQuery}&quot; in role {selectedRoleFilter}.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-1">
                {filteredUsers.map((u) => {
                  const isCurrent = impersonatedUser?.id === u.id;
                  return (
                    <div
                      key={`${u.id}-${u.role}`}
                      className={`p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between space-y-1.5 ${
                        isCurrent
                          ? "bg-amber-500/15 border-amber-500/40 shadow-xs"
                          : "bg-card hover:bg-muted/70 border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-foreground truncate">{u.name}</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                          {u.role}
                        </span>
                      </div>

                      <div className="space-y-0.5 text-[11px] text-muted-foreground">
                        <p className="truncate font-mono">{u.email}</p>
                        <p className="truncate font-medium text-foreground/80 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>{u.businessName}</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectUser(u)}
                        disabled={impersonatingUserId === u.id || isCurrent}
                        className={`w-full mt-1 inline-flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer active:scale-95 disabled:opacity-50 ${
                          isCurrent
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25"
                        }`}
                      >
                        {impersonatingUserId === u.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isCurrent ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                        <span>{isCurrent ? "Active In View" : "Inspect as User"}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
