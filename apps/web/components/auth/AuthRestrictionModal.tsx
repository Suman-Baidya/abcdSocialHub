"use client";

import Link from "next/link";
import {
  Lock,
  Sparkles,
  ShieldCheck,
  Shield,
  ArrowRight,
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-2xl transition-all duration-300">
      {/* Decorative Radial Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 dark:bg-primary/15 rounded-full blur-3xl pointer-events-none" />

      {/* Ultra-Premium Glassmorphism Restriction Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-card/95 border border-border shadow-2xl p-6 sm:p-7 text-center space-y-5 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
        {/* Subtle Top Accent Beam */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

        {/* Lock Emblem with Glowing Aura */}
        <div className="space-y-3">
          <div className="relative mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
            <Lock className="w-7 h-7 text-primary" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center">
              <ShieldCheck className="w-2.5 h-2.5 text-white" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-[11px] font-bold text-primary uppercase tracking-wider shadow-xs">
            <KeyRound className="w-3 h-3" />
            <span>Workspace Access</span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              Sign In to Continue
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-sm mx-auto">
              {customMessage ||
                "Please sign in to access your ABCD Social workspace and dashboard."}
            </p>
          </div>
        </div>

        {/* 3-Pillar Workspace Assurance Strip */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/60 bg-muted/30 rounded-2xl text-[11px]">
          <div className="flex flex-col items-center text-center p-1">
            <Shield className="w-3.5 h-3.5 text-emerald-500 mb-1" />
            <span className="font-semibold text-foreground text-[11px]">Private Data</span>
            <span className="text-[10px] text-muted-foreground">Tenant Isolated</span>
          </div>
          <div className="flex flex-col items-center text-center p-1 border-x border-border/60">
            <Lock className="w-3.5 h-3.5 text-primary mb-1" />
            <span className="font-semibold text-foreground text-[11px]">Secure Login</span>
            <span className="text-[10px] text-muted-foreground">Encrypted Token</span>
          </div>
          <div className="flex flex-col items-center text-center p-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 mb-1" />
            <span className="font-semibold text-foreground text-[11px]">Team Control</span>
            <span className="text-[10px] text-muted-foreground">Role Protected</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm transition-all shadow-lg shadow-primary/20 active:scale-[0.98] cursor-pointer"
          >
            <span>Sign In to Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Footer Trust Indicator */}
        <div className="pt-0.5 text-[10px] text-muted-foreground font-mono flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>ABCD Social Platform • Secure Session</span>
        </div>
      </div>
    </div>
  );
}

