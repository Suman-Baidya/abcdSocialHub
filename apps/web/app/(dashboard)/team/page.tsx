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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <PageBreadcrumb
        pageTitle="Team & Permissions"
        description="Invite marketing designers, branch managers, and front-desk staff with strict role-based access control."
      >
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00F0FF] hover:bg-[#00D4E0] text-[#0A0D14] text-xs sm:text-sm font-semibold transition-all shadow-md shadow-[#00F0FF]/20 active:scale-95 cursor-pointer"
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
      <div className="rounded-2xl bg-[#111722]/80 border border-white/[0.06] backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 border-b border-white/[0.06] text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Member Name</th>
                <th className="px-5 py-3.5">Email Address</th>
                <th className="px-5 py-3.5">Assigned Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Joined</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-zinc-100 flex items-center gap-2">
                      <span>{member.name}</span>
                      {member.role === "OWNER" && (
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-zinc-300 font-mono text-[11px]">
                    {member.email}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${getRoleBadge(
                        member.role
                      )}`}
                    >
                      {member.role}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {member.status === "ACTIVE" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>Invited</span>
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-zinc-400 text-[11px]">
                    {member.joinedAt}
                  </td>

                  <td className="px-5 py-4 text-right">
                    {member.role !== "OWNER" && (
                      <button
                        onClick={() => setMemberToDelete(member)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 transition-colors"
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
        title="Invite New Collaborator"
        description="Send an authenticated invitation link to join your workspace."
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
        title="Revoke Member Access"
        description={`Are you sure you want to remove ${memberToDelete?.name} (${memberToDelete?.email}) from this workspace? They will immediately lose access.`}
        confirmText="Revoke Access"
        onConfirm={handleConfirmDelete}
        isDestructive
      />
    </div>
  );
}
