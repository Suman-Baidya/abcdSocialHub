"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  MessageSquare,
  MoreHorizontal,
  Share2,
  Palette,
  CreditCard,
  Users,
  Rocket,
  Sun,
  Moon,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { DashboardType } from "@/lib/auth";

interface MobileBottomNavProps {
  userRole?: string;
  isSuperAdmin?: boolean;
  dashboardType?: DashboardType;
  allowedPages?: string[];
}

export function MobileBottomNav({
  userRole = "TENANT_ADMIN",
  isSuperAdmin = false,
  dashboardType = "TENANT",
  allowedPages = [],
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // Close more menu on route change
  useEffect(() => {
    setMoreMenuOpen(false);
  }, [pathname]);

  // Adaptive Primary Tabs tailored to the 4 Dashboard Suites
  let primaryTabs: any[] = [];

  if (dashboardType === "CREATOR") {
    primaryTabs = [
      { name: "Studio", href: "/content", icon: Sparkles, highlight: true },
      { name: "Queue", href: "/calendar", icon: Calendar },
      { name: "Brand", href: "/brand", icon: Palette },
      { name: "Report", href: "/dashboard", icon: LayoutDashboard },
      { name: "More", action: () => setMoreMenuOpen(true), icon: MoreHorizontal, isMore: true },
    ];
  } else if (dashboardType === "GUEST") {
    primaryTabs = [
      { name: "Briefing", href: "/dashboard", icon: LayoutDashboard },
      { name: "Feed", href: "/calendar", icon: Calendar },
      { name: "Brand", href: "/brand", icon: Palette },
      { name: "More", action: () => setMoreMenuOpen(true), icon: MoreHorizontal, isMore: true },
    ];
  } else if (dashboardType === "SUPER_ADMIN") {
    primaryTabs = [
      { name: "Platform", href: "/dashboard", icon: LayoutDashboard },
      { name: "Cockpit", href: "/admin/marketing", icon: Rocket, highlight: true, badge: "Admin" },
      { name: "Team", href: "/team", icon: Users },
      { name: "Channels", href: "/social", icon: Share2 },
      { name: "More", action: () => setMoreMenuOpen(true), icon: MoreHorizontal, isMore: true },
    ];
  } else {
    // TENANT Business Suite (Tenant Admin & Admin Staff)
    primaryTabs = [
      { name: "Report", href: "/dashboard", icon: LayoutDashboard },
      { name: "Queue", href: "/calendar", icon: Calendar },
      { name: "Create", href: "/content", icon: Sparkles, highlight: true },
      { name: "Leads", href: "/leads", icon: MessageSquare, badge: "Live" },
      { name: "More", action: () => setMoreMenuOpen(true), icon: MoreHorizontal, isMore: true },
    ];
  }

  // Secondary more menu tailored to the active role
  const secondaryMenu = [
    ...(dashboardType !== "GUEST"
      ? [
          {
            name: "Social Channels",
            href: "/social",
            icon: Share2,
            desc: "Meta, Instagram & Facebook connections",
          },
          {
            name: "Brand Identity Kit",
            href: "/brand",
            icon: Palette,
            desc: "Colors, voice & regional typography",
          },
        ]
      : []),
    ...(userRole === "TENANT_ADMIN" || userRole === "OWNER" || isSuperAdmin
      ? [
          {
            name: "Billing & Plans",
            href: "/billing",
            icon: CreditCard,
            desc: "Credits, invoices & quotas",
          },
        ]
      : []),
    ...(dashboardType !== "CREATOR" && dashboardType !== "GUEST"
      ? [
          {
            name: "Team & Roles",
            href: "/team",
            icon: Users,
            desc: "Workspace members & access roles",
          },
        ]
      : []),
    ...(isSuperAdmin
      ? [
          {
            name: "Founder Cockpit",
            href: "/admin/marketing",
            icon: Rocket,
            desc: "Global system & autopilot controls",
            badge: "Admin",
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Native App-Style Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border px-3 py-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-lg transition-colors"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {primaryTabs.map((item) => {
            if (item.highlight) {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative -top-3.5 flex flex-col items-center group active:scale-95 transition-transform"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00D4E0] to-[#00F0FF] text-[#0A0D14] flex items-center justify-center shadow-lg shadow-[#00F0FF]/30 border-2 border-background">
                    <Icon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span
                    className={`text-[10px] font-semibold mt-0.5 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            }

            if (item.isMore) {
              const isMoreActive =
                moreMenuOpen ||
                secondaryMenu.some((sub) => pathname === sub.href);
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  onClick={item.action}
                  className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all active:scale-95 ${
                    isMoreActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isMoreActive ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
                  <span className="text-[10px] mt-1 font-medium">{item.name}</span>
                  {isMoreActive && (
                    <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                  )}
                </button>
              );
            }

            const href = item.href || "/dashboard";
            const isActive =
              pathname === href ||
              (href !== "/dashboard" && pathname?.startsWith(href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={href}
                className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition-all active:scale-95 ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] mt-1 font-medium">{item.name}</span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Slide-Up Bottom Sheet for "More" Menu */}
      {moreMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setMoreMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          />

          {/* Drawer Sheet */}
          <div className="relative z-10 w-full max-h-[85vh] overflow-y-auto rounded-t-3xl bg-card border-t border-border p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 pb-[max(2rem,env(safe-area-inset-bottom))]">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 mx-auto mb-5" />

            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">Menu & Tools</h3>
                <p className="text-xs text-muted-foreground">Channels, CRM, and organization settings</p>
              </div>
              <button
                onClick={() => setMoreMenuOpen(false)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Links List */}
            <div className="py-4 space-y-1.5">
              {secondaryMenu.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isActive
                            ? "bg-primary text-black"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{item.name}</span>
                          {item.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-snug">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>

            {/* Actions: Theme Toggle & Sign Out */}
            <div className="pt-4 mt-2 border-t border-border grid grid-cols-2 gap-3">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-muted hover:bg-accent text-foreground text-xs font-semibold transition-colors"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-sky-400" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-semibold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
