"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  User,
  Shield,
  KeyRound,
  Building2,
  Phone,
  Mail,
  Camera,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  Upload,
  Trash2,
  Sparkles,
  ExternalLink,
  Lock,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";
import { StatCard, LoadingSkeleton, ErrorState } from "@/components/common";
import { useToast } from "@/components/ui/ToastProvider";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string | null;
  role: string;
  organizationName: string;
  workspaceName: string;
  hasPassword: boolean;
  createdAt: string;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
];

export default function UserProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Forgot password state
  const [resettingPassword, setResettingPassword] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  // Active section tab
  const [activeTab, setActiveTab] = useState<"general" | "security" | "workspace">("general");

  // Fetch profile details
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/user/profile");
      if (!res.ok) {
        throw new Error(`Failed to load profile (HTTP ${res.status})`);
      }
      const data = await res.json();
      setProfile(data.user);
      setName(data.user.name || "");
      setPhone(data.user.phone || "");
      setImage(data.user.image || null);
    } catch (err: any) {
      setError(err.message || "Could not retrieve user profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Handle image upload from computer
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid File", "Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File Too Large", "Profile picture must be under 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      toast.success("Image Selected", "Preview updated. Click 'Save Changes' to apply.");
    };
    reader.readAsDataURL(file);
  };

  // Save profile changes (Name, Phone, Image)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Validation Error", "Full name cannot be blank.");
      return;
    }

    try {
      setSavingProfile(true);
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
          image: image || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfile((prev) => (prev ? { ...prev, name: data.user.name, phone: data.user.phone, image: data.user.image } : null));

      // Synchronize changes to active NextAuth session immediately across layout
      await updateSession({
        name: data.user.name,
        phone: data.user.phone,
        image: data.user.image,
      });

      toast.success("Profile Updated", "Your personal details and avatar have been saved.");
    } catch (err: any) {
      toast.error("Update Failed", err.message || "Failed to save profile changes.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (profile?.hasPassword && !currentPassword) {
      toast.error("Validation Error", "Please enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Validation Error", "New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Validation Error", "New password and confirmation do not match.");
      return;
    }

    try {
      setSavingPassword(true);
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPassword || undefined,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      if (profile) setProfile({ ...profile, hasPassword: true });

      toast.success("Password Updated", "Your account password has been changed securely.");
    } catch (err: any) {
      toast.error("Password Change Failed", err.message || "Could not update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  // Request password reset / forgot password
  const handleForgotPassword = async () => {
    try {
      setResettingPassword(true);
      const res = await fetch("/api/user/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile?.email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate reset link");
      }

      if (data.resetUrl) {
        setDevResetUrl(data.resetUrl);
      }

      toast.success(
        "Reset Link Created",
        "Password reset instructions have been generated for your account."
      );
    } catch (err: any) {
      toast.error("Reset Failed", err.message || "Could not initiate password reset.");
    } finally {
      setResettingPassword(false);
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "DEVELOPER":
      case "SUPER_ADMIN":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "TENANT_ADMIN":
      case "OWNER":
        return "bg-primary/10 text-primary border-primary/30";
      case "CREATOR":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "ADMIN_STAFF":
      case "STAFF":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* ─────────────────────────────────────────────────────────────
          1. Canonical Page Breadcrumb (Title strictly 2-3 words, Desc 7-8 words)
         ───────────────────────────────────────────────────────────── */}
      <PageBreadcrumb
        pageTitle="My Profile"
        description="Account identity, security credentials, workspace access."
        hideBreadcrumb={true}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchProfile}
            disabled={loading}
            className="p-2 rounded-xl bg-card hover:bg-muted border border-border text-foreground transition-all active:scale-95 cursor-pointer shadow-xs"
            title="Refresh Profile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </PageBreadcrumb>

      {/* ─────────────────────────────────────────────────────────────
          2. Top 4 Standard StatCards
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-3.5">
        <StatCard
          title="Security Health"
          value={profile?.hasPassword ? "Strong" : "Standard"}
          subtitle={profile?.hasPassword ? "Password & Auth Active" : "Google SSO Account"}
          icon={Shield}
          variant="emerald"
        />
        <StatCard
          title="Assigned Role"
          value={profile ? profile.role.replace("_", " ") : "Member"}
          subtitle="Workspace Authority"
          icon={User}
          variant="primary"
        />
        <StatCard
          title="Active Workspace"
          value={profile?.workspaceName || "Primary Brand"}
          subtitle={profile?.organizationName || "Organization"}
          icon={Building2}
          variant="sky"
        />
        <StatCard
          title="Account Status"
          value="Verified"
          subtitle={
            profile?.createdAt
              ? `Member since ${new Date(profile.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })}`
              : "Active Now"
          }
          icon={CheckCircle2}
          variant="amber"
        />
      </div>

      {loading ? (
        <LoadingSkeleton type="cards" count={3} />
      ) : error ? (
        <ErrorState
          title="Unable to load profile"
          message={error}
          onRetry={fetchProfile}
        />
      ) : profile ? (
        <div className="space-y-4">
          {/* ─────────────────────────────────────────────────────────────
              3. Hero User Identity Card with Live Avatar
             ───────────────────────────────────────────────────────────── */}
          <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 text-center sm:text-left">
              {/* Avatar with Upload Trigger */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-tr from-[#00F0FF]/20 to-blue-600/20 border-2 border-[#00F0FF]/30 flex items-center justify-center font-bold text-2xl text-primary overflow-hidden shadow-sm">
                  {image ? (
                    <img
                      src={image}
                      alt={name || profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{name ? name[0].toUpperCase() : "U"}</span>
                  )}
                </div>

                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-primary text-primary-foreground shadow-md cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                  title="Upload New Profile Picture"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Identity Details */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    {name || profile.name}
                  </h2>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getRoleBadgeStyle(
                      profile.role
                    )}`}
                  >
                    {profile.role.replace("_", " ")}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground flex items-center gap-1.5 justify-center sm:justify-start">
                  <Mail className="w-3 h-3 text-muted-foreground" />
                  <span>{profile.email}</span>
                </p>

                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 justify-center sm:justify-start">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span>
                    Enrolled{" "}
                    {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-center">
              <label
                htmlFor="avatar-upload"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Upload className="w-3.5 h-3.5 text-primary" />
                <span>Upload Photo</span>
              </label>

              {image && (
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    toast.info("Avatar Removed", "Click 'Save Changes' to revert to initials.");
                  }}
                  className="p-1.5 rounded-xl border border-border bg-card hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Remove Profile Picture"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              4. Navigation Tabs (Personal Info, Password & Security, Workspace)
             ───────────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-nowrap">
            {[
              { id: "general", label: "1. Personal Information", icon: User },
              { id: "security", label: "2. Password & Security", icon: KeyRound },
              { id: "workspace", label: "3. Workspace Authority", icon: Building2 },
            ].map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                    active
                      ? "bg-primary/10 text-primary border border-primary/25 shadow-xs"
                      : "bg-card text-muted-foreground hover:text-foreground border border-border hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              TAB 1: Personal Information & Avatar Picker
             ───────────────────────────────────────────────────────────── */}
          {activeTab === "general" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Editable Profile Form */}
              <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
                <div className="pb-2 border-b border-border">
                  <h3 className="text-sm font-bold text-foreground">Edit Account Details</h3>
                  <p className="text-xs text-muted-foreground">
                    Update your full name, phone number, and personal identity.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-3.5">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Full Name</span>
                      <span className="text-[10px] text-primary font-mono">* Required</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Contact Phone</span>
                      <span className="text-[10px] text-muted-foreground">WhatsApp enabled</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98300 12345"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Email Address (Read-only / Identity anchor) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Email Address</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Primary SSO Identity</span>
                      </span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-muted/50 border border-border text-muted-foreground text-xs sm:text-sm cursor-not-allowed font-mono opacity-80"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold transition-all active:scale-95 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{savingProfile ? "Saving Profile..." : "Save Profile Changes"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Preset Avatar Picker */}
              <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
                <div className="pb-2 border-b border-border">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>Choose a Preset Avatar</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Select a curated avatar or upload your custom profile photo.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {PRESET_AVATARS.map((avatarUrl, index) => {
                    const isSelected = image === avatarUrl;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setImage(avatarUrl);
                          toast.success("Avatar Selected", "Click 'Save Profile Changes' to confirm.");
                        }}
                        className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer group hover:scale-105 active:scale-95 ${
                          isSelected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={avatarUrl}
                          alt={`Preset Avatar ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center">
                            <Check className="w-5 h-5 text-primary stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Your profile picture will be synchronized with the sidebar bottom user card and top header pill across all workspaces.
                </p>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 2: Password & Security Credentials
             ───────────────────────────────────────────────────────────── */}
          {activeTab === "security" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Change Password */}
              <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
                <div className="pb-2 border-b border-border">
                  <h3 className="text-sm font-bold text-foreground">Change Password</h3>
                  <p className="text-xs text-muted-foreground">
                    {profile.hasPassword
                      ? "Enter your current password followed by your new password."
                      : "You signed in via Google SSO. Set a direct password below to enable credential login."}
                  </p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-3.5">
                  {/* Current Password (only required if hasPassword is true) */}
                  {profile.hasPassword && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Current Password
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                        <input
                          type={showCurrentPass ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-9 pr-9 py-2 rounded-xl bg-background border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>New Password</span>
                      <span className="text-[10px] text-muted-foreground">Minimum 8 characters</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                      <input
                        type={showNewPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-9 py-2 rounded-xl bg-background border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-9 py-2 rounded-xl bg-background border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingPassword}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold transition-all active:scale-95 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{savingPassword ? "Updating Password..." : "Update Password"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Forgot Password & Reset Trigger */}
              <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="pb-2 border-b border-border">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      <span>Forgot Password / Reset Link</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Dispatch a secure, time-expiring cryptographic reset token to your account email.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground space-y-1.5">
                    <p className="font-semibold text-foreground">Need to reset your credentials?</p>
                    <p>
                      Click the button below to generate a single-use 1-hour password reset token for{" "}
                      <strong className="text-foreground">{profile.email}</strong>.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resettingPassword}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-all active:scale-95 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                    <span>{resettingPassword ? "Generating Token..." : "Generate Password Reset Link"}</span>
                  </button>

                  {/* Dev Reset Link Preview if in local test environment */}
                  {devResetUrl && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1.5 animate-in fade-in">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                        Reset Link Generated (Local Dev Mode):
                      </span>
                      <a
                        href={devResetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-mono text-primary underline break-all block"
                      >
                        {devResetUrl}
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-border text-[11px] text-muted-foreground flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Passwords are hashed with bcrypt (salt 12) before storage.</span>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 3: Workspace Authority & Membership
             ───────────────────────────────────────────────────────────── */}
          {activeTab === "workspace" && (
            <div className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
              <div className="pb-2 border-b border-border">
                <h3 className="text-sm font-bold text-foreground">Workspace Authority & Access</h3>
                <p className="text-xs text-muted-foreground">
                  Your tenant organization, assigned role suite, and permission boundaries.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Organization
                  </span>
                  <div className="text-sm font-bold text-foreground">{profile.organizationName}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Current Workspace
                  </span>
                  <div className="text-sm font-bold text-foreground">{profile.workspaceName}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Role Authority
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border uppercase ${getRoleBadgeStyle(
                        profile.role
                      )}`}
                    >
                      {profile.role.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/20 border border-border flex items-center justify-between gap-3 flex-wrap">
                <div className="text-xs text-muted-foreground">
                  Manage team seats, assign roles, or review cryptographic access permissions for your workspace.
                </div>
                <Link
                  href="/team"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold transition-all active:scale-95 shadow-xs"
                >
                  <span>Open Team & Roles</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
