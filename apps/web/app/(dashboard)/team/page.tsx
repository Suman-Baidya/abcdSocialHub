"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Mail,
  Shield,
  Trash2,
  Clock,
  Sparkles,
  CheckCircle2,
  Crown,
  Search,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info,
  Lock,
  UserCheck,
  Eye,
  MessageSquare,
  Edit2,
  Pause,
  Play,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { CustomModal } from "@/components/ui/CustomModal";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "DEVELOPER" | "SUPER_ADMIN" | "SUPER_ADMIN_STAFF" | "TENANT_ADMIN" | "OWNER" | "ADMIN_STAFF" | "STAFF" | "CREATOR" | "GUEST";
  status: "ACTIVE" | "INVITED" | "PAUSED";
  joinedAt: string;
  allowedPages?: string[];
  avatarUrl?: string;
  lastActive?: string;
}

interface TeamPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}

interface TeamStats {
  totalCount: number;
  activeCount: number;
  invitedCount: number;
  maxSeats: number;
  availableSeats: number;
}

export default function TeamMembersPage() {
  const { toast } = useToast();
  const { data: session, status: authStatus } = useSession();
  const currentUser = session?.user as any;
  const isSuperAdmin =
    currentUser?.isDeveloper ||
    currentUser?.role === "DEVELOPER" ||
    currentUser?.isSuperAdmin ||
    currentUser?.role === "SUPER_ADMIN" ||
    currentUser?.email === "suman.baidya.pro@gmail.com";

  // State
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Pagination & Metrics from API
  const [pagination, setPagination] = useState<TeamPagination>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
  });

  const [stats, setStats] = useState<TeamStats>({
    totalCount: 4,
    activeCount: 3,
    invitedCount: 1,
    maxSeats: 6,
    availableSeats: 2,
  });

  // Modal State for Member Invitation
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamMember["role"]>("CREATOR");
  const [inviteAllowedPages, setInviteAllowedPages] = useState<string[]>(["leads", "calendar"]);

  // Delete & Revoke State
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Edit Member Modal State
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);
  const [editRole, setEditRole] = useState<TeamMember["role"]>("CREATOR");
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "PAUSED" | "INVITED">("ACTIVE");
  const [editAllowedPages, setEditAllowedPages] = useState<string[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isTogglingPauseId, setIsTogglingPauseId] = useState<string | null>(null);

  // Role Policy Details Collapsible
  const [showPolicyDetails, setShowPolicyDetails] = useState(false);

  // Fetch Team Members from API
  const fetchMembers = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(pageSize),
          role: roleFilter,
        });
        if (searchQuery.trim()) {
          params.set("search", searchQuery.trim());
        }

        const res = await fetch(`/api/team?${params.toString()}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load team members");
        }

        setMembers(data.members || []);
        if (data.pagination) setPagination(data.pagination);
        if (data.stats) setStats(data.stats);

        if (isManualRefresh) {
          toast.success("Roster Refreshed", "Team members and seat allocations are up to date.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load team data");
        if (isManualRefresh) {
          toast.error("Refresh Failed", err.message || "Could not retrieve team roster.");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentPage, pageSize, roleFilter, searchQuery, toast]
  );

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchMembers();
    }
  }, [authStatus, fetchMembers]);

  // Handle Search Input Debounce
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  // Dispatch Invitation
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.warning("Validation Error", "Please provide a valid work email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteName.trim() || inviteEmail.split("@")[0],
          email: inviteEmail.trim(),
          role: inviteRole,
          allowedPages: (inviteRole === "ADMIN_STAFF" || inviteRole === "STAFF" || inviteRole === "SUPER_ADMIN_STAFF") ? inviteAllowedPages : [],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send invitation");
      }

      toast.success(
        "Invitation Dispatched",
        `Magic-link onboarding invite sent to ${inviteEmail}.`
      );

      setIsInviteModalOpen(false);
      setInviteName("");
      setInviteEmail("");
      setInviteRole("CREATOR");
      setInviteAllowedPages(["leads", "calendar"]);
      fetchMembers();
    } catch (err: any) {
      toast.error("Invitation Failed", err.message || "Failed to dispatch invitation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Member Role
  const handleRoleChange = async (memberId: string, newRole: TeamMember["role"]) => {
    // Optimistic UI update
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );

    try {
      const res = await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: memberId, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Role update failed");
      }
      toast.success("Role Updated", `Permissions updated to ${newRole}.`);
      fetchMembers();
    } catch (err: any) {
      toast.error("Update Blocked", err.message || "Failed to update member role.");
      fetchMembers();
    }
  };

  // Revoke Member Access
  const handleConfirmRevoke = async () => {
    if (!memberToDelete) return;

    try {
      setIsRevoking(true);
      const res = await fetch(`/api/team?id=${memberToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to revoke member");
      }

      toast.info(
        "Member Revoked",
        `${memberToDelete.name} has been removed from this workspace.`
      );
      setMemberToDelete(null);
      fetchMembers();
    } catch (err: any) {
      toast.error("Revoke Failed", err.message || "Failed to remove member.");
    } finally {
      setIsRevoking(false);
    }
  };

  // Open Edit Role & Access Modal
  const openEditModal = (member: TeamMember) => {
    setMemberToEdit(member);
    setEditRole(member.role);
    setEditStatus(member.status);
    setEditAllowedPages(member.allowedPages || []);
  };

  // Save Role & Permissions Edit
  const handleSaveEdit = async () => {
    if (!memberToEdit) return;
    try {
      setIsSavingEdit(true);
      const res = await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: memberToEdit.id,
          role: editRole,
          status: editStatus,
          allowedPages: editAllowedPages,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update member");
      }
      toast.success("Member Updated", `${memberToEdit.name} permissions updated.`);
      setMemberToEdit(null);
      fetchMembers();
    } catch (err: any) {
      toast.error("Update Failed", err.message || "Failed to update member.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // 1-Click Toggle Pause / Resume
  const handleTogglePause = async (member: TeamMember) => {
    try {
      setIsTogglingPauseId(member.id);
      const nextStatus = member.status === "PAUSED" ? "ACTIVE" : "PAUSED";
      const res = await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: member.id,
          status: nextStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
      }
      toast.success(
        nextStatus === "PAUSED" ? "Member Paused" : "Member Resumed",
        `${member.name}'s access is now ${nextStatus.toLowerCase()}.`
      );
      fetchMembers();
    } catch (err: any) {
      toast.error("Status Update Failed", err.message || "Failed to toggle pause.");
    } finally {
      setIsTogglingPauseId(null);
    }
  };

  // Role Badge Styling via Semantic Tokens
  const getRoleBadgeClasses = (role: TeamMember["role"]) => {
    switch (role) {
      case "TENANT_ADMIN":
      case "OWNER":
        return "bg-primary/10 text-primary border-primary/30";
      case "CREATOR":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "ADMIN_STAFF":
      case "STAFF":
        return "bg-sky-500/10 text-sky-400 border-sky-500/30";
      case "GUEST":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  // Helper for Initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const startItem =
    pagination.totalItems === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(
    pagination.page * pagination.limit,
    pagination.totalItems
  );

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* ─────────────────────────────────────────────────────────────
          1. Enterprise Header (Strictly 2 Words Title, 7 Words Desc)
         ───────────────────────────────────────────────────────────── */}
      <PageBreadcrumb
        pageTitle="Team & Roles"
        description="Manage organization members and role-based access permissions."
        hideBreadcrumb={true}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Member</span>
          </button>
        </div>
      </PageBreadcrumb>

      {/* ─────────────────────────────────────────────────────────────
          2. Error State with Retry
         ───────────────────────────────────────────────────────────── */}
      {error && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs sm:text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchMembers()}
            className="text-xs font-semibold underline hover:opacity-80 cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. 4 Number-First KPI Metric Cards (2x2 on mobile, 1x4 on desktop)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-3.5">
        {/* KPI 1: Total Allocated Seats */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-3.5 md:p-4 shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Members
            </span>
            <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <h4 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {stats.totalCount}
            </h4>
            <span className="text-[11px] font-semibold text-primary">
              Assigned
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground block mt-2">
            Active workspace seats
          </span>
        </div>

        {/* KPI 2: Active Verified Members */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-3.5 md:p-4 shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Active Members
            </span>
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <h4 className="text-2xl sm:text-3xl font-extrabold text-emerald-500 tracking-tight">
              {stats.activeCount}
            </h4>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Confirmed
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground block mt-2">
            Logged in & active
          </span>
        </div>

        {/* KPI 3: Pending Invites */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-3.5 md:p-4 shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Invites
            </span>
            <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <h4 className="text-2xl sm:text-3xl font-extrabold text-amber-500 tracking-tight">
              {stats.invitedCount}
            </h4>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Awaiting
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground block mt-2">
            Magic links dispatched
          </span>
        </div>

        {/* KPI 4: Available Seat Quota */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-3.5 md:p-4 shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Available Seats
            </span>
            <div className="w-6 h-6 rounded-md bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-500">
              <Shield className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <h4 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {stats.availableSeats}
            </h4>
            <span className="text-[11px] font-semibold text-muted-foreground">
              / {stats.maxSeats} Max
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground block mt-2">
            Growth Tier allocation
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. Role-Based Security Policy Alert (Smart Collapsible Matrix Under Static Cards)
         ───────────────────────────────────────────────────────────── */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-card border border-border shadow-xs text-xs space-y-2.5 transition-all">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <div className="w-5 h-5 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs sm:text-sm font-bold">Role Access Policy</span>
          </div>
          <button
            type="button"
            onClick={() => setShowPolicyDetails(!showPolicyDetails)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted border border-border text-[11px] font-semibold text-foreground transition-all cursor-pointer shadow-xs shrink-0"
          >
            <span>{showPolicyDetails ? "Hide matrix" : "View permissions matrix"}</span>
            {showPolicyDetails ? (
              <ChevronUp className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        </div>

        {showPolicyDetails && (
          <div className="pt-3 border-t border-border space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* 4 Smart Role Cards with Bullet Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {/* Card 1: Owner */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/80 hover:border-primary/40 transition-colors space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                      <Crown className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-foreground">Owner</span>
                  </div>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25">
                    Full Admin
                  </span>
                </div>
                <ul className="space-y-1.5 text-[11px]">
                  <li className="flex items-start gap-1.5 text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Manage billing, subscriptions & receipts</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Decrypt social access tokens & keys</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Invite, promote & revoke team seats</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Global autopilot pause & final approvals</span>
                  </li>
                </ul>
              </div>

              {/* Card 2: Creator */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/80 hover:border-purple-500/40 transition-colors space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-foreground">Creator</span>
                  </div>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/25">
                    Design & Copy
                  </span>
                </div>
                <ul className="space-y-1.5 text-[11px]">
                  <li className="flex items-start gap-1.5 text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Draft 300 DPI vector posters & videos</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Write regional Bengali & Hindi captions</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Stage content items into publish calendar</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-muted-foreground">
                    <Lock className="w-3.5 h-3.5 text-rose-500/80 shrink-0 mt-0.5" />
                    <span>Barred from billing, cards & tokens</span>
                  </li>
                </ul>
              </div>

              {/* Card 3: Staff */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/80 hover:border-sky-500/40 transition-colors space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400">
                      <MessageSquare className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-foreground">Staff</span>
                  </div>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/25">
                    CRM & Leads
                  </span>
                </div>
                <ul className="space-y-1.5 text-[11px]">
                  <li className="flex items-start gap-1.5 text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Manage inbound WhatsApp lead inquiries</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>1-Tap launch direct WhatsApp chat links</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Update CRM booking status & lead notes</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-muted-foreground">
                    <Lock className="w-3.5 h-3.5 text-rose-500/80 shrink-0 mt-0.5" />
                    <span>Barred from billing & social publishing</span>
                  </li>
                </ul>
              </div>

              {/* Card 4: Guest */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/80 hover:border-muted-foreground/40 transition-colors space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-muted border border-border flex items-center justify-center text-muted-foreground">
                      <Eye className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-foreground">Guest</span>
                  </div>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                    Read Only
                  </span>
                </div>
                <ul className="space-y-1.5 text-[11px]">
                  <li className="flex items-start gap-1.5 text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>View Autopilot intelligence briefing</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Inspect engagement charts & metrics</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Audit campaign activity history logs</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-muted-foreground">
                    <Lock className="w-3.5 h-3.5 text-rose-500/80 shrink-0 mt-0.5" />
                    <span>Zero mutating write permissions</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Smart Security Guarantee Bar */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-primary/5 border border-primary/15 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Shield className="w-3 h-3 text-primary shrink-0" />
                <span>Zero-Trust Permission Boundary</span>
              </span>
              <div className="flex items-center gap-3 font-mono">
                <span>AES-256 Auth Encryption</span>
                <span>•</span>
                <span>Row-Level Tenant Isolation</span>
                <span>•</span>
                <span>Zero Plaintext Secret Exposure</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. Performance Search & Filter Controls (Desktop: 1 Line, Mobile: 2 Lines)
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-full overflow-hidden p-2.5 sm:p-3 rounded-2xl bg-card border border-border shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        {/* Mobile Line 1 / Desktop Left: Search input + Mobile Refresh */}
        <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
          <div className="relative flex-1 lg:flex-none lg:w-60 xl:w-72 min-w-0">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 sm:py-2 rounded-xl bg-muted/60 border border-border text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Refresh button visible on mobile line 1 */}
          <button
            type="button"
            onClick={() => fetchMembers(true)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-card hover:bg-muted border border-border text-foreground transition-all cursor-pointer shrink-0 shadow-sm lg:hidden"
            title="Refresh team roster"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>

        {/* Mobile Line 2 / Desktop Right: Role Pills + Rows Selector + Desktop Refresh */}
        <div className="flex items-center justify-between lg:justify-end gap-2 w-full lg:w-auto min-w-0">
          {/* Role filter pills in horizontal scroll row */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0 lg:flex-none">
            {[
              { id: "ALL", label: "All" },
              { id: "OWNER", label: "Owner" },
              { id: "CREATOR", label: "Creator" },
              { id: "STAFF", label: "Staff" },
              { id: "GUEST", label: "Guest" },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleRoleFilterChange(r.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  roleFilter === r.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          {/* Page Size Rows Selector */}
          <div className="flex items-center gap-1 shrink-0 text-xs text-muted-foreground pl-1">
            <span className="text-[11px] font-semibold hidden md:inline">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1.5 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Refresh button on desktop right */}
          <button
            type="button"
            onClick={() => fetchMembers(true)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-card hover:bg-muted border border-border text-foreground transition-all cursor-pointer shrink-0 shadow-sm hidden lg:flex"
            title="Refresh team roster"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. Enterprise Members Table with SL # and Role Controls
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="w-12 px-3 py-3 text-center">#</th>
                <th className="min-w-[240px] sm:w-[38%] px-3 sm:px-4 py-3">Team Member</th>
                <th className="min-w-[110px] sm:w-[15%] px-3 sm:px-4 py-3">Status</th>
                <th className="min-w-[120px] sm:w-[18%] px-3 sm:px-4 py-3">Joined Date</th>
                <th className="min-w-[150px] sm:w-[25%] px-3 sm:px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && members.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`skel_${i}`} className="animate-pulse">
                    <td className="w-12 px-3 py-3.5 text-center">
                      <div className="h-3 w-4 bg-muted rounded mx-auto" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3.5 bg-muted rounded w-32" />
                          <div className="h-2.5 bg-muted rounded w-44" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-5 w-16 bg-muted rounded" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-3 w-24 bg-muted rounded" />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="h-7 w-20 bg-muted rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto text-muted-foreground">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-semibold text-foreground">
                        No team members found
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {searchQuery || roleFilter !== "ALL"
                          ? "Try adjusting your search query or role filter."
                          : "Invite team members to collaborate on social campaigns and customer follow-ups."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsInviteModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-sm cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Invite First Member</span>
                    </button>
                  </td>
                </tr>
              ) : (
                members.map((member, idx) => (
                  <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                    {/* SL Number */}
                    <td className="w-12 px-3 py-3 text-center font-mono text-[11px] font-bold text-muted-foreground align-middle">
                      {(pagination.page - 1) * pagination.limit + idx + 1}
                    </td>

                    {/* Member & Role (Avatar + Name + Role Badge on Line 1, Email on Line 2) */}
                    <td className="min-w-[240px] sm:w-[38%] px-3 sm:px-4 py-3 align-middle">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-primary font-bold text-xs shrink-0 select-none overflow-hidden">
                          {member.avatarUrl ? (
                            <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            getInitials(member.name)
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          {/* Line 1: Name + Role Badge directly beside name */}
                          <div className="font-bold text-foreground text-xs flex items-center gap-1.5 flex-nowrap min-w-0">
                            <span className="truncate max-w-[130px] sm:max-w-[180px]" title={member.name}>
                              {member.name}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.2 rounded-full font-bold border shrink-0 ${getRoleBadgeClasses(
                                member.role
                              )}`}
                            >
                              {member.role === "OWNER" && <Crown className="w-2.5 h-2.5 text-amber-500" />}
                              <span>{member.role.replace(/_/g, " ")}</span>
                            </span>
                          </div>
                          {/* Line 2: Email */}
                          <div className="text-muted-foreground font-mono text-[11px] truncate mt-0.5" title={member.email}>
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="min-w-[110px] sm:w-[15%] px-3 sm:px-4 py-3 align-middle">
                      {member.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span>Active</span>
                        </span>
                      ) : member.status === "PAUSED" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-[10px] text-rose-600 dark:text-rose-400 font-semibold whitespace-nowrap">
                          <Pause className="w-3 h-3 shrink-0" />
                          <span>Paused</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-600 dark:text-amber-400 font-semibold whitespace-nowrap">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>Invited</span>
                        </span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="min-w-[120px] sm:w-[18%] px-3 sm:px-4 py-3 text-muted-foreground text-[11px] whitespace-nowrap align-middle">
                      {member.joinedAt}
                    </td>

                    {/* Actions: Edit, Pause / Resume, Revoke */}
                    <td className="min-w-[150px] sm:w-[25%] px-3 sm:px-4 py-3 text-right whitespace-nowrap align-middle">
                      {member.role !== "OWNER" ? (
                        <div className="inline-flex items-center gap-1.5">
                          {/* Edit Role & Access */}
                          <button
                            type="button"
                            onClick={() => openEditModal(member)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card hover:bg-muted border border-border text-foreground text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
                            title={`Edit ${member.name}'s role & permissions`}
                          >
                            <Edit2 className="w-3 h-3 text-primary" />
                            <span>Edit</span>
                          </button>

                          {/* Pause / Resume Toggle */}
                          <button
                            type="button"
                            onClick={() => handleTogglePause(member)}
                            disabled={isTogglingPauseId === member.id}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50 ${
                              member.status === "PAUSED"
                                ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
                            }`}
                            title={member.status === "PAUSED" ? "Resume member access" : "Pause member access"}
                          >
                            {isTogglingPauseId === member.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : member.status === "PAUSED" ? (
                              <Play className="w-3 h-3" />
                            ) : (
                              <Pause className="w-3 h-3" />
                            )}
                            <span>{member.status === "PAUSED" ? "Resume" : "Pause"}</span>
                          </button>

                          {/* Revoke Member */}
                          <button
                            type="button"
                            onClick={() => setMemberToDelete(member)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 border border-transparent hover:border-rose-500/25 transition-all cursor-pointer"
                            title={`Revoke ${member.name} from workspace`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/60 italic font-mono px-2 py-1 rounded bg-muted/40 border border-border">
                          Protected
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            7. Strict 1-Line Responsive Pagination Bar
           ───────────────────────────────────────────────────────────── */}
        <div className="p-3 sm:p-3.5 border-t border-border bg-card flex items-center justify-between text-xs text-muted-foreground gap-2">
          {/* Left: Range text */}
          <span className="text-[11px] sm:text-xs">
            Showing <strong className="text-foreground">{startItem}</strong> to{" "}
            <strong className="text-foreground">{endItem}</strong> of{" "}
            <strong className="text-foreground">{pagination.totalItems}</strong> members
          </span>

          {/* Right: Navigation Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={!pagination.hasPrev}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Page number indicators */}
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .slice(0, 5)
                .map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "border border-border bg-card hover:bg-muted text-foreground"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
            </div>

            <button
              type="button"
              disabled={!pagination.hasNext}
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              aria-label="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          8. Invite Member Modal (Clean Form with Role Capabilities)
         ───────────────────────────────────────────────────────────── */}
      <CustomModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Member"
        description="Dispatch authenticated magic link onboarding invitation."
      >
        <form onSubmit={handleSendInvite} className="space-y-3.5 mt-2">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul Sen"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Work Email Address
            </label>
            <input
              type="email"
              required
              placeholder="colleague@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 font-mono transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Role & Access Permissions
            </label>
            <select
              value={inviteRole}
              onChange={(e) => {
                const r = e.target.value as any;
                setInviteRole(r);
                if (r === "SUPER_ADMIN_STAFF") {
                  setInviteAllowedPages(["tenants", "marketing"]);
                } else if (r === "ADMIN_STAFF" || r === "STAFF") {
                  setInviteAllowedPages(["leads", "calendar"]);
                } else {
                  setInviteAllowedPages([]);
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-xs text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            >
              {isSuperAdmin && (
                <option value="SUPER_ADMIN_STAFF">SUPER ADMIN STAFF — Delegated platform operations & tenant management</option>
              )}
              <option value="CREATOR">CREATOR — Design promotional posters & Bengali/Hindi copy</option>
              <option value="ADMIN_STAFF">ADMIN STAFF — Inbound WhatsApp CRM & booking schedules</option>
              <option value="GUEST">GUEST — Read-only observation of reports & audits</option>
            </select>
          </div>

          {/* Granular Platform Permission Checkboxes for Super Admin Staff */}
          {inviteRole === "SUPER_ADMIN_STAFF" && (
            <div className="space-y-2 p-3 rounded-xl bg-muted/40 border border-border">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-foreground">
                  Allowed Platform Modules
                </label>
                <span className="text-[10px] text-muted-foreground">Platform Delegation</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "tenants", label: "Tenant Workspaces & Approvals" },
                  { id: "marketing", label: "Founder Cockpit & Leads" },
                  { id: "billing", label: "Platform Revenue & Invoicing" },
                ].map((pg) => {
                  const checked = inviteAllowedPages.includes(pg.id);
                  return (
                    <label
                      key={pg.id}
                      className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setInviteAllowedPages((prev) =>
                            checked ? prev.filter((p) => p !== pg.id) : [...prev, pg.id]
                          );
                        }}
                        className="rounded border-border text-primary focus:ring-primary cursor-pointer w-3.5 h-3.5"
                      />
                      <span className="text-[11px]">{pg.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Granular Page Permission Checkboxes for Admin Staff */}
          {(inviteRole === "ADMIN_STAFF" || inviteRole === "STAFF") && (
            <div className="space-y-2 p-3 rounded-xl bg-muted/40 border border-border">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-foreground">
                  Allowed Workspace Pages
                </label>
                <span className="text-[10px] text-muted-foreground">Select accessible routes</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "leads", label: "WhatsApp Leads CRM" },
                  { id: "calendar", label: "Publishing Calendar" },
                  { id: "content", label: "Content Studio" },
                  { id: "social", label: "Social Channels" },
                  { id: "brand", label: "Brand Identity Kit" },
                ].map((pg) => {
                  const checked = inviteAllowedPages.includes(pg.id);
                  return (
                    <label
                      key={pg.id}
                      className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setInviteAllowedPages((prev) =>
                            checked ? prev.filter((p) => p !== pg.id) : [...prev, pg.id]
                          );
                        }}
                        className="rounded border-border text-primary focus:ring-primary cursor-pointer w-3.5 h-3.5"
                      />
                      <span className="text-[11px]">{pg.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="p-2.5 rounded-xl bg-muted/40 border border-border text-[11px] text-muted-foreground leading-snug">
            {inviteRole === "CREATOR" && (
              <span>Allows drafting posters, content ideas, and scheduling social campaigns. Barred from billing.</span>
            )}
            {(inviteRole === "ADMIN_STAFF" || inviteRole === "STAFF") && (
              <span>Allows managing assigned workspace pages. Barred from billing, secrets, and role demotion.</span>
            )}
            {inviteRole === "GUEST" && (
              <span>Provides read-only visibility into Autopilot analytics. Cannot edit content or dispatch messages.</span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Dispatching..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </CustomModal>

      {/* ─────────────────────────────────────────────────────────────
          9. Revoke Member Modal (High-Contrast Red Destructive Dialog)
         ───────────────────────────────────────────────────────────── */}
      <CustomModal
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        title="Revoke Member Access"
        description={`Are you sure you want to revoke ${memberToDelete?.name || "this member"} (${memberToDelete?.email})? All active session tokens will be invalidated immediately.`}
        confirmText={isRevoking ? "Revoking..." : "Revoke Access"}
        onConfirm={handleConfirmRevoke}
        isDestructive
      />

      {/* ─────────────────────────────────────────────────────────────
          10. Edit Member Role & Status Modal
         ───────────────────────────────────────────────────────────── */}
      <CustomModal
        isOpen={!!memberToEdit}
        onClose={() => setMemberToEdit(null)}
        title="Edit Team Member Role"
        description={`Update role permissions, operational scope and access state for ${memberToEdit?.name}.`}
        confirmText={isSavingEdit ? "Saving..." : "Save Changes"}
        onConfirm={handleSaveEdit}
        isLoading={isSavingEdit}
      >
        <div className="space-y-4 pt-2">
          {/* Member Name & Email */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Member Profile
            </label>
            <div className="px-3 py-2 rounded-xl bg-muted/40 border border-border text-xs text-foreground flex items-center justify-between">
              <span className="font-semibold">{memberToEdit?.name}</span>
              <span className="text-muted-foreground font-mono text-[11px]">{memberToEdit?.email}</span>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Assign Workspace Role
            </label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="CREATOR">CREATOR (Design, Poster & Video Drafting)</option>
              <option value="ADMIN_STAFF">ADMIN STAFF (Leads, Calendar & Ops Access)</option>
              <option value="STAFF">STAFF (Inbound WhatsApp Leads & CRM)</option>
              <option value="GUEST">GUEST (Read-Only Autopilot Briefings)</option>
            </select>
          </div>

          {/* Access Status (Active vs Paused) */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Access State
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditStatus("ACTIVE")}
                className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  editStatus === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold shadow-2xs"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active</span>
              </button>
              <button
                type="button"
                onClick={() => setEditStatus("PAUSED")}
                className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  editStatus === "PAUSED"
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold shadow-2xs"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Paused</span>
              </button>
            </div>
          </div>

          {/* Granular Page Permission Checkboxes for Admin Staff / Staff */}
          {(editRole === "ADMIN_STAFF" || editRole === "STAFF") && (
            <div className="space-y-2 p-3 rounded-xl bg-muted/40 border border-border">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-foreground">
                  Allowed Workspace Pages
                </label>
                <span className="text-[10px] text-muted-foreground">Select accessible routes</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "leads", label: "WhatsApp Leads CRM" },
                  { id: "calendar", label: "Publishing Calendar" },
                  { id: "content", label: "Content Studio" },
                  { id: "social", label: "Social Channels" },
                  { id: "brand", label: "Brand Identity Kit" },
                ].map((pg) => {
                  const checked = editAllowedPages.includes(pg.id);
                  return (
                    <label
                      key={pg.id}
                      className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setEditAllowedPages((prev) =>
                            checked ? prev.filter((p) => p !== pg.id) : [...prev, pg.id]
                          );
                        }}
                        className="rounded border-border text-primary focus:ring-primary cursor-pointer w-3.5 h-3.5"
                      />
                      <span className="text-[11px]">{pg.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CustomModal>
    </div>
  );
}
