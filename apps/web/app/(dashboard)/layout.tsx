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
  Rocket,
  Menu,
  X,
  Share2,
  Search,
  Bell,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon,
} from "lucide-react";
import { WorkspaceSwitcher } from "@/components/dashboard/WorkspaceSwitcher";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { useTheme } from "@/components/providers/ThemeProvider";

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
  const { theme, toggleTheme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load sidebar collapsed preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem("abcd_sidebar_collapsed");
      if (stored !== null) {
        setIsCollapsed(stored === "true");
      }
    } catch {}
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("abcd_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

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
        return "bg-amber-500/10 text-amber-500 border-amber-500/25";
      case "OWNER":
        return "bg-primary/10 text-primary border-primary/25";
      case "STAFF":
        return "bg-sky-500/10 text-sky-500 border-sky-500/25";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex transition-colors duration-200">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
        />
      )}

      {/* Full-Height Sidebar with Smooth Animation and Strict Vertical Alignment */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full border-r border-border bg-card flex flex-col justify-between transition-[width,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full xl:translate-x-0"
        } ${isCollapsed ? "xl:w-[72px]" : "xl:w-[270px]"} w-[270px]`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Sidebar Brand Header (Height 64px = h-16) */}
          <div
            className={`h-16 border-b border-border shrink-0 flex items-center transition-all duration-300 ${
              isCollapsed ? "justify-center px-0" : "justify-between px-4"
            }`}
          >
            {isCollapsed ? (
              <div className="w-full flex items-center justify-center">
                <button
                  onClick={toggleCollapse}
                  title="Expand sidebar"
                  className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F0FF] to-blue-600 flex items-center justify-center shadow-md shadow-[#00F0FF]/20 hover:scale-105 transition-transform cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-[#0A0D14]" />
                </button>

                {/* Mobile close button if drawer ever opened */}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="xl:hidden absolute right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F0FF] to-blue-600 flex items-center justify-center shadow-md shadow-[#00F0FF]/20 shrink-0">
                    <Sparkles className="w-5 h-5 text-[#0A0D14]" />
                  </div>
                  <div className="flex flex-col whitespace-nowrap transition-all duration-300 overflow-hidden">
                    <span className="font-bold text-base tracking-tight text-foreground">
                      ABCD <span className="text-primary">Social</span>
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground">Marketing Autopilot</span>
                  </div>
                </Link>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Desktop collapse button */}
                  <button
                    onClick={toggleCollapse}
                    title="Collapse sidebar"
                    className="hidden xl:flex p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>

                  {/* Mobile close button */}
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="xl:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Categorized Navigation Menu */}
          <div
            className={`flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-5 transition-all duration-300 ${
              isCollapsed ? "px-2" : "px-3"
            }`}
          >
            {navGroups.map((group, idx) => (
              <div key={idx}>
                {isCollapsed ? (
                  idx > 0 && <div className="my-2.5 h-px bg-border/60 mx-1.5 transition-opacity duration-300" />
                ) : (
                  <h3 className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap transition-opacity duration-300">
                    {group.groupTitle}
                  </h3>
                )}

                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    if (isCollapsed) {
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            title={`${item.name}${item.badge ? ` (${item.badge})` : ""}`}
                            className={`relative w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-all duration-200 ${
                              isActive
                                ? "bg-primary/10 text-primary font-semibold shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            }`}
                          >
                            <Icon
                              className={`w-5 h-5 shrink-0 ${
                                isActive ? "text-primary stroke-[2.2]" : "text-muted-foreground"
                              }`}
                            />
                            {item.badge && (
                              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            )}
                          </Link>
                        </li>
                      );
                    }

                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                            isActive
                              ? "bg-primary/10 text-primary border-l-2 border-primary font-semibold shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                          }`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                isActive ? "text-primary" : "text-muted-foreground"
                              }`}
                            />
                            <span className="whitespace-nowrap truncate">{item.name}</span>
                          </div>

                          {item.badge && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md font-semibold shrink-0 ${
                                item.badge === "Live"
                                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
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

          {/* Sidebar Bottom: Profile-Related Section (Replacing autopilot card) */}
          <div className="p-3 border-t border-border shrink-0 transition-all duration-300">
            {isCollapsed ? (
              <div className="flex items-center justify-center">
                <Link
                  href="/team"
                  title={`${session?.user?.name || "Profile & Team"} (${role.replace("_", " ")})`}
                  className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F0FF]/20 to-blue-600/20 border border-[#00F0FF]/30 flex items-center justify-center font-bold text-xs text-primary hover:border-primary transition-colors cursor-pointer"
                >
                  {session?.user?.name ? session.user.name[0].toUpperCase() : "U"}
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                <Link href="/team" className="flex items-center gap-3 overflow-hidden flex-1 group">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00F0FF]/20 to-blue-600/20 border border-[#00F0FF]/30 flex items-center justify-center font-bold text-xs text-primary shrink-0 group-hover:scale-105 transition-transform">
                    {session?.user?.name ? session.user.name[0].toUpperCase() : "U"}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {session?.user?.name || session?.user?.email?.split("@")[0]}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {session?.user?.email || "Workspace Member"}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area — Margin shifts smoothly with sidebar collapse */}
      <div
        className={`flex-1 flex flex-col min-h-screen min-w-0 max-w-full overflow-x-hidden transition-[margin] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isCollapsed ? "xl:ms-[72px]" : "xl:ms-[270px]"
        }`}
      >
        {/* Sticky Top Header (Height 64px = h-16) */}
        <header className="sticky top-0 z-30 h-16 bg-card/90 backdrop-blur-xl border-b border-border px-4 sm:px-5 lg:px-6 flex items-center justify-between gap-3 sm:gap-4 transition-colors">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-1">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="xl:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Quick Expand Toggle — Shown in Header ONLY when sidebar is collapsed */}
            {isCollapsed && (
              <button
                onClick={toggleCollapse}
                title="Expand sidebar"
                className="hidden xl:flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted border border-border/70 transition-all cursor-pointer shrink-0"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            {/* Command Search Bar */}
            <div className="relative max-w-sm sm:max-w-md w-full hidden sm:block">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search campaigns, prompts, channels..."
                className="w-full pl-9 pr-16 py-2 rounded-xl bg-muted/60 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-sans bg-muted text-muted-foreground border border-border">
                Ctrl K
              </kbd>
            </div>
          </div>

          {/* Right Header Tray */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Active Workspace Switcher */}
            <WorkspaceSwitcher />

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Toggle color theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-sky-500 hover:-rotate-12 transition-transform" />
              )}
            </button>

            <div className="h-5 w-px bg-border hidden sm:block" />

            {/* Notification Bell */}
            <button
              title="Notifications"
              className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-blue-600/20 border border-primary/30 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                {session?.user?.name ? session.user.name[0].toUpperCase() : "U"}
              </div>

              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                  {session?.user?.name || session?.user?.email?.split("@")[0]}
                </span>
                {/* Refined and smaller SUPER ADMIN badge */}
                <span
                  className={`text-[9px] font-semibold tracking-wide px-1.5 py-0.5 rounded border self-start uppercase leading-none mt-0.5 ${getRoleBadgeClass(
                    role
                  )}`}
                >
                  {role.replace("_", " ")}
                </span>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="Sign Out"
                className="p-2 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-muted transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content Canvas with compact, balanced side spacing */}
        <main className="flex-1 px-4 sm:px-5 lg:px-6 pt-3 sm:pt-4 space-y-4 sm:space-y-5 pb-24 xl:pb-12 w-full min-w-0 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Smart Mobile App-Style Bottom Navigation */}
      <MobileBottomNav userRole={role} isSuperAdmin={isSuperAdmin} />
    </div>
  );
}
