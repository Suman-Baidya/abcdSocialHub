"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
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
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";
import { WorkspaceSwitcher } from "@/components/dashboard/WorkspaceSwitcher";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Role extraction
  const user = session?.user as any;
  const role = user?.role || "OWNER";
  const isSuperAdmin = user?.isSuperAdmin || role === "SUPER_ADMIN";

  // Keyboard shortcut for Command/Ctrl + K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const navGroups: NavGroup[] = [
    {
      groupTitle: "Main Menu",
      items: [
        { name: "Autopilot Report", href: "/dashboard", icon: LayoutDashboard },
        { name: "Content Studio", href: "/content", icon: ImageIcon },
        { name: "Publishing Queue", href: "/calendar", icon: Calendar },
      ],
    },
    {
      groupTitle: "Channels & Campaigns",
      items: [
        { name: "Social Channels", href: "/social", icon: Share2 },
        { name: "Brand Identity Kit", href: "/brand", icon: Palette },
      ],
    },
    {
      groupTitle: "CRM & Growth",
      items: [
        { name: "WhatsApp Leads", href: "/leads", icon: MessageSquare, badge: "Live" },
        ...(role !== "STAFF"
          ? [{ name: "Billing & Plans", href: "/billing", icon: CreditCard }]
          : []),
      ],
    },
    {
      groupTitle: "Administration",
      items: [
        { name: "Team & Roles", href: "/team", icon: Users },
        ...(isSuperAdmin
          ? [{ name: "Founder Cockpit", href: "/admin/marketing", icon: Rocket, badge: "Admin" }]
          : []),
      ],
    },
  ];

  const getRoleBadgeClass = (r: string) => {
    switch (r) {
      case "SUPER_ADMIN":
        return "bg-amber-500/10 text-amber-400 border-amber-500/25";
      case "OWNER":
        return "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/25";
      case "STAFF":
        return "bg-sky-500/10 text-sky-400 border-sky-500/25";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/25";
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-zinc-100 flex">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm xl:hidden"
        />
      )}

      {/* TailAdmin Standard Full-Height Fixed Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[280px] border-r border-zinc-800/80 bg-[#0B0F19] flex flex-col justify-between transition-transform duration-300 ease-in-out xl:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Sidebar Brand Header */}
          <div className="h-18 px-6 flex items-center justify-between border-b border-zinc-800/60 shrink-0">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00F0FF] to-blue-600 flex items-center justify-center shadow-md shadow-[#00F0FF]/20">
                <Sparkles className="w-4 h-4 text-[#0A0D14]" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-white">
                  ABCD <span className="text-[#00F0FF]">Social</span>
                </span>
                <span className="text-[10px] font-medium text-zinc-400">Marketing Autopilot</span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="xl:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Categorized Navigation Menu */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
            {navGroups.map((group, idx) => (
              <div key={idx}>
                <h3 className="px-3 mb-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  {group.groupTitle}
                </h3>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                            isActive
                              ? "bg-white/[0.06] text-white border-l-2 border-[#00F0FF] font-semibold shadow-sm"
                              : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                isActive ? "text-[#00F0FF]" : "text-zinc-400"
                              }`}
                            />
                            <span>{item.name}</span>
                          </div>

                          {item.badge && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                                item.badge === "Live"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Sidebar Footer Support Card */}
          <div className="p-4 border-t border-zinc-800/60 shrink-0">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">Autopilot Node</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  IST Active
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Regional engine connected to Meta Graph API & pg-boss queue.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col xl:ms-[280px] min-h-screen">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 h-18 bg-[#0B0F19]/95 backdrop-blur-xl border-b border-zinc-800/80 px-6 sm:px-8 lg:px-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="xl:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* TailAdmin Command Search Bar */}
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search campaigns, prompts, channels..."
                className="w-full pl-9 pr-16 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-sans bg-zinc-800 text-zinc-400 border border-zinc-700">
                Ctrl K
              </kbd>
            </div>
          </div>

          {/* Right Header Tray */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Active Workspace Switcher */}
            <WorkspaceSwitcher />

            <div className="h-5 w-px bg-zinc-800 hidden sm:block" />

            {/* Notification Bell */}
            <button
              title="Notifications"
              className="relative p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00F0FF]" />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-3 pl-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-[#00F0FF]">
                {session?.user?.name ? session.user.name[0].toUpperCase() : "U"}
              </div>

              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-zinc-200 truncate max-w-[120px]">
                  {session?.user?.name || session?.user?.email?.split("@")[0]}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-medium border self-start ${getRoleBadgeClass(
                    role
                  )}`}
                >
                  {role.replace("_", " ")}
                </span>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="Sign Out"
                className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/60 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content Canvas */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
