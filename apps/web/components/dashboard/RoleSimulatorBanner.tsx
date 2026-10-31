"use client";

import { useState, useEffect, useMemo } from "react";
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
  isActive?: boolean;
  status?: "ACTIVE" | "INACTIVE";
  createdAt?: string;
}

interface RoleSimulatorBannerProps {
  currentSimulatedRole?: RoleType | null;
  onSimulateRole: (role: RoleType | null) => void;
}

function getRoleBadgeClass(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "SUPER_ADMIN_STAFF":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25";
    case "CREATOR":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25";
    case "GUEST":
      return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/25";
    case "TENANT_ADMIN":
    case "OWNER":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25";
    case "ADMIN_STAFF":
    case "STAFF":
    default:
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25";
  }
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
  // Default to null so no users are shown until a role is clicked
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<RoleType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);
  const [impersonatingUserId, setImpersonatingUserId] = useState<string | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<{
    id: string;
    name: string;
    role: string;
    businessName: string;
  } | null>(null);

  // Pagination state (5 items per page)
  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);

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
    if (!selectedRoleFilter) return [];
    return users.filter((u) => {
      const matchesRole = u.role === selectedRoleFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.businessName.toLowerCase().includes(query);
      return matchesRole && matchesSearch;
    });
  }, [users, selectedRoleFilter, searchQuery]);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRoleFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

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

  // Toggle User / Workspace Active-Inactive status
  const handleToggleStatus = async (targetUser: PlatformUser, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!targetUser.workspaceId) return;
    try {
      setTogglingStatusId(targetUser.id);
      const nextActive = !(targetUser.isActive !== false);
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: targetUser.workspaceId,
          isActive: nextActive,
        }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === targetUser.id
              ? { ...u, isActive: nextActive, status: nextActive ? "ACTIVE" : "INACTIVE" }
              : u
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    } finally {
      setTogglingStatusId(null);
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
      {/* Top Banner Bar: Strictly one single line with hidden scrollbars */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-nowrap">
        {/* Left Section: Active Simulation Status */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="font-extrabold text-amber-950 dark:text-amber-300 tracking-tight text-xs sm:text-[13px] whitespace-nowrap">
              Role Persona Simulator:
            </span>

            {/* If impersonating a real customer user */}
            {impersonatedUser ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-950 dark:text-amber-200 font-bold text-[11px] border border-amber-300 dark:border-amber-500/40 shadow-xs whitespace-nowrap">
                <User className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                <span>Simulating User: {impersonatedUser.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200/80 dark:bg-amber-500/30 uppercase font-mono">
                  {impersonatedUser.role}
                </span>
                <span className="text-muted-foreground font-normal hidden md:inline">• {impersonatedUser.businessName}</span>
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
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-950 dark:text-amber-200 font-bold text-[11px] border border-amber-300 dark:border-amber-500/40 shadow-xs whitespace-nowrap">
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
              /* Description text hidden on mobile screen to guarantee one-line presentation */
              <span className="hidden sm:inline text-amber-900/70 dark:text-amber-200/60 text-[11px] font-medium whitespace-nowrap">
                Viewing as your real account ({user?.role || "DEVELOPER"})
              </span>
            )}
          </div>
        </div>

        {/* Right Section: Toggle Drawer & "Come Back" Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-muted border border-border text-xs font-semibold text-foreground transition-all shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <User className="w-3.5 h-3.5 text-primary" />
            <span>{isOpen ? "Close Selector" : "Select User / Role"}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isSimulatingActive && (
            <button
              type="button"
              onClick={handleComeBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
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
          {/* Top Bar: Search Input & Role Filters (Scrollbars hidden) */}
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

            {/* Role Filter Tabs (No scrollbar displayed) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5 flex-nowrap">
              {SIMULATION_ROLES.map((r) => {
                const count = users.filter((u) => u.role === r).length;
                const isSelected = selectedRoleFilter === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRoleFilter(isSelected ? null : r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-amber-500 text-zinc-950 font-bold shadow-xs"
                        : "bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{r.replace(/_/g, " ")}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected ? "bg-zinc-950/20 text-zinc-950" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Generic Role Test Buttons: Horizontally scrollable in one line, no scrollbar visible */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-nowrap whitespace-nowrap py-1">
            <span className="font-semibold text-foreground text-[11px] shrink-0">Or test generic UI:</span>
            <div className="flex items-center gap-1.5 shrink-0">
              {SIMULATION_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    onSimulateRole(r);
                    setIsOpen(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition-all shrink-0 cursor-pointer ${
                    currentSimulatedRole === r
                      ? "bg-amber-500 text-zinc-950 border-amber-500 font-bold shadow-xs"
                      : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                  }`}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          {/* User Results: Table View without header, balanced column widths, hidden scrollbars, clean pagination */}
          {loadingUsers ? (
            <div className="p-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2 bg-card/40 rounded-xl border border-border">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Loading platform users directory...</span>
            </div>
          ) : !selectedRoleFilter ? null : filteredUsers.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground bg-card/60 rounded-xl border border-dashed border-border">
              No users found matching &quot;{searchQuery}&quot; in role {selectedRoleFilter.replace(/_/g, " ")}.
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <tbody className="divide-y divide-border/60">
                    {paginatedUsers.map((u) => {
                      const isCurrent = impersonatedUser?.id === u.id;
                      const isToggling = togglingStatusId === u.id;
                      const isActive = u.isActive !== false;
                      return (
                        <tr
                          key={`${u.id}-${u.role}`}
                          className={`transition-colors hover:bg-muted/40 ${
                            isCurrent ? "bg-amber-500/10" : ""
                          }`}
                        >
                          {/* Column 1: User Profile (Avatar + Name + Email) */}
                          <td className="py-2.5 px-3 w-[32%] sm:w-[30%]">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                                {u.name ? u.name[0].toUpperCase() : "U"}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-foreground truncate">{u.name}</div>
                                <div className="text-[10px] text-muted-foreground font-mono truncate">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Column 2: Brand / Organization */}
                          <td className="py-2.5 px-3 w-[28%] sm:w-[26%]">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 text-foreground/90 font-medium">
                                <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                <span className="truncate">{u.businessName}</span>
                              </div>
                              <div className="text-[10px] text-muted-foreground truncate">{u.workspaceName}</div>
                            </div>
                          </td>

                          {/* Column 3: Role Badge */}
                          <td className="py-2.5 px-3 w-[15%] sm:w-[14%]">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getRoleBadgeClass(
                                u.role
                              )}`}
                            >
                              {u.role.replace(/_/g, " ")}
                            </span>
                          </td>

                          {/* Column 4: Active / Inactive Status Toggle */}
                          <td className="py-2.5 px-3 w-[12%] sm:w-[14%]">
                            <button
                              type="button"
                              onClick={(e) => handleToggleStatus(u, e)}
                              disabled={isToggling}
                              title={`Click to ${isActive ? "deactivate" : "activate"} user workspace`}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer border shadow-2xs ${
                                isActive
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25 hover:bg-rose-500/20"
                              }`}
                            >
                              {isToggling ? (
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              ) : (
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isActive ? "bg-emerald-500" : "bg-rose-500"
                                  }`}
                                />
                              )}
                              <span>{isActive ? "Active" : "Inactive"}</span>
                            </button>
                          </td>

                          {/* Column 5: Inspect Action Button */}
                          <td className="py-2.5 px-3 w-[13%] sm:w-[16%] text-right">
                            <button
                              type="button"
                              onClick={() => handleSelectUser(u)}
                              disabled={impersonatingUserId === u.id || isCurrent}
                              className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 disabled:opacity-60 whitespace-nowrap ${
                                isCurrent
                                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                  : "bg-primary text-primary-foreground hover:opacity-90 shadow-xs"
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
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Clean Pagination Bar */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/20 text-xs text-muted-foreground">
                  <span className="text-[11px]">
                    Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length} members
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
                    >
                      Previous
                    </button>
                    <span className="px-2 text-xs font-semibold text-foreground">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
