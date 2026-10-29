"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Compass,
  ArrowLeft,
  LayoutDashboard,
  ImageIcon,
  Calendar,
  MessageSquare,
  CreditCard,
  Home,
} from "lucide-react";

export default function NotFoundPage() {
  const router = useRouter();

  const quickLinks = [
    {
      title: "Autopilot Report",
      description: "Live marketing performance & queue status",
      href: "/dashboard",
      icon: LayoutDashboard,
      color: "text-[#00F0FF]",
      bg: "bg-[#00F0FF]/10 border-[#00F0FF]/20",
    },
    {
      title: "Content Studio",
      description: "Generate Bengali & English posters and voiceovers",
      href: "/content",
      icon: ImageIcon,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Publishing Queue",
      description: "Review scheduled posts and container status",
      href: "/calendar",
      icon: Calendar,
      color: "text-sky-400",
      bg: "bg-sky-500/10 border-sky-500/20",
    },
    {
      title: "WhatsApp Leads",
      description: "Manage inbound customer inquiries and chats",
      href: "/leads",
      icon: MessageSquare,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0D14] text-zinc-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#00F0FF]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-600/5 blur-[100px] pointer-events-none" />

      {/* Top Navbar Brand */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between pb-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00F0FF] to-blue-600 flex items-center justify-center shadow-md shadow-[#00F0FF]/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-[#0A0D14]" />
          </div>
          <span className="font-bold text-lg text-white">
            ABCD <span className="text-[#00F0FF]">Social</span>
          </span>
        </Link>

        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-zinc-300 hover:text-white transition-all active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Go Back</span>
        </button>
      </header>

      {/* Main 404 Hero Card */}
      <main className="max-w-3xl w-full mx-auto my-auto py-8 text-center space-y-8 relative z-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            <Compass className="w-4 h-4 animate-spin [animation-duration:8s]" />
            <span>404 • Destination Lost in Transit</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
            Page Not{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-[#00F0FF] to-sky-400">
              Found
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-lg mx-auto leading-relaxed">
            The page you are searching for does not exist, has been relocated, or is temporarily
            offline. Explore the verified routes below:
          </p>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left max-w-2xl mx-auto">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="p-4 rounded-2xl bg-[#111722]/80 border border-white/[0.06] hover:border-[#00F0FF]/40 backdrop-blur-xl transition-all group flex items-start gap-3.5 hover:shadow-lg hover:shadow-[#00F0FF]/5"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${link.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`w-5 h-5 ${link.color}`} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-semibold text-zinc-100 group-hover:text-[#00F0FF] transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 leading-snug">
                    {link.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Primary CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#00F0FF] hover:bg-[#00D4E0] text-[#0A0D14] font-semibold text-xs sm:text-sm shadow-md shadow-[#00F0FF]/20 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return to Autopilot Report</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto pt-6 border-t border-white/[0.04] text-center text-xs text-zinc-500">
        ABCD Social Hub • AI Marketing Automation for Indian Businesses & Creators
      </footer>
    </div>
  );
}
