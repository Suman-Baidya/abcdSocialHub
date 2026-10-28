"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  LayoutDashboard,
  Palette,
  Image as ImageIcon,
  Calendar,
  MessageSquare,
  Users,
  CreditCard,
  ShieldCheck,
  LogOut,
  Rocket,
  Menu,
  X,
  Share2,
} from "lucide-react";
import { WorkspaceSwitcher } from "@/components/dashboard/WorkspaceSwitcher";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Role extraction
  const user = session?.user as any;
  const role = user?.role || "OWNER";
  const isSuperAdmin = user?.isSuperAdmin || role === "SUPER_ADMIN";

  const navigation = [
    { name: "Autopilot Report", href: "/dashboard", icon: LayoutDashboard },
    { name: "Content Studio", href: "/content", icon: ImageIcon },
    { name: "Social Channels", href: "/social", icon: Share2 },
    { name: "Brand Identity Kit", href: "/brand", icon: Palette },
    { name: "Publishing Queue", href: "/calendar", icon: Calendar },
    { name: "WhatsApp Leads", href: "/leads", icon: MessageSquare },
    { name: "Team Members", href: "/team", icon: Users },
  ];

  // Billing is hidden from Staff
  if (role !== "STAFF") {
    navigation.push({ name: "Billing & Credits", href: "/billing", icon: CreditCard });
  }

  // Super Admin Exclusive Link
  const adminNav = isSuperAdmin
    ? [{ name: "Founder Cockpit", href: "/admin/marketing", icon: Rocket }]
    : [];

  const getRoleBadge = (r: string) => {
    switch (r) {
      case "SUPER_ADMIN":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "OWNER":
        return "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30";
      case "STAFF":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "CREATOR":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-zinc-100 flex flex-col">
      {/* Top Header */}
      <header className="h-16 border-b border-zinc-800/80 bg-[#121722]/80 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00F0FF] to-blue-600 flex items-center justify-center shadow-md shadow-[#00F0FF]/20">
              <Sparkles className="w-4 h-4 text-[#0A0D14]" />
            </div>
            <span className="font-bold text-lg text-white hidden sm:inline">
              ABCD <span className="text-[#00F0FF]">Social</span>
            </span>
          </Link>

          <div className="h-5 w-px bg-zinc-800 hidden sm:block" />

          {/* Active Workspace Switcher */}
          <WorkspaceSwitcher />
        </div>

        <div className="flex items-center gap-3">
          {/* Role Badge */}
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-semibold border uppercase tracking-wider hidden sm:inline-flex items-center gap-1.5 ${getRoleBadge(
              role
            )}`}
          >
            {isSuperAdmin && <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
            {role.replace("_", " ")}
          </span>

          {/* User profile dropdown / sign out */}
          <div className="flex items-center gap-2 pl-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700 flex items-center justify-center font-bold text-xs text-[#00F0FF]">
              {session?.user?.name ? session.user.name[0].toUpperCase() : "U"}
            </div>
            <span className="text-sm font-medium text-zinc-300 hidden md:inline truncate max-w-[120px]">
              {session?.user?.name || session?.user?.email?.split("@")[0]}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign Out"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/80 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="w-64 border-r border-zinc-800/80 bg-[#0E131E]/60 backdrop-blur-md hidden md:flex flex-col justify-between p-4 shrink-0">
          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider px-3 mb-2">
                Autopilot System
              </div>
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 shadow-sm"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${active ? "text-[#00F0FF]" : "text-zinc-400"}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Super Admin Section */}
            {isSuperAdmin && (
              <div>
                <div className="text-[11px] font-bold text-amber-500/80 uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Developer Suite</span>
                </div>
                <nav className="space-y-1">
                  {adminNav.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </div>

          {/* Credits footer widget */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-zinc-400 font-medium">Monthly Credits</span>
              <span className="text-[#00F0FF] font-semibold">100 / 100</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="w-full h-full bg-[#00F0FF] rounded-full" />
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">Zero-cost free AI tier active</p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-[#0A0D14]/90 backdrop-blur-xl flex flex-col p-6">
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-xl text-white">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-2 flex-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-zinc-200 hover:text-white hover:bg-zinc-800"
                >
                  <item.icon className="w-5 h-5 text-[#00F0FF]" />
                  <span>{item.name}</span>
                </Link>
              ))}
              {isSuperAdmin &&
                adminNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 bg-gradient-to-b from-[#0A0D14] to-[#0D111A]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile-first Thumb Navigation Dock */}
      <MobileBottomNav userRole={role} />
    </div>
  );
}
