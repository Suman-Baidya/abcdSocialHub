import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Rocket,
  ShieldCheck,
  ArrowLeft,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  // Strict Super-Admin guard per AGENTS.md Rule 5
  const isSuperAdmin =
    user?.isSuperAdmin ||
    user?.role === "SUPER_ADMIN" ||
    user?.email === "suman.baidya.pro@gmail.com";

  if (!session || !isSuperAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#070A0F] text-zinc-100 flex flex-col">
      {/* Top Founder Navigation Bar */}
      <header className="h-16 border-b border-amber-500/20 bg-[#0C1017]/90 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 text-xs font-semibold transition-all active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Client Dashboard</span>
          </Link>

          <div className="h-4 w-px bg-zinc-800" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 text-zinc-950 flex items-center justify-center font-black text-xs shadow-md shadow-amber-500/20">
              <Rocket className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm sm:text-base text-white tracking-tight">
              Founder <span className="text-amber-400">Marketing Cockpit</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>FOUNDER ACCESS ONLY</span>
          </span>
        </div>
      </header>

      {/* Main Admin View */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
