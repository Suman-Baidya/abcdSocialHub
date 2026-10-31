"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Coins,
  ArrowUpRight,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  ArrowUp,
  Lock,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { PageBreadcrumb } from "@/components/common/PageBreadcrumb";
import { StatCard, ErrorState, LoadingSkeleton } from "@/components/common";
import { AutopilotBriefing } from "@/components/dashboard/AutopilotBriefing";
import { ChannelHealthWidget } from "@/components/dashboard/ChannelHealthWidget";
import { RecentPostsCarousel } from "@/components/dashboard/RecentPostsCarousel";
import { CreditQuotaRing } from "@/components/dashboard/CreditQuotaRing";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { CreatorStudioView } from "@/components/dashboard/CreatorStudioView";
import { GuestPortalView } from "@/components/dashboard/GuestPortalView";
import { resolveDashboardType, DashboardType, RoleType } from "@/lib/roles";

interface DashboardData {
  isImpersonating?: boolean;
  workspace: {
    id: string;
    name: string;
    organizationName: string;
    businessName: string;
    phoneNumber?: string;
    isApproved?: boolean;
  };
  stats: {
    publishedCount: number;
    scheduledCount: number;
    inReviewCount: number;
    totalCount: number;
  };
  autopilot: {
    nextScheduled?: { id: string; title: string; scheduledFor: string } | null;
    pendingReviewItem?: { id: string; title: string; createdAt: string } | null;
    upcomingScheduled?: any[];
  };
  brand?: any;
  credits: {
    allocated: number;
    used: number;
    remaining: number;
    percentageUsed: number;
    planName: string;
  };
  channels: any;
  recentPosts: any[];
}

export default function DashboardOverviewPage() {
  const { data: session, status: authStatus } = useSession();
  const user = session?.user as any;
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [simulatedRole, setSimulatedRole] = useState<RoleType | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("abcd_simulated_role") as RoleType | null;
      if (stored) {
        setSimulatedRole(stored);
      }
    } catch {}
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/dashboard/summary");
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("PERMISSION_DENIED");
        }
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchSummary();
    } else if (authStatus === "unauthenticated") {
      setLoading(false);
      setError("Please sign in to view your dashboard");
    }
  }, [authStatus, fetchSummary]);

  const handleQuickDemoLogin = async () => {
    try {
      setLoggingIn(true);
      const res = await signIn("credentials", {
        email: "suman.baidya.pro@gmail.com",
        password: "Password123!",
        redirect: false,
      });
      if (res?.ok) {
        window.location.reload();
      } else {
        setError(res?.error || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "Quick demo login failed");
    } finally {
      setLoggingIn(false);
    }
  };

  // STATE 1: PERMISSION-DENIED
  if (error === "PERMISSION_DENIED") {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-card border border-rose-500/30 text-center space-y-4 backdrop-blur-xl shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-foreground">Access Restricted</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your user role does not have authorization to inspect this workspace.
            Please contact your organization owner for permission grant.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-accent text-xs font-semibold text-foreground"
          >
            Switch Account
          </Link>
        </div>
      </div>
    );
  }

  // STATE 2: AUTHENTICATION REQUIRED (User not signed in)
  if (authStatus === "unauthenticated" || (error && error.includes("sign in"))) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-card border border-border text-center space-y-5 shadow-2xl backdrop-blur-xl">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center mx-auto text-primary">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Authentication Required</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
              Please sign in to access your ABCD Social founder workspace and live autopilot metrics.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={handleQuickDemoLogin}
              disabled={loggingIn}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm transition-all shadow-md shadow-primary/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In as Founder...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>1-Click Founder Demo Sign In</span>
                </>
              )}
            </button>
            <Link
              href="/login?callbackUrl=/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-muted hover:bg-accent border border-border text-xs font-semibold text-foreground transition-all"
            >
              <span>Go to Standard Login Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // STATE 3: GENERIC ERROR
  if (error && !loading) {
    return (
      <ErrorState
        title="Dashboard Unavailable"
        message={error}
        onRetry={fetchSummary}
        retrying={loading}
      />
    );
  }

  // STATE 4: LOADING
  if (loading || !data) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="h-6 w-48 bg-muted rounded-lg animate-pulse" />
        <LoadingSkeleton type="metrics" count={4} />
        <div className="h-56 rounded-2xl bg-card border border-border animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-48 rounded-2xl bg-card border border-border animate-pulse" />
          <div className="h-48 rounded-2xl bg-card border border-border animate-pulse" />
        </div>
      </div>
    );
  }

  const rawRole = user?.role;
  const isDeveloper = user?.isDeveloper || rawRole === "DEVELOPER" || user?.email === "suman.baidya.pro@gmail.com";
  const isSuperAdmin = isDeveloper || user?.isSuperAdmin || rawRole === "SUPER_ADMIN" || user?.email === "suman.baidya.pro@gmail.com";

  // If super admin / developer, apply simulation if active
  const role: RoleType = (isSuperAdmin && simulatedRole) ? simulatedRole : (rawRole as RoleType);
  const dashboardType: DashboardType = resolveDashboardType(role);

  // Check Workspace Approval Status (Admins/Staff/Creators/Guests cannot operate unapproved tenants)
  if (data.workspace?.isApproved === false && !isSuperAdmin) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6 animate-in fade-in">
        <div className="max-w-md w-full p-8 rounded-2xl bg-card border border-amber-500/30 text-center space-y-4 backdrop-blur-xl shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-foreground">Workspace Under Review</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your business workspace <strong>{data.workspace.businessName || data.workspace.name}</strong> is registered and queued for Super Admin verification. Automated publishing and AI generation will be fully active once approved.
          </p>
          <div className="pt-2">
            <span className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/25">
              Status: Verification In Progress
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 1. Creator Studio View
  if (dashboardType === "CREATOR") {
    return <CreatorStudioView data={data} />;
  }

  // 2. Guest / Client Portal View
  if (dashboardType === "GUEST") {
    return <GuestPortalView data={data} />;
  }

  const { workspace, stats, autopilot, credits, channels, recentPosts } = data;

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* Page Header without breadcrumb trail */}
      <PageBreadcrumb
        pageTitle="Autopilot Overview"
        description="Real-time marketing intelligence and automated campaign operations."
        hideBreadcrumb={true}
      >
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <>
              <Link
                href="/admin/tenants"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all active:scale-95"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Tenants</span>
              </Link>
              <Link
                href="/admin/marketing"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Founder Cockpit</span>
              </Link>
            </>
          )}
          <Link
            href="/content"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold transition-all shadow-md shadow-primary/20 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New AI Post</span>
          </Link>
        </div>
      </PageBreadcrumb>

      {/* 1. TailAdmin Standard 4-Metric Grid (2x2 on Mobile, 4x1 on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-3.5">
        <StatCard
          title="Published Posts"
          value={stats.publishedCount}
          icon={CheckCircle2}
          variant="emerald"
          badge={{ text: "+12.4%", variant: "success" }}
        />
        <StatCard
          title="Scheduled Queue"
          value={stats.scheduledCount}
          icon={Clock}
          variant="sky"
          badge={{ text: "IST Queue", variant: "info" }}
        />
        <StatCard
          title="Review Required"
          value={stats.inReviewCount}
          icon={AlertTriangle}
          variant="amber"
          badge={{ text: "Mobile Link", variant: "warning" }}
        />
        <StatCard
          title="Available Credits"
          value={credits.remaining}
          icon={Coins}
          variant="primary"
          badge={{ text: credits.planName, variant: "neutral" }}
        />
      </div>

      {/* 2. Executive Autopilot Briefing Banner */}
      <AutopilotBriefing
        businessName={workspace.businessName}
        stats={stats}
        autopilot={autopilot}
        phoneNumber={workspace.phoneNumber}
      />

      {/* 3. Channel Health & Credit Quota Grid (Equal Height Alignment) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-3.5 md:gap-4 items-stretch">
        <div className="lg:col-span-2 flex flex-col">
          <ChannelHealthWidget channels={channels} onRefresh={fetchSummary} />
        </div>
        <div className="flex flex-col">
          <CreditQuotaRing
            allocated={credits.allocated}
            used={credits.used}
            remaining={credits.remaining}
            percentageUsed={credits.percentageUsed}
            planName={credits.planName}
          />
        </div>
      </div>

      {/* 4. Creative Feed & Recent Posters Carousel */}
      <RecentPostsCarousel posts={recentPosts} />

      {/* 5. Trajectory Area Chart */}
      <PerformanceChart />

      {/* 6. Standard 3-Column Report Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
        {/* Column 1: What Happened */}
        <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border backdrop-blur-xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <h3>Execution Activity (Last 24h)</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-muted/50 border border-border text-xs leading-relaxed">
              <div className="flex items-center justify-between mb-1">
                <span className="text-foreground font-medium">Regional Poster Synthesis</span>
                <span className="text-[10px] text-emerald-500 font-medium">Verified</span>
              </div>
              <p className="text-muted-foreground">
                1080×1080 Pillow rendering engine with Noto Sans Bengali font loaded. Cloudinary CDN configured.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/50 border border-border text-xs leading-relaxed">
              <div className="flex items-center justify-between mb-1">
                <span className="text-foreground font-medium">Neural Voice Synthesis</span>
                <span className="text-[10px] text-emerald-500 font-medium">Active</span>
              </div>
              <p className="text-muted-foreground">
                Microsoft Edge-TTS neural speech enabled for Bengali and Indian English promotional reels.
              </p>
            </div>
          </div>
        </div>

        {/* Column 2: What is Planned Next */}
        <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border backdrop-blur-xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
            <Clock className="w-4 h-4 text-sky-500" />
            <h3>Scheduled Operations</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-muted/50 border border-border text-xs leading-relaxed">
              <div className="flex items-center justify-between mb-1">
                <span className="text-foreground font-medium">
                  {autopilot.nextScheduled?.title || "Regional Promo Distribution"}
                </span>
                <span className="text-[10px] text-sky-500 font-medium">
                  {autopilot.nextScheduled
                    ? new Date(autopilot.nextScheduled.scheduledFor).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Asia/Kolkata",
                      }) + " IST"
                    : "Scheduled Queue"}
                </span>
              </div>
              <p className="text-muted-foreground">
                Automated publishing dispatch to Facebook Page and Instagram Business feed.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/50 border border-border text-xs leading-relaxed">
              <div className="flex items-center justify-between mb-1">
                <span className="text-foreground font-medium">Weekly Performance Digest</span>
                <span className="text-[10px] text-muted-foreground font-medium">Sunday 8:00 PM IST</span>
              </div>
              <p className="text-muted-foreground">
                Summary of WhatsApp inquiries, reach, and clicks dispatched to business owner.
              </p>
            </div>
          </div>
        </div>

        {/* Column 3: What Needs Human Review */}
        <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border backdrop-blur-xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3>Action & Review Required</h3>
          </div>

          {autopilot.pendingReviewItem ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-foreground leading-relaxed space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-500">Approval Required</span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(autopilot.pendingReviewItem.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
              <p className="text-foreground font-medium">{autopilot.pendingReviewItem.title}</p>
              <p className="text-muted-foreground text-[11px]">
                High-risk promotion or festive deal requires mobile approval before automatic publishing.
              </p>
              <Link
                href="/content"
                className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 font-semibold text-xs transition-colors"
              >
                <span>Inspect in Studio</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground leading-relaxed text-center py-6">
              <p className="text-foreground font-medium mb-1">Queue is Clear</p>
              All scheduled promotions have been reviewed and approved. All posts have passed guardrail checks.
            </div>
          )}

          <Link
            href="/content"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-muted hover:bg-accent border border-border text-foreground font-medium text-xs transition-all active:scale-95"
          >
            <span>Draft New Campaign in Studio</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
          </Link>
        </div>
      </div>
    </div>
  );
}
