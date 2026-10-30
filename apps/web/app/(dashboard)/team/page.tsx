"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useToast, CustomModal, CustomAlert } from "@/components/ui/ToastProvider";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "CREATOR" | "STAFF" | "GUEST";
  status: "ACTIVE" | "INVITED";
  joinedAt: string;
}

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: "mem_1",
    name: "Suman Baidya",
    email: "suman.baidya.pro@gmail.com",
    role: "OWNER",
    status: "ACTIVE",
    joinedAt: "Founding Member",
  },
  {
    id: "mem_2",
    name: "Priya Sharma",
    email: "priya.creative@gmail.com",
    role: "CREATOR",
    status: "ACTIVE",
    joinedAt: "24 Oct 2026",
  },
  {
    id: "mem_3",
    name: "Amitav Ghosh",
    email: "amitav.frontdesk@salonderoyal.in",
    role: "STAFF",
    status: "INVITED",
    joinedAt: "Pending acceptance",
  },
];

export default function TeamMembersPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>(DEFAULT_MEMBERS);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  // Invite Form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamMember["role"]>("CREATOR");

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) {
      toast.warning("Validation Error", "Please provide a valid email address.");
      return;
    }

    const newMember: TeamMember = {
      id: `mem_${Date.now()}`,
      name: inviteName || inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      status: "INVITED",
      joinedAt: "Just invited",
    };

    setMembers([...members, newMember]);
    setIsInviteModalOpen(false);
    setInviteEmail("");
    setInviteName("");
    setInviteRole("CREATOR");

    toast.success(
      "Invitation Dispatched!",
      `Magic-link onboarding invitation sent to ${inviteEmail}.`
    );
  };

  const handleConfirmDelete = () => {
    if (!memberToDelete) return;
    setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
    toast.info("Member Removed", `${memberToDelete.name} has been revoked from workspace.`);
    setMemberToDelete(null);
  };

  const getRoleBadge = (role: TeamMember["role"]) => {
    switch (role) {
      case "OWNER":
        return "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30";
      case "CREATOR":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "STAFF":
        return "bg-sky-500/10 text-sky-400 border-sky-500/30";
      case "GUEST":
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      <PageBreadcrumb
        pageTitle="Team & Roles"
        description="Manage organization members and role-based access permissions."
        hideBreadcrumb={true}
      >
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </PageBreadcrumb>

      {/* Role Permission Guidance Banner */}
      <CustomAlert
        type="info"
        title="Role-Based Security Policy"
      >
        <span>
          <strong>Owners</strong> control billing, subscription, and social tokens.{" "}
          <strong>Creators</strong> generate promotional posters and draft copy.{" "}
          <strong>Staff</strong> manage inbound customer inquiries and scheduling. Staff members are strictly barred from billing endpoints.
        </span>
      </CustomAlert>

      {/* Members Table */}
      <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="px-5 py-3">Member Name</th>
                <th className="px-5 py-3">Email Address</th>
                <th className="px-5 py-3">Assigned Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      <span>{member.name}</span>
                      {member.role === "OWNER" && (
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-muted-foreground font-mono text-[11px]">
                    {member.email}
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${getRoleBadge(
                        member.role
                      )}`}
                    >
                      {member.role}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    {member.status === "ACTIVE" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>Invited</span>
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-3.5 text-muted-foreground text-[11px]">
                    {member.joinedAt}
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    {member.role !== "OWNER" && (
                      <button
                        onClick={() => setMemberToDelete(member)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                        title="Remove Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Popup Modal */}
      <CustomModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Member"
        description="Send authenticated invitation link to join workspace."
      >
        <form onSubmit={handleSendInvite} className="space-y-3.5 mt-2">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Rahul Sen"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs text-zinc-100 focus:outline-none focus:border-[#00F0FF]/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="colleague@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs text-zinc-100 focus:outline-none focus:border-[#00F0FF]/50 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Role & Permissions</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs text-zinc-100 focus:outline-none focus:border-[#00F0FF]/50"
            >
              <option value="CREATOR">CREATOR — Can design posters & draft copy</option>
              <option value="STAFF">STAFF — Can manage leads & view schedule</option>
              <option value="GUEST">GUEST — Read-only observation</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#00F0FF] hover:bg-[#00D4E0] text-[#0A0D14] font-semibold text-xs transition-all shadow-md active:scale-95"
            >
              Dispatch Invitation
            </button>
          </div>
        </form>
      </CustomModal>

      {/* Delete Confirmation Popup Modal */}
      <CustomModal
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        title="Revoke Access"
        description={`Remove ${memberToDelete?.name || "member"} from this team workspace?`}
        confirmText="Revoke"
        onConfirm={handleConfirmDelete}
        isDestructive
      />
    </div>
  );
}
