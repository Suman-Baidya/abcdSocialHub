"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Users,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Layers,
  Sparkles,
} from "lucide-react";

interface Member {
  id: string;
  role: string;
  email: string;
  name: string;
  allowedPages: string[];
}

interface Tenant {
  id: string;
  name: string;
  businessName: string;
  phoneNumber?: string;
  isApproved: boolean;
  createdAt: string;
  plan: string;
  subscriptionStatus: string;
  ownerEmail: string;
  ownerName: string;
  totalMembers: number;
  totalPosts: number;
  totalChannels: number;
  members: Member[];
}

interface TenantStats {
  totalWorkspaces: number;
  approvedCount: number;
  pendingCount: number;
}

export default function TenantManagementPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<TenantStats>({
    totalWorkspaces: 0,
    approvedCount: 0,
    pendingCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "APPROVED" | "PENDING">("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedTenantId, setExpandedTenantId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/tenants");
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch workspaces`);
      }
      const data = await res.json();
      setTenants(data.tenants || []);
      setStats(
        data.stats || {
          totalWorkspaces: data.tenants?.length || 0,
          approvedCount: data.tenants?.filter((t: Tenant) => t.isApproved).length || 0,
          pendingCount: data.tenants?.filter((t: Tenant) => !t.isApproved).length || 0,
        }
      );
    } catch (err: any) {
      setError(err.message || "Could not retrieve tenant directories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleToggleApproval = async (tenantId: string, currentStatus: boolean) => {
    try {
      setUpdatingId(tenantId);
      setFeedbackMessage(null);
      const nextStatus = !currentStatus;

      const res = await fetch("/api/admin/tenants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: tenantId,
          isApproved: nextStatus,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Update failed");
      }

      // Optimistic state update
      setTenants((prev) =>
        prev.map((t) => (t.id === tenantId ? { ...t, isApproved: nextStatus } : t))
      );
      setStats((prev) => ({
        ...prev,
        approvedCount: prev.approvedCount + (nextStatus ? 1 : -1),
        pendingCount: prev.pendingCount + (nextStatus ? -1 : 1),
      }));

      setFeedbackMessage({
        text: `Workspace ${nextStatus ? "approved successfully" : "suspended"}.`,
        type: "success",
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      setFeedbackMessage({
        text: err.message || "Failed to update tenant status",
        type: "error",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "APPROVED") return t.isApproved;
    if (statusFilter === "PENDING") return !t.isApproved;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header with strictly 2-3 word title and 7-8 word description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-amber-400" />
            <span>Tenant Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage registered business workspaces and approval status.
          </p>
        </div>

        <button
          onClick={fetchTenants}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border hover:bg-muted text-xs font-semibold text-foreground transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between animate-in fade-in ${
            feedbackMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs underline hover:no-underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. 4-Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-3.5">
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              Total
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Total Workspaces
            </span>
            <h4 className="mt-0.5 text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {stats.totalWorkspaces}
            </h4>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Approved Tenants
            </span>
            <h4 className="mt-0.5 text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight">
              {stats.approvedCount}
            </h4>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Needs Review
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Pending Approval
            </span>
            <h4 className="mt-0.5 text-xl sm:text-2xl font-bold text-amber-400 tracking-tight">
              {stats.pendingCount}
            </h4>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Content
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Total Posts Generated
            </span>
            <h4 className="mt-0.5 text-xl sm:text-2xl font-bold text-sky-400 tracking-tight">
              {tenants.reduce((sum, t) => sum + t.totalPosts, 0)}
            </h4>
          </div>
        </div>
      </div>

      {/* 3. Search and Status Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by business, workspace, or owner email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(["ALL", "APPROVED", "PENDING"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === tab
                  ? "bg-amber-500 text-zinc-950 shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "ALL" ? "All Tenants" : tab === "APPROVED" ? "Approved" : "Pending"}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tenants List Table */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-card border border-border" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-card border border-amber-500/30 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">Failed to Load Tenants</h3>
          <p className="text-xs text-muted-foreground">{error}</p>
          <button
            onClick={fetchTenants}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : filteredTenants.length === 0 ? (
        <div className="p-12 rounded-2xl bg-card border border-border text-center space-y-3">
          <Building2 className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Tenants Found</h3>
          <p className="text-xs text-muted-foreground">
            No workspaces matched your search and filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTenants.map((t) => {
            const isExpanded = expandedTenantId === t.id;
            const isUpdating = updatingId === t.id;

            return (
              <div
                key={t.id}
                className="rounded-2xl border border-border bg-card p-4 sm:p-5 backdrop-blur-xl shadow-sm transition-all hover:border-amber-500/30 space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Business & Owner Info */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-bold text-foreground truncate">
                        {t.businessName || t.name}
                      </span>
                      {t.isApproved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approved</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3" />
                          <span>Pending Approval</span>
                        </span>
                      )}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">
                        {t.plan} Plan
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{t.ownerEmail}</span>
                      </span>
                      {t.phoneNumber && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{t.phoneNumber}</span>
                        </span>
                      )}
                      <span className="text-[11px]">
                        Joined {new Date(t.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Metrics */}
                  <div className="flex items-center gap-3 self-end lg:self-center shrink-0">
                    <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground border-r border-border pr-4">
                      <span className="flex items-center gap-1" title="Team Members">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <strong className="text-foreground">{t.totalMembers}</strong>
                      </span>
                      <span className="flex items-center gap-1" title="Total Posts">
                        <Layers className="w-3.5 h-3.5 text-sky-400" />
                        <strong className="text-foreground">{t.totalPosts}</strong>
                      </span>
                    </div>

                    {/* Approve / Suspend Toggle Button */}
                    <button
                      onClick={() => handleToggleApproval(t.id, t.isApproved)}
                      disabled={isUpdating}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${
                        t.isApproved
                          ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25"
                          : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25"
                      }`}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : t.isApproved ? (
                        <ShieldAlert className="w-3.5 h-3.5" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      )}
                      <span>{t.isApproved ? "Suspend" : "Approve"}</span>
                    </button>

                    {/* Expand Members Button */}
                    <button
                      onClick={() => setExpandedTenantId(isExpanded ? null : t.id)}
                      className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title={isExpanded ? "Collapse Team" : "View Team Seats"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Member Details */}
                {isExpanded && (
                  <div className="pt-3 border-t border-border space-y-2 animate-in fade-in">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Enrolled Workspace Members ({t.members.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {t.members.map((m) => (
                        <div
                          key={m.id}
                          className="p-2.5 rounded-xl bg-muted/40 border border-border text-xs flex flex-col justify-between space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground truncate">
                              {m.name || "Member"}
                            </span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                              {m.role}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground truncate">
                            {m.email}
                          </span>
                          {m.allowedPages && m.allowedPages.length > 0 && (
                            <div className="text-[10px] text-muted-foreground">
                              Pages: {m.allowedPages.join(", ")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
