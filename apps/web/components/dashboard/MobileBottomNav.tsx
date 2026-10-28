"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Sparkles,
  Zap,
  Palette,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export function MobileBottomNav({ userRole }: { userRole?: string }) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Report",
      href: "/dashboard",
      icon: BarChart3,
    },
    {
      name: "Studio",
      href: "/content",
      icon: Sparkles,
      highlight: true,
    },
    {
      name: "Autopilot",
      href: "/autopilot",
      icon: Zap,
    },
    {
      name: "Brand",
      href: "/brand",
      icon: Palette,
    },
    ...(userRole === "SUPER_ADMIN"
      ? [
          {
            name: "Admin",
            href: "/admin",
            icon: ShieldCheck,
          },
        ]
      : []),
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B0F17]/95 backdrop-blur-xl border-t border-white/[0.08] px-3 py-2 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-3 flex flex-col items-center group active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00D4E0] to-[#00F0FF] text-[#090D14] flex items-center justify-center shadow-lg shadow-[#00F0FF]/30 border-2 border-[#0B0F17]">
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-medium text-[#00F0FF] mt-0.5">
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all active:scale-95 ${
                isActive
                  ? "text-[#00F0FF]"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
              <span className={`text-[10px] mt-1 ${isActive ? "font-semibold" : "font-normal"}`}>
                {item.name}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#00F0FF] mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
