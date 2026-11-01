"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
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
  Copy,
  Check,
  Lock,
  UserCheck,
  Edit2,
  Share2,
  Calendar,
  ImageIcon,
  MessageSquare,
  Palette,
  CreditCard,
  LayoutDashboard,
  Building2,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { CustomModal } from "@/components/ui/CustomModal";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";

export interface TeamMember {
  id: string;
  userId?: string;
  name: string;
  email: string;
  role: "DEVELOPER" | "SUPER_ADMIN" | "SUPER_ADMIN_STAFF" | "TENANT_ADMIN" | "OWNER" | "ADMIN_STAFF" | "STAFF" | "CREATOR" | "GUEST";
  status: "ACTIVE" | "INVITED" | "PAUSED";
  joinedAt: string;
  workspaceName?: string;
  organizationId?: string;
  allowedPages?: string[];
  avatarUrl?: string | null;
  lastActive?: string;
  isOwner?: boolean;
}

export interface PendingInvitation {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  allowedPages: string[];
  token: string;
  inviteUrl: string;
  workspaceName?: string;
  createdAt: string;
  expiresAt: string;
}

interface TeamStats {
  totalCount: number;
  activeCount: number;
  invitedCount: number;
  maxSeats: number;
  availableSeats: number;
  tenantAdminCount?: number;
  staffCount?: number;
  creatorCount?: number;
  superAdminCount?: number;
}

const AVAILABLE_PAGES = [
  { id: "dashboard", label: "Autopilot Report", icon: LayoutDashboard, desc: "Executive briefing & AI logs" },
  { id: "content", label: "Content Studio", icon: ImageIcon, desc: "AI generation & Bengali posters" },
  { id: "calendar", label: "Publishing Queue", icon: Calendar, desc: "Schedule posts & calendar feed" },
  { id: "leads", label: "WhatsApp Leads", icon: MessageSquare, desc: "CRM leads & 1-tap chats" },
  { id: "social", label: "Social Channels", icon: Share2, desc: "Connect Meta, YouTube, LinkedIn" },
  { id: "brand", label: "Brand Identity Kit", icon: Palette, desc: "Colors, typography, logo guidelines" },
  { id: "billing", label: "Billing & Plans", icon: CreditCard, desc: "Subscriptions, seats & invoices" },
];

export default function TeamMembersPage() {
  const { toast } = useToast();
  const { data: session, status: authStatus } = useSession();

  // State
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [isCreatorSolo, setIsCreatorSolo] = useState(false);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const [stats, setStats] = useState<TeamStats>({
    totalCount: 1,
    activeCount: 1,
    invitedCount: 0,
    maxSeats: 5,
    availableSeats: 4,
    tenantAdminCount: 1,
    staffCount: 0,
    creatorCount: 0,
    superAdminCount: 0,
  });

  // Modal State for Teammate Invitation
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamMember["role"]>("ADMIN_STAFF");
  const [inviteAllowedPages, setInviteAllowedPages] = useState<string[]>(["content", "calendar"]);
  const [createdInviteUrl, setCreatedInviteUrl] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Delete & Revoke State
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [deleteMode, setDeleteMode] = useState<"PERMANENT" | "REVOKE">("PERMANENT");
  const [confirmAcknowledge, setConfirmAcknowledge] = useState(false);
  const [inviteToCancel, setInviteToCancel] = useState<PendingInvitation | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Edit Teammate Permissions Modal
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);
  const [editAllowedPages, setEditAllowedPages] = useState<string[]>([]);
  const [editRole, setEditRole] = useState<TeamMember["role"]>("ADMIN_STAFF");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Collapsible Role Matrix
  const [showPolicyDetails, setShowPolicyDetails] = useState(false);

  // Fetch Team Members & Invitations from API
  const fetchMembers = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const params = new URLSearchParams({
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

        setIsCreatorSolo(!!data.isCreatorSolo);
        setIsPlatformAdmin(!!data.isPlatformAdmin);
        setIsDeveloper(!!data.isDeveloper);
        setMembers(data.members || []);
        setInvitations(data.invitations || []);
        if (data.stats) setStats(data.stats);

        if (isManualRefresh) {
          toast.success("Roster Refreshed", "Team members and invitations are up to date.");
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
    [roleFilter, searchQuery, toast]
  );

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchMembers();
    }
  }, [authStatus, fetchMembers]);

  // Handle Search Input
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
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
          email: inviteEmail.trim(),
          name: inviteName.trim() || undefined,
          role: isPlatformAdmin ? inviteRole : "ADMIN_STAFF",
          allowedPages: inviteAllowedPages,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create invitation");
      }

      setCreatedInviteUrl(data.invitation.inviteUrl);
      toast.success(
        "Invitation Link Generated",
        `Share the link with ${inviteEmail} to complete onboarding.`
      );
      fetchMembers();
    } catch (err: any) {
      toast.error("Invitation Failed", err.message || "Failed to generate invitation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete or Revoke Member Access
  const handleConfirmDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      setIsRevoking(true);
      const isPermanent = deleteMode === "PERMANENT";
      const params = new URLSearchParams();
      params.set("id", memberToDelete.id);
      if (memberToDelete.userId) params.set("userId", memberToDelete.userId);
      if (isPermanent) params.set("permanent", "true");

      const res = await fetch(`/api/team?${params.toString()}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete user");
      }

      if (isPermanent) {
        toast.success(
          "User Permanently Deleted",
          `${memberToDelete.email} has been purged from the database. Email is now released.`
        );
      } else {
        toast.info("Member Revoked", `${memberToDelete.name} has been removed from this workspace.`);
      }

      setMemberToDelete(null);
      fetchMembers();
    } catch (err: any) {
      toast.error("Deletion Failed", err.message || "Failed to delete member.");
    } finally {
      setIsRevoking(false);
    }
  };

  // Cancel Pending Invitation
  const handleConfirmCancelInvite = async () => {
    if (!inviteToCancel) return;

    try {
      setIsRevoking(true);
      const res = await fetch(`/api/team?invitationId=${inviteToCancel.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to cancel invitation");
      }

      toast.info("Invitation Cancelled", `Invitation for ${inviteToCancel.email} was removed.`);
      setInviteToCancel(null);
      fetchMembers();
    } catch (err: any) {
      toast.error("Cancellation Failed", err.message || "Failed to cancel invitation.");
    } finally {
      setIsRevoking(false);
    }
  };

  // Open Edit Permissions Modal
  const openEditModal = (member: TeamMember) => {
    setMemberToEdit(member);
    setEditRole(member.role);
    setEditAllowedPages(member.allowedPages || ["content", "calendar"]);
  };

  // Save Permissions Edit
  const handleSaveEdit = async () => {
    if (!memberToEdit) return;
    try {
      setIsSavingEdit(true);
      const res = await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: memberToEdit.id,
          role: isPlatformAdmin ? editRole : undefined,
          allowedPages: editAllowedPages,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update permissions");
      }
      toast.success("Permissions Updated", `${memberToEdit.name}'s permissions have been updated.`);
      setMemberToEdit(null);
      fetchMembers();
    } catch (err: any) {
      toast.error("Update Failed", err.message || "Failed to update member permissions.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Copy helper
  const handleCopyLink = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedToken(key);
    toast.success("Link Copied", "Invitation link copied to clipboard.");
    setTimeout(() => setCopiedToken(null), 2500);
  };

  // Reset modal state on close
  const closeInviteModal = () => {
    setIsInviteModalOpen(false);
    setInviteEmail("");
    setInviteName("");
    setInviteRole("ADMIN_STAFF");
    setInviteAllowedPages(["content", "calendar"]);
    setCreatedInviteUrl(null);
  };

  const getRoleBadgeClasses = (role: TeamMember["role"]) => {
    switch (role) {
      case "DEVELOPER":
        return "bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/30";
      case "SUPER_ADMIN":
      case "SUPER_ADMIN_STAFF":
        return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      case "TENANT_ADMIN":
      case "OWNER":
        return "bg-primary/10 text-primary border-primary/30";
      case "CREATOR":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "ADMIN_STAFF":
      case "STAFF":
        return "bg-sky-500/10 text-sky-400 border-sky-500/30";
      case "GUEST":
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER CASE 1: Creator Solo Workspace State
  // ─────────────────────────────────────────────────────────────
  if (isCreatorSolo) {
    return (
      <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
        <PageBreadcrumb
          pageTitle="Creative Studio"
          description="Autonomous individual workspace for content creation and publishing."
          hideBreadcrumb={true}
        />

        <div className="p-6 sm:p-8 rounded-2xl border border-purple-500/20 bg-card shadow-sm space-y-4 text-center max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/25 flex items-center justify-center mx-auto shadow-2xs">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-foreground">Creator Solo Workspace</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your Creator account is configured for focused, individual creative production. Multi-seat team
              delegation and staff role assignments are exclusive to <strong>Tenant Business Plans</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-left text-xs space-y-2">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Full Creator Capabilities Active:</span>
            </div>
            <ul className="space-y-1 text-muted-foreground text-[11px] list-disc list-inside">
              <li>Direct AI poster and caption generation in Bengali & English</li>
              <li>Autonomous scheduled calendar publishing to social channels</li>
              <li>Brand kit asset styling with zero team interference</li>
            </ul>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/content"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-xs"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Open Content Studio</span>
            </Link>
            <Link
              href="/calendar"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:bg-muted transition-all shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>View Publishing Queue</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER CASE 2: Team Directory (Platform Admin OR Tenant Admin)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* ─────────────────────────────────────────────────────────────
          1. Canonical Page Header (Strictly 2 Words Title, 7 Words Desc)
         ───────────────────────────────────────────────────────────── */}
      <PageBreadcrumb
        pageTitle={isPlatformAdmin ? "Team & Admins" : "Team & Roles"}
        description={
          isPlatformAdmin
            ? "Platform administrators, tenant owners, staff, and creators."
            : "Manage organization members and role-based access permissions."
        }
        hideBreadcrumb={true}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isPlatformAdmin ? "Add User" : "Invite Teammate"}</span>
          </button>
        </div>
      </PageBreadcrumb>

      {/* ─────────────────────────────────────────────────────────────
          2. Error State
         ───────────────────────────────────────────────────────────── */}
      {error && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-500 dark:text-rose-400 text-xs sm:text-sm flex items-center justify-between gap-3">
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
          3. 4 Number-First StatCards (Numbers Strictly Highlighted)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-3.5">
        {/* Card 1: Total Users */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-3.5 md:p-4 shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {isPlatformAdmin ? "Total Users" : "Total Members"}
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
              {isPlatformAdmin ? "Platform" : "Assigned"}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground block mt-2">
            {isPlatformAdmin ? "All registered accounts" : "Active workspace seats"}
          </span>
        </div>

        {/* Card 2: Tenant Admins OR Active Members */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-3.5 md:p-4 shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {isPlatformAdmin ? "Tenant Admins" : "Active Members"}
            </span>
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <h4 className="text-2xl sm:text-3xl font-extrabold text-emerald-500 tracking-tight">
              {isPlatformAdmin ? stats.tenantAdminCount ?? 0 : stats.activeCount}
            </h4>
            <span className="text-[11px] font-semibold text-muted-foreground">
              {isPlatformAdmin ? "Owners" : "Confirmed"}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground block mt-2">
            {isPlatformAdmin ? "Brand administrators" : "Onboarded teammates"}
          </span>
        </div>

        {/* Card 3: Teammates & Staff OR Pending Invites */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-3.5 md:p-4 shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {isPlatformAdmin ? "Teammates / Staff" : "Pending Invites"}
            </span>
            <div className="w-6 h-6 rounded-md bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400">
              {isPlatformAdmin ? <Users className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <h4 className="text-2xl sm:text-3xl font-extrabold text-sky-400 tracking-tight">
              {isPlatformAdmin ? stats.staffCount ?? 0 : stats.invitedCount}
            </h4>
            <span className="text-[11px] font-semibold text-muted-foreground">
              {isPlatformAdmin ? "Delegated" : "Awaiting"}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground block mt-2">
            {isPlatformAdmin ? "Assigned staff members" : "Active invitation links"}
          </span>
        </div>

        {/* Card 4: Creators OR Available Seats */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-3.5 md:p-4 shadow-sm hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {isPlatformAdmin ? "Creators" : "Available Seats"}
            </span>
            <div className="w-6 h-6 rounded-md bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
              {isPlatformAdmin ? <Sparkles className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <h4 className="text-2xl sm:text-3xl font-extrabold text-purple-400 tracking-tight">
              {isPlatformAdmin ? stats.creatorCount ?? 0 : stats.availableSeats}
            </h4>
            <span className="text-[11px] font-semibold text-muted-foreground">
              {isPlatformAdmin ? "Solo" : `/ ${stats.maxSeats} Max`}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground block mt-2">
            {isPlatformAdmin ? "Creative studio users" : "Tenant Growth allocation"}
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. Role-Based Policy Matrix
         ───────────────────────────────────────────────────────────── */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-card border border-border shadow-xs text-xs space-y-2.5 transition-all">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <div className="w-5 h-5 rounded-md bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs sm:text-sm font-bold">
              {isPlatformAdmin ? "Platform Hierarchy & Role Policy" : "Tenant 2-Role Access Policy"}
            </span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {/* Developer / Super Admin */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Platform Admin</span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/25">
                    Controller
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Sees all users across all tenant workspaces. Developer accounts remain concealed from non-developers.
                </p>
              </div>

              {/* Tenant Admin */}
              <div className="p-3 rounded-xl bg-muted/30 border border-primary/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Tenant Admin</span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25">
                    Workspace Owner
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Full control over tenant brand, social tokens, billing, and staff teammates. Strictly isolated.
                </p>
              </div>

              {/* Staff */}
              <div className="p-3 rounded-xl bg-muted/30 border border-sky-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Staff (Teammate)</span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/25">
                    Delegated
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Authorized only for specific pages (Content, Leads, Calendar) chosen by the Tenant Admin.
                </p>
              </div>

              {/* Creator */}
              <div className="p-3 rounded-xl bg-muted/30 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Creator</span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/25">
                    Solo Studio
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Individual creative production account. Multi-seat team management is disabled.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. Search & Filters Toolbar
         ───────────────────────────────────────────────────────────── */}
      <div className="p-2.5 sm:p-3 rounded-2xl bg-card border border-border shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={isPlatformAdmin ? "Search all platform users..." : "Search workspace teammates..."}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 sm:py-2 rounded-xl bg-background border border-border text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 flex-nowrap">
          {(isPlatformAdmin
            ? [
                { id: "ALL", label: "All Users" },
                { id: "ADMIN", label: "Admins" },
                { id: "STAFF", label: "Staff" },
                { id: "CREATOR", label: "Creators" },
                ...(isDeveloper ? [{ id: "DEVELOPER", label: "Developers" }] : []),
              ]
            : [
                { id: "ALL", label: "All Members" },
                { id: "TENANT_ADMIN", label: "Admins" },
                { id: "ADMIN_STAFF", label: "Staff" },
              ]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRoleFilter(tab.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                roleFilter === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/80"
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => fetchMembers(true)}
            disabled={refreshing}
            className="p-1.5 sm:p-2 rounded-xl bg-card hover:bg-muted border border-border text-foreground transition-all cursor-pointer shadow-xs ml-1"
            title="Refresh team directory"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. Users & Teammates Directory Table
         ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="px-3.5 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="text-xs sm:text-sm font-bold text-foreground">
              {isPlatformAdmin ? "Platform User Directory" : "Workspace Teammates"}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            {members.length} {isPlatformAdmin ? "User" : "Member"}{members.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Loading directory...</div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
            <p>No users found matching your search or filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-3.5 py-2.5 w-12 text-center font-mono">#SL</th>
                  <th className="px-3.5 py-2.5">User Identity</th>
                  <th className="px-3 py-2.5">Assigned Role</th>
                  <th className="px-3 py-2.5">{isPlatformAdmin ? "Workspace / Tenant" : "Granted Page Access"}</th>
                  <th className="px-3 py-2.5 hidden sm:table-cell">Joined Date</th>
                  <th className="px-3.5 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((member, index) => {
                  const isOwner = member.isOwner || member.role === "OWNER" || member.role === "TENANT_ADMIN";
                  const joinDateStr = new Date(member.joinedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3.5 py-3 text-center font-mono text-[11px] text-muted-foreground">
                        #{index + 1}
                      </td>

                      {/* User Column */}
                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00F0FF]/20 to-blue-600/20 border border-[#00F0FF]/30 flex items-center justify-center font-bold text-xs text-primary overflow-hidden shrink-0 shadow-2xs">
                            <img
                              src={member.avatarUrl || "/avatars/default-avatar.svg"}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-foreground flex items-center gap-1.5">
                              <span className="truncate max-w-[140px] sm:max-w-none">{member.name}</span>
                              {isOwner && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono truncate max-w-[140px] sm:max-w-none">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-3 py-3">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getRoleBadgeClasses(
                            member.role
                          )}`}
                        >
                          {member.role.replace("_", " ")}
                        </span>
                      </td>

                      {/* Workspace Name (Platform Admin) OR Allowed Pages (Tenant Admin) */}
                      <td className="px-3 py-3">
                        {isPlatformAdmin ? (
                          <div className="flex items-center gap-1.5 text-foreground font-medium">
                            <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate max-w-[180px]">{member.workspaceName || "Global Platform"}</span>
                          </div>
                        ) : isOwner ? (
                          <span className="text-[10px] font-mono text-muted-foreground">Full Workspace Access</span>
                        ) : member.allowedPages && member.allowedPages.length > 0 ? (
                          <div className="flex items-center gap-1 flex-wrap max-w-xs">
                            {member.allowedPages.map((p) => (
                              <span
                                key={p}
                                className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-muted text-foreground border border-border uppercase"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">No pages assigned</span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="px-3 py-3 hidden sm:table-cell text-muted-foreground font-mono text-[11px]">
                        {joinDateStr}
                      </td>

                      {/* Actions */}
                      <td className="px-3.5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(member)}
                            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-xs cursor-pointer"
                            title="Edit permissions or role"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {member.role !== "DEVELOPER" && (
                            <button
                              type="button"
                              onClick={() => {
                                setMemberToDelete(member);
                                setDeleteMode("PERMANENT");
                                setConfirmAcknowledge(false);
                              }}
                              className="p-1.5 rounded-lg border border-border bg-card hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all shadow-xs cursor-pointer"
                              title="Delete user permanently or revoke access"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          7. Pending Invitations Section
         ───────────────────────────────────────────────────────────── */}
      {invitations.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-card overflow-hidden shadow-xs space-y-0">
          <div className="px-3.5 py-2.5 border-b border-border bg-amber-500/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs sm:text-sm font-bold text-foreground">Pending Invitations</h3>
            </div>
            <span className="text-[11px] font-mono text-amber-500">
              {invitations.length} Active Invitation Link{invitations.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="divide-y divide-border">
            {invitations.map((inv) => {
              const expiresStr = new Date(inv.expiresAt).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={inv.id}
                  className="p-3 sm:p-3.5 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{inv.email}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/25 uppercase">
                        {inv.role.replace("_", " ")}
                      </span>
                      {inv.workspaceName && (
                        <span className="text-[10px] text-muted-foreground">({inv.workspaceName})</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>Expires {expiresStr}</span>
                      <span>•</span>
                      <span>Access:</span>
                      <div className="flex items-center gap-1">
                        {inv.allowedPages.map((p) => (
                          <span
                            key={p}
                            className="text-[9px] font-mono px-1 rounded bg-muted text-foreground border border-border uppercase"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(inv.inviteUrl, inv.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      {copiedToken === inv.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Invite Link</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setInviteToCancel(inv)}
                      className="p-1.5 rounded-xl border border-border bg-card hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all cursor-pointer shadow-xs"
                      title="Cancel invitation link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: Invite Teammate / User Modal
         ───────────────────────────────────────────────────────────── */}
      <CustomModal
        isOpen={isInviteModalOpen}
        onClose={closeInviteModal}
        title={isPlatformAdmin ? "Add Platform User" : "Invite New Teammate"}
        description={
          isPlatformAdmin
            ? "Generate an invitation onboarding link for platform administrators, tenant owners, or staff."
            : "Generate an onboarding magic-link for your tenant staff. Only Staff post can be added."
        }
        confirmText={createdInviteUrl ? "Done" : "Generate Invitation Link"}
        cancelText="Close"
        onConfirm={() => {
          if (createdInviteUrl) {
            closeInviteModal();
          } else {
            const form = document.getElementById("invite-teammate-form") as HTMLFormElement;
            form?.requestSubmit();
          }
        }}
        isLoading={isSubmitting}
      >
        {createdInviteUrl ? (
          <div className="space-y-3.5 py-1">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold">Invitation Link Created!</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Share this link with <strong>{inviteEmail}</strong>. When opened, they will set their name, avatar, and
                  password to join.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Shareable Invite Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={createdInviteUrl}
                  readOnly
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs font-mono select-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => handleCopyLink(createdInviteUrl, "modal_copy")}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
                >
                  {copiedToken === "modal_copy" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedToken === "modal_copy" ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form id="invite-teammate-form" onSubmit={handleSendInvite} className="space-y-3.5 py-1">
            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>User Work Email</span>
                <span className="text-[10px] text-primary">* Required</span>
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@domain.com"
                required
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs font-mono focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs"
              />
            </div>

            {/* Name (Optional) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Full Name</span>
                <span className="text-[10px] text-muted-foreground">Optional</span>
              </label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs"
              />
            </div>

            {/* Role: Selectable for Platform Admin, Locked to Staff for Tenant Admin */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Assigned Role</span>
                <span className="text-[10px] text-muted-foreground">
                  {isPlatformAdmin ? "Platform Level" : "Fixed for Tenant"}
                </span>
              </label>
              {isPlatformAdmin ? (
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs font-medium focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs cursor-pointer"
                >
                  {isDeveloper && <option value="DEVELOPER">Developer (Root Architect)</option>}
                  <option value="SUPER_ADMIN">Super Admin (Platform Controller)</option>
                  <option value="SUPER_ADMIN_STAFF">Super Admin Staff (Delegated)</option>
                  <option value="TENANT_ADMIN">Tenant Admin (Business Owner)</option>
                  <option value="ADMIN_STAFF">Staff (Teammate)</option>
                  <option value="CREATOR">Content Creator (Solo Studio)</option>
                </select>
              ) : (
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span className="font-bold text-foreground">Staff (Team Mate)</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">2-Role Policy Enforced</span>
                </div>
              )}
            </div>

            {/* Granular Page Access Checkboxes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Grant Page Access Permissions
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {AVAILABLE_PAGES.map((page) => {
                  const isChecked = inviteAllowedPages.includes(page.id);
                  const Icon = page.icon;
                  return (
                    <label
                      key={page.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 cursor-pointer transition-all ${
                        isChecked
                          ? "bg-primary/10 border-primary/40 text-foreground"
                          : "bg-card border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setInviteAllowedPages((prev) =>
                            isChecked ? prev.filter((p) => p !== page.id) : [...prev, page.id]
                          );
                        }}
                        className="rounded border-border text-primary focus:ring-primary mt-0.5"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-xs flex items-center gap-1.5 text-foreground">
                          <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{page.label}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{page.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </form>
        )}
      </CustomModal>

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: Edit Teammate Page Permissions Modal
         ───────────────────────────────────────────────────────────── */}
      <CustomModal
        isOpen={!!memberToEdit}
        onClose={() => setMemberToEdit(null)}
        title={`Edit User: ${memberToEdit?.name}`}
        description="Update role assignment and authorized pages."
        confirmText="Save Changes"
        cancelText="Cancel"
        onConfirm={handleSaveEdit}
        isLoading={isSavingEdit}
      >
        <div className="space-y-3.5 py-1">
          {/* Role selector for platform admin */}
          {isPlatformAdmin && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Assigned Role</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs font-medium focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs cursor-pointer"
              >
                {isDeveloper && <option value="DEVELOPER">Developer</option>}
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="SUPER_ADMIN_STAFF">Super Admin Staff</option>
                <option value="TENANT_ADMIN">Tenant Admin</option>
                <option value="ADMIN_STAFF">Staff (Teammate)</option>
                <option value="CREATOR">Content Creator</option>
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Authorized Pages:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
              {AVAILABLE_PAGES.map((page) => {
                const isChecked = editAllowedPages.includes(page.id);
                const Icon = page.icon;
                return (
                  <label
                    key={page.id}
                    className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 cursor-pointer transition-all ${
                      isChecked
                        ? "bg-primary/10 border-primary/40 text-foreground"
                        : "bg-card border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setEditAllowedPages((prev) =>
                          isChecked ? prev.filter((p) => p !== page.id) : [...prev, page.id]
                        );
                      }}
                      className="rounded border-border text-primary focus:ring-primary mt-0.5"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-xs flex items-center gap-1.5 text-foreground">
                        <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{page.label}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{page.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </CustomModal>

      {/* ─────────────────────────────────────────────────────────────
          MODAL 3: Delete / Revoke User Modal (Proper Delete Alert)
         ───────────────────────────────────────────────────────────── */}
      <CustomModal
        isOpen={!!memberToDelete}
        onClose={() => {
          setMemberToDelete(null);
          setConfirmAcknowledge(false);
        }}
        title={deleteMode === "PERMANENT" ? "Permanently Delete User Account?" : "Revoke Workspace Access?"}
        description={
          deleteMode === "PERMANENT"
            ? "Purge this user record completely from the platform database so their email can be re-registered."
            : "Remove this user from the current workspace while keeping their underlying platform account."
        }
        confirmText={deleteMode === "PERMANENT" ? "Permanently Delete User" : "Revoke from Workspace"}
        cancelText="Keep User"
        isDestructive={true}
        isLoading={isRevoking}
        onConfirm={() => {
          if (deleteMode === "PERMANENT" && !confirmAcknowledge) {
            toast.warning("Confirmation Required", "Please check the confirmation box to authorize permanent deletion.");
            return;
          }
          handleConfirmDeleteMember();
        }}
      >
        <div className="space-y-3.5 py-1 text-xs">
          {/* User Summary Card */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00F0FF]/20 to-blue-600/20 border border-[#00F0FF]/30 flex items-center justify-center font-bold text-xs text-primary overflow-hidden shrink-0 shadow-2xs">
              <img
                src={memberToDelete?.avatarUrl || "/avatars/default-avatar.svg"}
                alt={memberToDelete?.name || "User"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-foreground text-xs truncate">{memberToDelete?.name}</p>
              <p className="text-[11px] font-mono text-muted-foreground truncate">{memberToDelete?.email}</p>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted border border-border uppercase">
              {memberToDelete?.role?.replace("_", " ")}
            </span>
          </div>

          {/* Deletion Mode Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Select Deletion Type:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteMode("PERMANENT");
                  setConfirmAcknowledge(false);
                }}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  deleteMode === "PERMANENT"
                    ? "border-rose-500/50 bg-rose-500/10 ring-1 ring-rose-500/30"
                    : "border-border bg-card hover:bg-muted text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Permanent Purge</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Erases user from database; frees email for other tenants.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDeleteMode("REVOKE");
                  setConfirmAcknowledge(true);
                }}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  deleteMode === "REVOKE"
                    ? "border-amber-500/50 bg-amber-500/10 ring-1 ring-amber-500/30"
                    : "border-border bg-card hover:bg-muted text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                  <X className="w-3.5 h-3.5" />
                  <span>Revoke Access Only</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Removes workspace seat; retains platform account.
                </p>
              </button>
            </div>
          </div>

          {/* Proper Delete Alert Banner */}
          {deleteMode === "PERMANENT" ? (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Permanent Database Account Deletion</span>
              </div>
              <p className="text-[11px] leading-relaxed text-foreground/90">
                This will permanently delete <strong>{memberToDelete?.email}</strong>, their password hash, login
                credentials, and all memberships. The email address will be released immediately so you can invite
                them as staff in another tenant.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 space-y-1 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Workspace Access Revocation</span>
              </div>
              <p className="text-[11px] leading-relaxed text-foreground/90">
                This removes <strong>{memberToDelete?.name}</strong> from this specific workspace. Their underlying
                platform login and other tenant memberships will remain active.
              </p>
            </div>
          )}

          {/* Confirmation Checkbox for Permanent Purge */}
          {deleteMode === "PERMANENT" && (
            <label className="flex items-start gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmAcknowledge}
                onChange={(e) => setConfirmAcknowledge(e.target.checked)}
                className="rounded border-border text-rose-500 focus:ring-rose-500 mt-0.5"
              />
              <span className="text-[11px] text-muted-foreground select-none">
                I understand this permanently deletes this user account and credentials from the system.
              </span>
            </label>
          )}
        </div>
      </CustomModal>

      {/* ─────────────────────────────────────────────────────────────
          MODAL 4: Cancel Pending Invitation Modal
         ───────────────────────────────────────────────────────────── */}
      <CustomModal
        isOpen={!!inviteToCancel}
        onClose={() => setInviteToCancel(null)}
        title="Cancel Invitation?"
        description="The magic link will be invalidated immediately. Anyone opening it will not be able to join."
        confirmText="Cancel Invitation"
        cancelText="Keep Invite"
        isDestructive={true}
        isLoading={isRevoking}
        onConfirm={handleConfirmCancelInvite}
      >
        <p className="text-xs text-muted-foreground">
          Target: <strong>{inviteToCancel?.email}</strong>.
        </p>
      </CustomModal>
    </div>
  );
}
