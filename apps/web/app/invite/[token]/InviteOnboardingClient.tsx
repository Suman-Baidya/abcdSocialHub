"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Building2,
  Check,
  Loader2,
} from "lucide-react";

interface InviteData {
  valid: boolean;
  email: string;
  name?: string;
  role: string;
  allowedPages: string[];
  organizationName: string;
  inviterName: string;
  expiresAt: string;
  error?: string;
}

const PRESET_AVATARS = [
  { id: "univ_default", label: "Universal", url: "/avatars/default-avatar.svg" },
  { id: "male_1", label: "Exec Suit", url: "/avatars/male-exec-1.svg" },
  { id: "female_1", label: "Exec Blazer", url: "/avatars/female-exec-1.svg" },
  { id: "male_2", label: "Architect", url: "/avatars/male-tech-2.svg" },
  { id: "female_2", label: "Leader", url: "/avatars/female-leader-2.svg" },
  { id: "robot_1", label: "AI Copilot", url: "/avatars/ai-copilot-1.svg" },
  { id: "robot_2", label: "Quantum", url: "/avatars/ai-quantum-2.svg" },
  { id: "robot_3", label: "Sentinel", url: "/avatars/ai-sentinel-3.svg" },
];

export function InviteOnboardingClient({ token }: { token: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("/avatars/default-avatar.svg");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch invitation validity
  useEffect(() => {
    async function validateToken() {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/team/invite/${token}`);
        const data = await res.json();

        if (!res.ok || !data.valid) {
          setError(data.error || "This invitation link is invalid or has expired.");
          return;
        }

        setInviteData(data);
        if (data.name) setFullName(data.name);
      } catch (err: any) {
        setError(err.message || "Failed to load invitation.");
      } finally {
        setLoading(false);
      }
    }

    validateToken();
  }, [token]);

  // Handle Onboarding Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!fullName.trim()) {
      setSubmitError("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setSubmitError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/team/invite/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          phone: phone.trim() || undefined,
          image: selectedAvatar,
          password,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to complete onboarding.");
      }

      // Automatically sign in the new teammate
      const loginRes = await signIn("credentials", {
        email: inviteData?.email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (loginRes?.error) {
        router.push(`/login?email=${encodeURIComponent(inviteData?.email || "")}&accepted=1`);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background text-foreground antialiased relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-4">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center text-center space-y-1.5">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-xs">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">ABCD Social Hub</h1>
          <p className="text-xs text-muted-foreground">Autonomous Multi-Tenant Marketing & Publishing</p>
        </div>

        {/* State 1: Loading Skeleton */}
        {loading && (
          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            <p className="text-xs text-muted-foreground">Validating your workspace invitation...</p>
          </div>
        )}

        {/* State 2: Invalid or Expired Invitation Error */}
        {!loading && error && (
          <div className="p-6 rounded-2xl border border-destructive/30 bg-card shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-foreground">Invitation Unavailable</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">{error}</p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-xs"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* State 3: Valid Invitation Form */}
        {!loading && !error && inviteData && (
          <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4.5">
            {/* Invitation Details Banner */}
            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 uppercase tracking-wider">
                  Teammate Invitation
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Expires {new Date(inviteData.expiresAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                </span>
              </div>

              <div>
                <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-primary shrink-0" />
                  <span>{inviteData.organizationName}</span>
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Invited by <strong>{inviteData.inviterName}</strong> as a <strong>Staff Teammate</strong>.
                </p>
              </div>

              {/* Granted Page Badges */}
              {inviteData.allowedPages && inviteData.allowedPages.length > 0 && (
                <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground">Access:</span>
                  {inviteData.allowedPages.map((page) => (
                    <span
                      key={page}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-background border border-border text-foreground uppercase"
                    >
                      {page}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Error banner if submission failed */}
            {submitError && (
              <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Email (Read-only anchor) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Assigned Work Email</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                </label>
                <input
                  type="email"
                  value={inviteData.email}
                  disabled
                  className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-muted-foreground text-xs font-mono cursor-not-allowed opacity-90 shadow-2xs"
                />
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Full Name</span>
                  <span className="text-[10px] text-primary">* Required</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs"
                  />
                </div>
              </div>

              {/* Contact Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Phone Number</span>
                  <span className="text-[10px] text-muted-foreground">Optional</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98300 12345"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs font-mono focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs"
                  />
                </div>
              </div>

              {/* Visual Avatar Picker (8 Executive Vectors) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Select Profile Avatar</span>
                  <span className="text-[10px] text-muted-foreground">8 Presets</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AVATARS.map((av) => {
                    const isSelected = selectedAvatar === av.url;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setSelectedAvatar(av.url)}
                        className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer group hover:scale-105 active:scale-95 bg-muted/20 ${
                          isSelected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
                        }`}
                        title={av.label}
                      >
                        <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/25 backdrop-blur-[1px] flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary stroke-[3]" />
                          </div>
                        )}
                        <span className="absolute bottom-0 inset-x-0 bg-black/65 backdrop-blur-[1px] text-white text-[8px] font-semibold py-0.5 text-center truncate px-0.5">
                          {av.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Create Password</span>
                  <span className="text-[10px] text-muted-foreground">Min. 6 characters</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    className="w-full pl-9 pr-9 py-2 rounded-xl bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    required
                    className="w-full pl-9 pr-9 py-2 rounded-xl bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold transition-all active:scale-95 shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Activating Teammate Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Setup & Join Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="text-center pt-1">
              <Link href="/login" className="text-[11px] text-muted-foreground hover:text-primary transition-colors">
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
