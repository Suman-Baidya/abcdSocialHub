"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  Lock,
  Sparkles,
  ShieldCheck,
  Shield,
  ArrowRight,
  Loader2,
  AlertCircle,
  KeyRound,
} from "lucide-react";

interface AuthRestrictionModalProps {
  callbackUrl?: string;
  customMessage?: string;
}

export function AuthRestrictionModal({
  callbackUrl = "/dashboard",
  customMessage,
}: AuthRestrictionModalProps) {
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleQuickDemoLogin = async () => {
    try {
      setLoggingIn(true);
      setLoginError(null);
      const res = await signIn("credentials", {
        email: "suman.baidya.pro@gmail.com",
        password: "Password123!",
        redirect: false,
      });

      if (res?.ok) {
        window.location.reload();
      } else {
        setLoginError(res?.error || "Demo sign in failed. Please use standard login.");
      }
    } catch (err: any) {
      setLoginError(err.message || "Failed to initiate demo session.");
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-2xl transition-all duration-300">
      {/* Decorative Radial Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 dark:bg-primary/15 rounded-full blur-3xl pointer-events-none" />

      {/* Ultra-Premium Glassmorphism Restriction Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-card/95 border border-border shadow-2xl p-6 sm:p-8 text-center space-y-6 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
        {/* Subtle Top Accent Beam */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

        {/* Lock Emblem with Glowing Aura */}
        <div className="space-y-3">
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
            <Lock className="w-8 h-8 text-primary animate-pulse" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center">
              <ShieldCheck className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-[11px] font-bold text-primary uppercase tracking-wider shadow-xs">
            <KeyRound className="w-3 h-3" />
            <span>Enterprise Security Guard</span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              Authentication Required
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed max-w-sm mx-auto">
              {customMessage ||
                "Please sign in to access your ABCD Social workspace, live autopilot metrics, and AI campaign engine."}
            </p>
          </div>
        </div>

        {/* 3-Pillar Security Assurance Strip */}
        <div className="grid grid-cols-3 gap-2 py-3.5 border-y border-border/60 bg-muted/30 rounded-2xl text-[11px]">
          <div className="flex flex-col items-center text-center p-1">
            <Shield className="w-4 h-4 text-emerald-500 mb-1" />
            <span className="font-semibold text-foreground text-[11px]">Zero-Exposure</span>
            <span className="text-[10px] text-muted-foreground">Tenant Isolated</span>
          </div>
          <div className="flex flex-col items-center text-center p-1 border-x border-border/60">
            <Lock className="w-4 h-4 text-primary mb-1" />
            <span className="font-semibold text-foreground text-[11px]">AES-256-GCM</span>
            <span className="text-[10px] text-muted-foreground">Session Token</span>
          </div>
          <div className="flex flex-col items-center text-center p-1">
            <Sparkles className="w-4 h-4 text-amber-500 mb-1" />
            <span className="font-semibold text-foreground text-[11px]">4-Tier RBAC</span>
            <span className="text-[10px] text-muted-foreground">Role Hardened</span>
          </div>
        </div>

        {/* Error Feedback if quick demo sign-in fails */}
        {loginError && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2 text-left animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={loggingIn}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold text-sm transition-all shadow-lg shadow-primary/25 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {loggingIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Session...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>1-Click Founder Demo Sign In</span>
              </>
            )}
          </button>

          <Link
            href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-muted/60 hover:bg-muted border border-border text-xs font-semibold text-foreground transition-all shadow-xs cursor-pointer"
          >
            <span>Go to Standard Login Page</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
          </Link>
        </div>

        {/* Footer Trust Indicator */}
        <div className="pt-1 text-[10px] text-muted-foreground font-mono flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>ABCD Social Platform • Protected by Edge Auth</span>
        </div>
      </div>
    </div>
  );
}
