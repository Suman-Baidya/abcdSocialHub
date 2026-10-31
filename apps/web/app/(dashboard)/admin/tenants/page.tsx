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
  Plus,
  Eye,
  Trash2,
  X,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "APPROVED" | "PENDING">("ALL");
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

      // Immediately navigate to customer's live dashboard view
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
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* 1. Header with strictly 2-3 word title and 7-8 word description */}
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
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
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

      {/* 2. 4-Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-3.5">
        <StatCard
          title="Total Workspaces"
          value={stats.totalWorkspaces}
          icon={Building2}
          variant="amber"
          badge={{ text: "Total", variant: "neutral" }}
        />
        <StatCard
          title="Approved Tenants"
          value={stats.approvedCount}
          icon={CheckCircle2}
          variant="emerald"
          badge={{ text: "Active", variant: "success" }}
        />
        <StatCard
          title="Pending Approval"
          value={stats.pendingCount}
          icon={Clock}
          variant="amber"
          badge={{ text: "Needs Review", variant: "warning" }}
        />
        <StatCard
          title="Approval Ratio"
          value={
            stats.totalWorkspaces > 0
              ? `${Math.round((stats.approvedCount / stats.totalWorkspaces) * 100)}%`
              : "0%"
          }
          icon={Users}
          variant="primary"
          badge={{ text: "Coverage", variant: "info" }}
        />
      </div>

      {/* 3. Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by brand name, workspace, or owner email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted/60 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {(["ALL", "APPROVED", "PENDING"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === filter
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter === "ALL" ? "All" : filter === "APPROVED" ? "Approved" : "Pending"}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tenants Roster Cards */}
      {loading ? (
        <LoadingSkeleton type="cards" count={3} />
      ) : filteredTenants.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No matching workspaces"
          description={
            searchQuery
              ? `No registered tenants matched "${searchQuery}". Try adjusting your search query.`
              : "No business workspaces enrolled yet. Click 'Create New Tenant' above to add your first client."
          }
          actionText={searchQuery ? undefined : "Create New Tenant"}
          onAction={() => setShowCreateModal(true)}
          actionIcon={Plus}
        />
      ) : (
        <div className="space-y-3">
          {filteredTenants.map((t) => {
            const isUpdating = updatingId === t.id;
            const isInspecting = inspectingId === t.id;
            const isExpanded = expandedTenantId === t.id;

            return (
              <div
                key={t.id}
                className={`rounded-2xl border bg-card p-4 sm:p-5 shadow-sm transition-all hover:border-primary/30 ${
                  t.isApproved ? "border-border" : "border-amber-500/30 bg-amber-500/[0.02]"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Business & Tenant Info */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-bold text-foreground truncate">
                        {t.businessName || t.name}
                      </span>
                      <StatusBadge status={t.isApproved ? "APPROVED" : "PENDING"} />
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
                  <div className="flex items-center gap-2.5 sm:gap-3 self-end lg:self-center shrink-0">
                    <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground border-r border-border pr-3 sm:pr-4">
                      <span className="flex items-center gap-1" title="Team Members">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <strong className="text-foreground">{t.totalMembers}</strong>
                      </span>
                      <span className="flex items-center gap-1" title="Total Posts">
                        <Layers className="w-3.5 h-3.5 text-sky-400" />
                        <strong className="text-foreground">{t.totalPosts}</strong>
                      </span>
                    </div>

                    {/* 1-Click Workspace Impersonation ("Inspect") */}
                    <button
                      onClick={() => handleInspectWorkspace(t.id)}
                      disabled={isInspecting}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                      title="Jump into this customer's live workspace view"
                    >
                      {isInspecting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                      <span>Inspect</span>
                    </button>

                    {/* Approve / Suspend Toggle Button */}
                    <button
                      onClick={() => handleToggleApproval(t.id, t.isApproved)}
                      disabled={isUpdating}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${
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

                    {/* Delete Tenant Button */}
                    <button
                      onClick={() => setDeleteTarget({ id: t.id, name: t.businessName || t.name })}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Tenant Workspace"
                    >
                      <Trash2 className="w-4 h-4" />
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
                          className="p-3 rounded-xl bg-card border border-border text-xs flex flex-col justify-between space-y-2 hover:border-primary/40 transition-all shadow-sm"
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
                            onClick={() => handleInspectUser(t.id, m.id)}
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
                )}
              </div>
            );
          })}
        </div>
      )}

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
