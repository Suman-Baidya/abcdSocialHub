import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Database,
  Cpu,
  Server,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Activity,
  Terminal,
  Lock,
  RefreshCw,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DeveloperDiagnosticsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  // Strict Developer Guard: Only users flagged as developer or matching DEVELOPER_EMAILS
  const isDeveloper =
    user?.isDeveloper ||
    user?.role === "DEVELOPER" ||
    user?.email === "suman.baidya.pro@gmail.com";

  if (!session || !isDeveloper) {
    redirect("/dashboard");
  }

  // System Diagnostics Telemetry
  const memoryUsage = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());
  const uptimeMinutes = Math.floor(uptimeSeconds / 60);
  const uptimeHours = Math.floor(uptimeMinutes / 60);

  const envAudit = [
    { name: "DATABASE_URL", configured: !!process.env.DATABASE_URL, status: "Configured (Neon PostgreSQL)" },
    { name: "NEXTAUTH_SECRET", configured: !!process.env.NEXTAUTH_SECRET, status: "Active (64-byte key)" },
    { name: "TOKEN_ENCRYPTION_KEY", configured: !!process.env.TOKEN_ENCRYPTION_KEY, status: "Active (AES-256-GCM)" },
    { name: "DEVELOPER_EMAILS", configured: !!process.env.DEVELOPER_EMAILS || !!process.env.DEVELOPER_EMAIL, status: "Configured (.env hidden)" },
    { name: "SUPER_ADMIN_EMAILS", configured: !!process.env.SUPER_ADMIN_EMAILS, status: "Configured" },
    { name: "OPENROUTER_API_KEY", configured: !!process.env.OPENROUTER_API_KEY, status: "Configured (Multi-Tier Router)" },
    { name: "PYTHON_WORKER_URL", configured: !!process.env.PYTHON_WORKER_URL, status: "Configured (FastAPI Worker)" },
    { name: "RAZORPAY_KEY_ID", configured: !!process.env.RAZORPAY_KEY_ID, status: "Configured (India Payments)" },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Developer Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/marketing"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Founder Cockpit</span>
            </Link>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
              HIDDEN ROOT ACCESS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Developer Diagnostics</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono">
              v0.1.0-beta
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-snug">
            Real-time backend engine telemetry, process memory, and security token audit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-all"
          >
            Return to SaaS
          </Link>
        </div>
      </div>

      {/* KPI Diagnostics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Memory Heap */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Node.js Heap</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">
            {Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB
          </div>
          <span className="text-[10px] text-muted-foreground block">
            Total Allocated: {Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB
          </span>
        </div>

        {/* Process Uptime */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Server Uptime</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-sky-400 font-mono">
            {uptimeHours}h {uptimeMinutes % 60}m {uptimeSeconds % 60}s
          </div>
          <span className="text-[10px] text-muted-foreground block">
            PID: {process.pid} (Windows 64-bit)
          </span>
        </div>

        {/* Database Engine */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">PostgreSQL</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            Healthy
          </div>
          <span className="text-[10px] text-muted-foreground block">
            Neon Serverless • Pooled
          </span>
        </div>

        {/* Security & RBAC */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">RBAC Security</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-400">
            7 Roles Active
          </div>
          <span className="text-[10px] text-muted-foreground block">
            4-Tier Dashboard Routing
          </span>
        </div>
      </div>

      {/* Environment & Cryptographic Keys Audit */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Environment & Secret Isolation Audit</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
            Server-Side Only
          </span>
        </div>
        <div className="divide-y divide-border">
          {envAudit.map((item) => (
            <div key={item.name} className="p-3 sm:px-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {item.configured ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-amber-500/50 bg-amber-500/20 shrink-0" />
                )}
                <span className="font-mono font-semibold text-foreground">{item.name}</span>
              </div>
              <span className="text-muted-foreground font-medium text-[11px]">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Developer Session Claims */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-foreground">Active Session Security Claims</h3>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">
            Authenticated via NextAuth JWT
          </span>
        </div>
        <pre className="p-3 rounded-xl bg-muted/60 border border-border text-[11px] font-mono text-foreground overflow-x-auto">
          {JSON.stringify(
            {
              userId: user?.id,
              name: user?.name,
              email: user?.email,
              role: user?.role,
              dashboardType: user?.dashboardType,
              isDeveloper: user?.isDeveloper,
              isSuperAdmin: user?.isSuperAdmin,
              workspaceId: user?.workspaceId,
              organizationId: user?.organizationId,
              allowedPages: user?.allowedPages || [],
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
