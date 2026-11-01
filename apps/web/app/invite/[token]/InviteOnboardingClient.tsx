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
  ShieldCheck,
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

export function InviteOnboardingClient({ token }: { token: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
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
          image: "/avatars/default-avatar.svg",
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-background text-foreground antialiased relative overflow-hidden">
      {/* Decorative Radial Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 dark:bg-primary/15 rounded-full blur-3xl pointer-events-none" />

      {/* Ultra-Premium Glassmorphism Card (All elements & brand inside the box) */}
      <div className="relative w-full max-w-md rounded-3xl bg-card/95 border border-border shadow-2xl p-5 sm:p-6 space-y-3.5 overflow-hidden backdrop-blur-xl">
        {/* Subtle Top Accent Beam */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

        {/* Brand Logo & Name Header (INSIDE THE BOX) */}
        <div className="space-y-1.5 text-center pt-1">
          <div className="relative mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
            <Sparkles className="w-6 h-6 text-primary" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center">
              <ShieldCheck className="w-2.5 h-2.5 text-white" />
            </div>
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground leading-tight">
              ABCD Social Hub
            </h1>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Autonomous Multi-Tenant Marketing & Publishing
            </p>
          </div>
        </div>

        {/* State 1: Loading Skeleton */}
        {loading && (
          <div className="py-8 text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            <p className="text-xs text-muted-foreground">Loading workspace invitation...</p>
          </div>
        )}

        {/* State 2: Invalid or Expired Invitation Error */}
        {!loading && error && (
          <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/5 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-foreground">Invitation Unavailable</h2>
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
          <div className="space-y-3">
            {/* Invitation Details Banner */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 uppercase tracking-wider">
                  Teammate Invitation
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Expires {new Date(inviteData.expiresAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                </span>
              </div>

              <div>
                <h2 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{inviteData.organizationName}</span>
                </h2>
                <p className="text-[10.5px] text-muted-foreground mt-0.5 leading-snug">
                  Invited by <strong>{inviteData.inviterName}</strong> as a <strong>Staff Teammate</strong>.
                </p>
              </div>

              {/* Granted Page Badges */}
              {inviteData.allowedPages && inviteData.allowedPages.length > 0 && (
                <div className="pt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9.5px] text-muted-foreground">Access:</span>
                  {inviteData.allowedPages.map((page) => (
                    <span
                      key={page}
                      className="text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-background border border-border text-foreground uppercase"
                    >
                      {page}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Error banner if submission failed */}
            {submitError && (
              <div className="p-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2.5">
              {/* Row 1: Email (Read-only anchor) */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                  <span>Assigned Work Email</span>
                  <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Verified</span>
                  </span>
                </label>
                <input
                  type="email"
                  value={inviteData.email}
                  disabled
                  className="w-full px-2.5 py-1.5 rounded-xl bg-muted/60 border border-border text-muted-foreground text-xs font-mono cursor-not-allowed opacity-90 shadow-2xs"
                />
              </div>

              {/* Row 2: Full Name & Phone Number (Side-by-side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                    <span>Full Name</span>
                    <span className="text-[9.5px] text-primary">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      required
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                    <span>Phone</span>
                    <span className="text-[9.5px] text-muted-foreground">Optional</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98300..."
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-background border border-border text-foreground text-xs font-mono focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Password & Confirm Password (Side-by-side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                    <span>Create Password</span>
                    <span className="text-[9.5px] text-muted-foreground">Min. 6</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat"
                      required
                      className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1.5 focus:ring-primary shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold transition-all active:scale-95 shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
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

            {/* Bottom Links & Trust Strip (Inside the box) */}
            <div className="pt-1 text-center space-y-2">
              <Link href="/login" className="text-[11px] text-muted-foreground hover:text-primary transition-colors block">
                Already have an account? Sign in
              </Link>

              <div className="pt-1 border-t border-border/50 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>ABCD Social Platform • Protected by Edge Auth</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
