"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Building2,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Users,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Layers,
  Plus,
  Eye,
  Trash2,
  X,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { CustomModal } from "@/components/ui/CustomModal";
import { StatCard, EmptyState, LoadingSkeleton, StatusBadge } from "@/components/common";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";

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

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "APPROVED" | "PENDING">("ALL");
  const [planFilter, setPlanFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name_asc" | "name_desc" | "posts" | "members">("newest");

  // Pagination (Default exactly 10 rows per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Action states
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [inspectingId, setInspectingId] = useState<string | null>(null);
  const [expandedTenantId, setExpandedTenantId] = useState<string | null>(null);

  // Tenant Creation Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    businessName: "",
    ownerName: "",
    ownerEmail: "",
    phoneNumber: "",
    plan: "starter",
    isApproved: true,
  });

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, planFilter, sortBy, pageSize]);

  // 1-Click Workspace Impersonation ("Inspect Customer Workspace")
  const handleInspectWorkspace = async (tenantId: string) => {
    try {
      setInspectingId(tenantId);
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: tenantId }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to start workspace inspection");
      }

      window.location.href = "/dashboard";
    } catch (err: any) {
      setFeedbackMessage({
        text: err.message || "Failed to inspect workspace",
        type: "error",
      });
      setInspectingId(null);
    }
  };

  // 1-Click User Impersonation ("Open as this User")
  const handleInspectUser = async (tenantId: string, memberId: string) => {
    try {
      setInspectingId(memberId);
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: tenantId, userId: memberId }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to start user inspection");
      }

      window.location.href = "/dashboard";
    } catch (err: any) {
      setFeedbackMessage({
        text: err.message || "Failed to inspect user account",
        type: "error",
      });
      setInspectingId(null);
    }
  };

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

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      setFeedbackMessage(null);

      const res = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create tenant workspace");
      }

      setShowCreateModal(false);
      setCreateForm({
        businessName: "",
        ownerName: "",
        ownerEmail: "",
        phoneNumber: "",
        plan: "starter",
        isApproved: true,
      });

      setFeedbackMessage({
        text: `Tenant workspace "${data.workspace?.name || "New Tenant"}" onboarded successfully!`,
        type: "success",
      });

      fetchTenants();
    } catch (err: any) {
      setFeedbackMessage({
        text: err.message || "Tenant onboarding failed",
        type: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/tenants?workspaceId=${deleteTarget.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete workspace");
      }

      setTenants((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setStats((prev) => ({
        ...prev,
        totalWorkspaces: Math.max(0, prev.totalWorkspaces - 1),
      }));

      setFeedbackMessage({
        text: `Workspace "${deleteTarget.name}" deleted successfully.`,
        type: "success",
      });

      setDeleteTarget(null);
    } catch (err: any) {
      setFeedbackMessage({
        text: err.message || "Failed to delete workspace",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  // Filter & Sort Pipeline
  const processedTenants = useMemo(() => {
    const list = tenants.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.businessName.toLowerCase().includes(q) ||
        t.ownerEmail.toLowerCase().includes(q) ||
        (t.phoneNumber && t.phoneNumber.includes(q));

      if (!matchesSearch) return false;

      if (statusFilter === "APPROVED" && !t.isApproved) return false;
      if (statusFilter === "PENDING" && t.isApproved) return false;

      if (planFilter !== "ALL" && t.plan.toLowerCase() !== planFilter.toLowerCase()) return false;

      return true;
    });

    list.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name_asc":
          return a.businessName.localeCompare(b.businessName);
        case "name_desc":
          return b.businessName.localeCompare(a.businessName);
        case "posts":
          return b.totalPosts - a.totalPosts;
        case "members":
          return b.totalMembers - a.totalMembers;
        default:
          return 0;
      }
    });

    return list;
  }, [tenants, searchQuery, statusFilter, planFilter, sortBy]);

  // Pagination slicing
  const totalPages = Math.max(1, Math.ceil(processedTenants.length / pageSize));
  const paginatedTenants = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedTenants.slice(start, start + pageSize);
  }, [processedTenants, currentPage, pageSize]);

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* ─────────────────────────────────────────────────────────────
          1. Header with strictly 2-3 word title and 7-8 word description
         ───────────────────────────────────────────────────────────── */}
      <PageBreadcrumb
        pageTitle="Tenant Workspaces"
        description="Manage registered business workspaces and approval status."
        hideBreadcrumb={true}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Tenant</span>
          </button>

          <button
            onClick={fetchTenants}
            disabled={loading}
            className="p-2 rounded-xl bg-card hover:bg-muted border border-border text-foreground transition-all active:scale-95 cursor-pointer shadow-sm"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </PageBreadcrumb>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between animate-in fade-in ${
            feedbackMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs underline hover:no-underline ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. Standard 4-Metric Grid (StatCards)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-3.5">
        <StatCard
          title="Total Workspaces"
          value={stats.totalWorkspaces}
          subtitle="Enrolled Tenants"
          icon={Building2}
          variant="amber"
        />
        <StatCard
          title="Approved Tenants"
          value={stats.approvedCount}
          subtitle="Active On Platform"
          icon={CheckCircle2}
          variant="emerald"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pendingCount}
          subtitle="Requires Review"
          icon={Clock}
          variant="amber"
        />
        <StatCard
          title="Approval Ratio"
          value={
            stats.totalWorkspaces > 0
              ? `${Math.round((stats.approvedCount / stats.totalWorkspaces) * 100)}%`
              : "0%"
          }
          subtitle="Platform Coverage"
          icon={Users}
          variant="primary"
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. Unified Filter & Search Toolbar (Single Row with Hidden Scrollbars)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-nowrap p-2 sm:p-2.5 rounded-xl border border-border bg-card shadow-xs">
        {/* Search Box */}
        <div className="relative min-w-[240px] sm:min-w-[320px] md:min-w-[380px] flex-1 max-w-lg shrink-0">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5 sm:top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by brand name, workspace slug, or owner email..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-background border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs placeholder:text-muted-foreground/70"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 sm:top-3 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Plan Filter Dropdown */}
        <div className="min-w-[120px] shrink-0">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="w-full px-2.5 py-2 rounded-xl bg-background border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs cursor-pointer"
          >
            <option value="ALL">All Plans</option>
            <option value="starter">Starter Plan</option>
            <option value="growth">Growth Plan</option>
            <option value="agency">Agency Suite</option>
          </select>
        </div>

        {/* Sort By Dropdown */}
        <div className="min-w-[130px] shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-2.5 py-2 rounded-xl bg-background border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs cursor-pointer"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="name_asc">Sort: Brand (A-Z)</option>
            <option value="name_desc">Sort: Brand (Z-A)</option>
            <option value="posts">Sort: Most Posts</option>
            <option value="members">Sort: Most Seats</option>
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 shrink-0 px-1 border-l border-border pl-2">
          {(["ALL", "APPROVED", "PENDING"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                statusFilter === filter
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/80"
              }`}
            >
              {filter === "ALL" ? "All" : filter === "APPROVED" ? "Approved" : "Pending"}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. High-Density Tenant Data Table with Serial Numbers (#SL)
         ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : processedTenants.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No matching workspaces"
          description={
            searchQuery || planFilter !== "ALL" || statusFilter !== "ALL"
              ? "No registered workspaces matched your active filters. Try clearing your search or filters."
              : "No business workspaces enrolled yet. Click 'Create New Tenant' above to add your first client."
          }
          actionText={searchQuery || planFilter !== "ALL" || statusFilter !== "ALL" ? "Reset Filters" : "Create New Tenant"}
          onAction={() => {
            if (searchQuery || planFilter !== "ALL" || statusFilter !== "ALL") {
              setSearchQuery("");
              setPlanFilter("ALL");
              setStatusFilter("ALL");
            } else {
              setShowCreateModal(true);
            }
          }}
          actionIcon={Plus}
        />
      ) : (
        <div className="space-y-3">
          {/* Table Container */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 text-center w-[54px]">#SL</th>
                    <th className="py-2.5 px-3 w-[28%] sm:w-[26%]">Workspace / Brand</th>
                    <th className="py-2.5 px-3 w-[24%] sm:w-[22%]">Owner & Contact</th>
                    <th className="py-2.5 px-3 w-[16%]">Plan & Status</th>
                    <th className="py-2.5 px-3 text-center w-[12%]">Usage</th>
                    <th className="py-2.5 px-3 text-right w-[18%] sm:w-[20%]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedTenants.map((t, index) => {
                    const serial = (currentPage - 1) * pageSize + index + 1;
                    const isUpdating = updatingId === t.id;
                    const isInspecting = inspectingId === t.id;
                    const isExpanded = expandedTenantId === t.id;

                    return (
                      <tr
                        key={t.id}
                        className={`transition-colors hover:bg-muted/40 ${
                          !t.isApproved ? "bg-amber-500/[0.02]" : ""
                        }`}
                      >
                        {/* 1. Serial Number (#SL) */}
                        <td className="py-3 px-3 text-center align-middle">
                          <span className="w-7 h-7 rounded-lg bg-muted/80 border border-border text-foreground font-mono font-bold text-[11px] inline-flex items-center justify-center shadow-2xs">
                            #{serial}
                          </span>
                        </td>

                        {/* 2. Workspace & Brand (Name, Slug, Created) */}
                        <td className="py-3 px-3 align-middle">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 text-primary font-bold text-[11px] flex items-center justify-center shrink-0">
                                {t.businessName ? t.businessName[0].toUpperCase() : "W"}
                              </div>
                              <span
                                className="font-bold text-foreground text-xs sm:text-sm truncate max-w-[150px] sm:max-w-[200px]"
                                title={t.businessName || t.name}
                              >
                                {t.businessName || t.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5 font-mono truncate">
                              <span>slug: {t.name}</span>
                              <span>•</span>
                              <span>
                                Joined{" "}
                                {new Date(t.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Owner & Contact */}
                        <td className="py-3 px-3 align-middle">
                          <div className="min-w-0">
                            <div className="font-semibold text-foreground text-xs truncate">
                              {t.ownerName}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono truncate flex items-center gap-1">
                              <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                              <span className="truncate">{t.ownerEmail}</span>
                            </div>
                            {t.phoneNumber && (
                              <div className="text-[10px] text-muted-foreground font-mono truncate flex items-center gap-1">
                                <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                                <span>{t.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 4. Plan & Status */}
                        <td className="py-3 px-3 align-middle">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted border border-border text-foreground uppercase tracking-wide">
                              {t.plan} Plan
                            </span>
                            <StatusBadge status={t.isApproved ? "APPROVED" : "PENDING"} />
                          </div>
                        </td>

                        {/* 5. Usage (Members & Posts Count) */}
                        <td className="py-3 px-3 align-middle text-center">
                          <div className="inline-flex items-center gap-2.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1" title="Team Seats Enrolled">
                              <Users className="w-3.5 h-3.5 text-primary" />
                              <strong className="text-foreground">{t.totalMembers}</strong>
                            </span>
                            <span className="flex items-center gap-1" title="Content Items Generated">
                              <Layers className="w-3.5 h-3.5 text-sky-400" />
                              <strong className="text-foreground">{t.totalPosts}</strong>
                            </span>
                          </div>
                        </td>

                        {/* 6. Actions */}
                        <td className="py-3 px-3 align-middle text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                            {/* 1-Click Workspace Impersonation ("Inspect") */}
                            <button
                              type="button"
                              onClick={() => handleInspectWorkspace(t.id)}
                              disabled={isInspecting}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-2xs whitespace-nowrap"
                              title="Jump directly into this customer's live workspace view"
                            >
                              {isInspecting ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                              <span>Inspect</span>
                            </button>

                            {/* Approve / Suspend Toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleApproval(t.id, t.isApproved)}
                              disabled={isUpdating}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-2xs whitespace-nowrap ${
                                t.isApproved
                                  ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/25"
                                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                              }`}
                            >
                              {isUpdating ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : t.isApproved ? (
                                <ShieldAlert className="w-3 h-3" />
                              ) : (
                                <ShieldCheck className="w-3 h-3" />
                              )}
                              <span>{t.isApproved ? "Suspend" : "Approve"}</span>
                            </button>

                            {/* Expand Team Seats Button */}
                            <button
                              type="button"
                              onClick={() => setExpandedTenantId(isExpanded ? null : t.id)}
                              className={`p-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                                isExpanded
                                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                  : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                              }`}
                              title={isExpanded ? "Collapse Team Seats" : "View Team Seats"}
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            {/* Delete Tenant Button */}
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ id: t.id, name: t.businessName || t.name })}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                              title="Delete Tenant Workspace"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Expanded Member Details Sub-Panel */}
            {expandedTenantId && (
              <div className="p-3 sm:p-4 bg-muted/20 border-t border-border space-y-2 animate-in fade-in">
                {(() => {
                  const currentTenant = tenants.find((t) => t.id === expandedTenantId);
                  if (!currentTenant) return null;

                  return (
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-border/60">
                        <span className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          <span>Enrolled Team Members for &ldquo;{currentTenant.businessName || currentTenant.name}&rdquo; ({currentTenant.members.length})</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setExpandedTenantId(null)}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          <span>Close</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2.5">
                        {currentTenant.members.map((m) => (
                          <div
                            key={m.id}
                            className="p-3 rounded-xl bg-card border border-border text-xs flex flex-col justify-between space-y-2 hover:border-primary/40 transition-all shadow-xs"
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="font-semibold text-foreground truncate">
                                {m.name || "Member"}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                                {m.role}
                              </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground truncate font-mono">
                              {m.email}
                            </span>
                            {m.allowedPages && m.allowedPages.length > 0 && (
                              <div className="text-[10px] text-muted-foreground truncate">
                                Pages: {m.allowedPages.join(", ")}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleInspectUser(currentTenant.id, m.id)}
                              disabled={inspectingId === m.id}
                              className="w-full mt-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 font-semibold text-[11px] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                              title={`Open ${m.name || m.email}'s dashboard to diagnose and fix issues`}
                            >
                              {inspectingId === m.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                              <span>Open as User</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                5. Pagination Footer (10 rows per page standard)
               ───────────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 px-3.5 py-2.5 border-t border-border bg-muted/20 text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="text-[11px]">
                  Showing <strong>{(currentPage - 1) * pageSize + 1}</strong>–
                  <strong>{Math.min(currentPage * pageSize, processedTenants.length)}</strong> of{" "}
                  <strong>{processedTenants.length}</strong> workspaces
                </span>

                {/* Page Size Selector */}
                <div className="flex items-center gap-1.5 border-l border-border pl-3">
                  <span className="text-[10px] text-muted-foreground">Per page:</span>
                  {[10, 25, 50].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setPageSize(size)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                        pageSize === size
                          ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Navigation Controls */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .map((p, idx, arr) => {
                        const prev = arr[idx - 1];
                        return (
                          <div key={p} className="flex items-center">
                            {prev && p - prev > 1 && (
                              <span className="px-1 text-muted-foreground">...</span>
                            )}
                            <button
                              type="button"
                              onClick={() => setCurrentPage(p)}
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                                currentPage === p
                                  ? "bg-primary text-primary-foreground shadow-xs"
                                  : "bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {p}
                            </button>
                          </div>
                        );
                      })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. Modals: Create Tenant & Delete Workspace
         ───────────────────────────────────────────────────────────── */}
      {/* Create Tenant Workspace Modal */}
      <CustomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Onboard New Tenant Workspace"
        description="Provision a dedicated business workspace with brand kit, subscription, and owner account."
        confirmText={creating ? "Creating Workspace..." : "Create Tenant Workspace"}
        onConfirm={() => {
          const formElement = document.getElementById("tenant-create-form") as HTMLFormElement;
          formElement?.requestSubmit();
        }}
        isLoading={creating}
      >
        <form
          id="tenant-create-form"
          onSubmit={handleCreateTenant}
          className="space-y-4 pt-2"
        >
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Business / Brand Name *
            </label>
            <input
              type="text"
              required
              value={createForm.businessName}
              onChange={(e) => setCreateForm({ ...createForm, businessName: e.target.value })}
              placeholder="e.g. Salon De Royal"
              className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Owner Full Name *
              </label>
              <input
                type="text"
                required
                value={createForm.ownerName}
                onChange={(e) => setCreateForm({ ...createForm, ownerName: e.target.value })}
                placeholder="e.g. Amitav Ghosh"
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Owner Email Address *
              </label>
              <input
                type="email"
                required
                value={createForm.ownerEmail}
                onChange={(e) => setCreateForm({ ...createForm, ownerEmail: e.target.value })}
                placeholder="amitav@salonderoyal.in"
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Business Phone (WhatsApp)
              </label>
              <input
                type="tel"
                value={createForm.phoneNumber}
                onChange={(e) => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                placeholder="+91 98300 12345"
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Initial Subscription Plan
              </label>
              <select
                value={createForm.plan}
                onChange={(e) => setCreateForm({ ...createForm, plan: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              >
                <option value="starter">Starter Plan (₹999 / mo)</option>
                <option value="growth">Growth Plan (₹2,499 / mo)</option>
                <option value="agency">Agency Suite (₹6,999 / mo)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isApproved"
              checked={createForm.isApproved}
              onChange={(e) => setCreateForm({ ...createForm, isApproved: e.target.checked })}
              className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
            />
            <label htmlFor="isApproved" className="text-xs text-foreground font-medium cursor-pointer">
              Automatically activate workspace (skip manual approval review)
            </label>
          </div>
        </form>
      </CustomModal>

      {/* Delete Workspace Confirmation Modal */}
      <CustomModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Tenant Workspace"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? All content drafts, social tokens, brand identity kits, and usage ledgers for this workspace will be permanently wiped.`}
        confirmText={deleting ? "Deleting..." : "Permanently Delete"}
        isDestructive={true}
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
