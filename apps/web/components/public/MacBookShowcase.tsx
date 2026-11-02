"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Bot,
  Palette,
  Zap,
  ShieldCheck,
  Smartphone,
  Calendar,
  Layers,
  BarChart3,
  CheckCircle2,
  Clock,
  Send,
  Check,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  ArrowRight,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Lock,
  Wifi,
  Battery,
  X,
  Plus,
  Star,
  Share2,
  MessageSquare,
  Settings,
  BadgePercent,
  CheckCheck,
} from "lucide-react";

export function MacBookShowcase() {
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const tabs = [
    {
      id: "ai-studio",
      title: "AI Autopilot Studio",
      shortTitle: "AI Studio",
      urlPath: "studio/generator",
      tagline: "Turn raw ideas into branded creatives in 0.4s",
      badge: "0.4s Fast Render",
      icon: Sparkles,
    },
    {
      id: "calendar",
      title: "Marketing Calendar (30d)",
      shortTitle: "30-Day Queue",
      urlPath: "calendar/30-day-queue",
      tagline: "Synchronized publishing across 5 official networks",
      badge: "5 Networks Synced",
      icon: Calendar,
    },
    {
      id: "approvals",
      title: "WhatsApp 1-Tap Review",
      shortTitle: "WhatsApp Review",
      urlPath: "approvals/whatsapp-direct",
      tagline: "Review and publish straight from your phone chat",
      badge: "Mobile Direct",
      icon: Smartphone,
    },
    {
      id: "analytics",
      title: "Founder ROI Cockpit",
      shortTitle: "ROI Analytics",
      urlPath: "analytics/growth-ledger",
      tagline: "Transparent growth ledger and zero ban record",
      badge: "Real-time Metrics",
      icon: BarChart3,
    },
  ];

  // Auto-cycle tabs every 6 seconds (pauses on hover)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % tabs.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, tabs.length]);

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + tabs.length) % tabs.length);
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % tabs.length);
  };

  const currentTab = tabs[activeSlide];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full"
    >
      {/* =================================================================== */}
      {/* DESKTOP & TABLET: ADVANCED BROWSER SHOWCASE                        */}
      {/* =================================================================== */}
      <div className="hidden sm:block">
        <div className="relative mx-auto max-w-6xl rounded-[2.2rem] p-3 sm:p-4 bg-gradient-to-b from-border/90 via-muted/30 to-border/80 shadow-2xl border border-border/80">
          {/* MacBook Outer Bezel Screen */}
          <div className="relative w-full rounded-[1.8rem] overflow-hidden bg-card border border-border/70 shadow-inner flex flex-col">
            
            {/* 1. TOP BROWSER TAB STRIP (Realistic Chrome / Arc Style) */}
            <div className="flex items-center justify-between px-3 pt-2 pb-0 bg-muted/40 border-b border-border/60">
              {/* Left: macOS Window Controls & Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 mr-2">
                {/* Traffic Light Window Dots */}
                <div className="flex items-center gap-2 px-2 shrink-0">
                  <span className="w-3 h-3 rounded-full bg-rose-500/90 shadow-2xs hover:opacity-80 transition-opacity cursor-pointer" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/90 shadow-2xs hover:opacity-80 transition-opacity cursor-pointer" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/90 shadow-2xs hover:opacity-80 transition-opacity cursor-pointer" />
                </div>

                {/* Real Browser Tabs */}
                <div className="flex items-center gap-1">
                  {tabs.map((tab, idx) => {
                    const Icon = tab.icon;
                    const isActive = activeSlide === idx;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveSlide(idx)}
                        className={`group relative flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer shrink-0 border-t border-x ${
                          isActive
                            ? "bg-card text-foreground border-border shadow-xs -mb-[1px] z-10"
                            : "bg-transparent text-muted-foreground border-transparent hover:bg-muted/60 hover:text-foreground"
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground/70"}`} />
                        <span className="truncate max-w-[140px]">{tab.title}</span>
                        <span
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity ${
                            isActive ? "hover:bg-muted" : "opacity-0 group-hover:opacity-60"
                          }`}
                        >
                          <X className="w-2.5 h-2.5" />
                        </span>
                      </button>
                    );
                  })}

                  {/* New Tab Button */}
                  <button
                    type="button"
                    title="New Workspace Tab"
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right: User / Workspace Pill */}
              <div className="hidden lg:flex items-center gap-2 shrink-0 pb-1">
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Meta & Google Verified
                </span>
              </div>
            </div>

            {/* 2. BROWSER TOOLBAR & OMNIBAR */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/60 bg-card gap-3">
              {/* Browser Navigation Buttons */}
              <div className="flex items-center gap-1 text-muted-foreground">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Previous Feature"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Next Feature"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className={`p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer ${
                    isPaused ? "text-amber-500" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title={isPaused ? "Auto-play paused. Click to resume." : "Reload / Pause auto-cycle"}
                >
                  <RotateCw className={`w-3.5 h-3.5 ${!isPaused ? "group-hover:rotate-180" : ""}`} />
                </button>
              </div>

              {/* Centered URL Omnibar */}
              <div className="flex-1 max-w-xl mx-auto">
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-muted/40 border border-border/80 shadow-2xs text-xs font-mono text-muted-foreground">
                  <div className="flex items-center gap-2 truncate">
                    <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-foreground font-semibold">https://abcd-social.app</span>
                    <span className="text-muted-foreground/80">/{currentTab.urlPath}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400/20 cursor-pointer" />
                    <Share2 className="w-3 h-3 hover:text-foreground cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* Right Extension Badges */}
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>Autopilot ON</span>
                </div>
              </div>
            </div>

            {/* 3. LIVE SAAS DASHBOARD VIEWPORT (Inside Browser) */}
            <div className="flex flex-1 min-h-[460px] text-left">
              {/* In-App Mini Sidebar Rail */}
              <div className="w-44 lg:w-48 shrink-0 border-r border-border/60 bg-muted/15 p-3 flex flex-col justify-between hidden md:flex">
                <div className="space-y-4">
                  {/* Store Profile */}
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                      A
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-foreground truncate">ABCD Retail</p>
                      <p className="text-[10px] text-muted-foreground font-mono">Demo Workspace</p>
                    </div>
                  </div>

                  {/* Nav links */}
                  <div className="space-y-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveSlide(0)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                        activeSlide === 0
                          ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Studio</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSlide(1)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                        activeSlide === 1
                          ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>30-Day Queue</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSlide(2)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                        activeSlide === 2
                          ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>WhatsApp Bot</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSlide(3)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                        activeSlide === 3
                          ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>ROI Cockpit</span>
                    </button>
                    <div className="w-full flex items-center gap-2 px-2.5 py-1.5 text-muted-foreground/60 text-xs">
                      <Palette className="w-3.5 h-3.5" />
                      <span>Brand Identity</span>
                    </div>
                  </div>
                </div>

                {/* Quota Progress meter */}
                <div className="p-2.5 rounded-xl bg-card border border-border space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Monthly Quota</span>
                    <span className="font-bold text-foreground">48/50</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="w-[96%] h-full bg-primary rounded-full" />
                  </div>
                  <p className="text-[9px] text-emerald-400 font-mono">● 2 credits remaining</p>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-4 sm:p-6 bg-card overflow-y-auto">
                {/* ------------------------------------------------------------- */}
                {/* TAB 0: AI AUTOPILOT STUDIO                                   */}
                {/* ------------------------------------------------------------- */}
                {activeSlide === 0 && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    {/* Top subheader */}
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span>AI Graphic Poster Studio</span>
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Campaign #WK-44 • Automatically styled with your brand kit in 0.4s
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Ready for Review
                        </span>
                      </div>
                    </div>

                    {/* Split View: Left = Input / Checks, Right = Realistic Graphic Creative */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      {/* Left: Raw Prompt & Engine Validation */}
                      <div className="lg:col-span-5 space-y-3">
                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-muted-foreground flex items-center gap-1.5">
                              <Bot className="w-3.5 h-3.5 text-primary" /> Business Raw Idea
                            </span>
                            <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                              Voice / Text
                            </span>
                          </div>
                          <p className="text-xs text-foreground leading-relaxed bg-card p-2.5 rounded-lg border border-border/80">
                            &ldquo;Weekend Mega Health Camp: Free vitals & blood sugar checkup, 15% discount on family packages. Walk-ins welcome this Saturday & Sunday!&rdquo;
                          </p>
                        </div>

                        {/* Guardrails verified */}
                        <div className="p-3 rounded-xl bg-muted/20 border border-border space-y-2 text-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                            Deterministic Guardrails
                          </span>
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Pricing Guardrail
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono font-semibold">VERIFIED</span>
                          </div>
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Palette className="w-3.5 h-3.5 text-pink-500" /> Brand Logo & Colors
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono font-semibold">APPLIED</span>
                          </div>
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-amber-500" /> Anti-Slop Hook Score
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono font-semibold">99/100</span>
                          </div>
                        </div>

                        {/* Dispatch CTA */}
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-foreground">WhatsApp Dispatch</p>
                            <p className="text-[10px] text-muted-foreground">Instant founder notification</p>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCheck className="w-4 h-4" /> Ready
                          </span>
                        </div>
                      </div>

                      {/* Right: High-Fidelity Branded Creative Poster */}
                      <div className="lg:col-span-7 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-sky-500/10 border border-primary/30 p-4 flex flex-col justify-between shadow-md">
                        {/* Realistic Social Poster Graphic Card */}
                        <div className="rounded-xl overflow-hidden bg-gradient-to-br from-sky-950 via-slate-900 to-indigo-950 text-white p-5 border border-sky-400/30 shadow-xl space-y-4">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-sky-500 text-white font-extrabold text-xs flex items-center justify-center">
                                A
                              </div>
                              <div>
                                <p className="text-xs font-bold tracking-tight">ABCD HEALTH & WELLNESS</p>
                                <p className="text-[9px] text-sky-300 font-mono">OFFICIAL HEALTHCARE DRIVE</p>
                              </div>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                              FREE CAMP
                            </span>
                          </div>

                          <div className="space-y-1.5 py-1 text-center">
                            <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-bold">
                              THIS SATURDAY & SUNDAY
                            </span>
                            <h4 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                              MEGA HEALTH & CHECKUP DRIVE
                            </h4>
                            <p className="text-xs text-slate-300">
                              Free blood sugar & vitals checkup + 15% discount on all family health packages.
                            </p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between text-xs">
                            <span className="font-bold text-amber-300 flex items-center gap-1">
                              <BadgePercent className="w-4 h-4" /> 15% OFF FAMILY PACK
                            </span>
                            <span className="text-[11px] font-mono text-sky-200">Walk-Ins Welcome</span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] text-slate-400">
                            <span>WhatsApp: +91 8167685731</span>
                            <span>Valid Across All Verified Clinics</span>
                          </div>
                        </div>

                        {/* Multi-Format indicators */}
                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground pt-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-semibold text-foreground">
                              1:1 Square
                            </span>
                            <span className="px-2 py-0.5 rounded bg-muted/60 text-[10px] text-muted-foreground">
                              9:16 Story
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> High-Resolution 60 FPS Render
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB 1: MULTI-CHANNEL CALENDAR                                 */}
                {/* ------------------------------------------------------------- */}
                {activeSlide === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>30-Day Multi-Channel Publishing Schedule</span>
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Synchronized across Instagram, Facebook, LinkedIn, YouTube Shorts, and X
                        </p>
                      </div>
                      <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        14 Posts Queued This Week
                      </span>
                    </div>

                    {/* 7-Day Visual Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Mon */}
                      <div className="p-3.5 rounded-xl bg-card border border-border space-y-2 hover:border-primary/40 transition-colors shadow-2xs">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">Mon • 10:30 AM</span>
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">PUBLISHED</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          &ldquo;5 vital morning habits for high-energy productivity and health.&rdquo;
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-border/60 text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Instagram className="w-3.5 h-3.5 text-pink-500" />
                            <Facebook className="w-3.5 h-3.5 text-blue-500" />
                          </div>
                          <span className="font-mono text-emerald-400 font-semibold">1.2K Reach</span>
                        </div>
                      </div>

                      {/* Wed */}
                      <div className="p-3.5 rounded-xl bg-card border border-primary/40 space-y-2 shadow-xs">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">Wed • 6:00 PM</span>
                          <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">SCHEDULED</span>
                        </div>
                        <p className="text-xs text-foreground font-medium line-clamp-2">
                          &ldquo;Exclusive Weekend Flash Offer: 20% off all health checks. Book via WhatsApp now!&rdquo;
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-border/60 text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Instagram className="w-3.5 h-3.5 text-pink-500" />
                            <Linkedin className="w-3.5 h-3.5 text-sky-400" />
                            <Twitter className="w-3.5 h-3.5 text-zinc-300" />
                          </div>
                          <span className="font-mono text-primary font-semibold">Auto-Publish</span>
                        </div>
                      </div>

                      {/* Fri */}
                      <div className="p-3.5 rounded-xl bg-card border border-border space-y-2 hover:border-primary/40 transition-colors shadow-2xs">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">Fri • 11:00 AM</span>
                          <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">IN REVIEW</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          &ldquo;Customer Spotlight: How Dr. Sen increased patient visits by 40% with automated campaigns.&rdquo;
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-border/60 text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Youtube className="w-3.5 h-3.5 text-red-500" />
                            <Facebook className="w-3.5 h-3.5 text-blue-500" />
                          </div>
                          <span className="font-mono text-amber-400 font-semibold">WhatsApp Sent</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB 2: WHATSAPP 1-TAP REVIEW CONSOLE                          */}
                {/* ------------------------------------------------------------- */}
                {activeSlide === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-emerald-400" />
                          <span>WhatsApp 1-Tap Mobile Review Console</span>
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Business owners approve campaigns on phone in 5 seconds without desktop logins
                        </p>
                      </div>
                      <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Zero Password Needed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Realistic WhatsApp Chat Card */}
                      <div className="md:col-span-7 rounded-2xl bg-[#0b141a] text-white p-4 space-y-3 border border-emerald-500/30 shadow-xl">
                        {/* WhatsApp Top Chat Bar */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-black font-bold text-xs flex items-center justify-center">
                              A
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white flex items-center gap-1">
                                ABCD Social Bot
                                <span className="w-3 h-3 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[8px] font-black">
                                  ✓
                                </span>
                              </p>
                              <p className="text-[9px] text-emerald-400 font-mono">Official Business Dispatch</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono">10:30 AM</span>
                        </div>

                        {/* Incoming message bubble */}
                        <div className="p-3.5 rounded-xl bg-[#202c33] text-white space-y-2.5 border border-white/5">
                          <p className="text-xs text-zinc-200 leading-relaxed">
                            ✨ <strong>Batch #WK-44 Ready for Review!</strong> <br />
                            Hi Doctor/Owner, your 5 promotional creatives for this week are ready for publication across Instagram & Facebook.
                          </p>
                          <div className="p-2 rounded-lg bg-[#111b21] border border-white/10 text-[11px] text-emerald-300 font-mono flex items-center justify-between">
                            <span>Campaign: Health & Wellness Drive</span>
                            <span>₹0 Free Vitals</span>
                          </div>
                        </div>

                        {/* Interactive WhatsApp Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>1-Tap Approve & Publish</span>
                          </button>
                          <button
                            type="button"
                            className="py-2.5 px-3 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-zinc-200 font-semibold text-xs border border-white/10 transition-colors cursor-pointer"
                          >
                            Request Fast Edit
                          </button>
                        </div>
                      </div>

                      {/* Live Audit Trail */}
                      <div className="md:col-span-5 rounded-2xl bg-card border border-border p-4 space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                          Instant Publishing Pipeline
                        </span>
                        <div className="space-y-2 text-xs">
                          <div className="p-2 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
                            <span className="text-foreground font-medium">Meta Container ID</span>
                            <span className="font-mono text-[10px] text-emerald-400 font-bold">PRE-ALLOCATED</span>
                          </div>
                          <div className="p-2 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
                            <span className="text-foreground font-medium">Idempotency Key</span>
                            <span className="font-mono text-[10px] text-emerald-400 font-bold">LOCKED</span>
                          </div>
                          <div className="p-2 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
                            <span className="text-foreground font-medium">Publish Latency</span>
                            <span className="font-mono text-[10px] text-primary font-bold">~0.4s</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                          Approvals instantly trigger pg-boss workers without any human agency delay.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB 3: FOUNDER GROWTH & ROI COCKPIT                           */}
                {/* ------------------------------------------------------------- */}
                {activeSlide === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-primary" />
                          <span>Founder Marketing ROI & Growth Cockpit</span>
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Real-time delivery statistics, time saved, and official account safety
                        </p>
                      </div>
                      <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        Live Ledger Synced
                      </span>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl bg-card border border-border space-y-1 shadow-2xs">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Posters</span>
                        <p className="text-xl font-black text-foreground">48 / 50</p>
                        <p className="text-[10px] text-emerald-400 font-semibold">96% Quota Used</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-card border border-border space-y-1 shadow-2xs">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Reach</span>
                        <p className="text-xl font-black text-foreground">124.8K</p>
                        <p className="text-[10px] text-emerald-400 font-semibold">+34.2% Growth</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-card border border-border space-y-1 shadow-2xs">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Hours Saved</span>
                        <p className="text-xl font-black text-foreground">18.5 hrs</p>
                        <p className="text-[10px] text-primary font-semibold">~4.5 hrs / week</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-card border border-border space-y-1 shadow-2xs">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Publish Safety</span>
                        <p className="text-xl font-black text-emerald-400">99.8%</p>
                        <p className="text-[10px] text-muted-foreground font-semibold">Zero Ban Record</p>
                      </div>
                    </div>

                    {/* Visual Growth Sparkline / Metrics */}
                    <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground">Official Network Delivery Status</span>
                        <span className="text-[10px] font-mono text-muted-foreground">All Channels Verified</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-card border border-border flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><Instagram className="w-3.5 h-3.5 text-pink-500" /> Instagram</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                        <div className="p-2 rounded-lg bg-card border border-border flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><Facebook className="w-3.5 h-3.5 text-blue-500" /> Facebook</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                        <div className="p-2 rounded-lg bg-card border border-border flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5 text-sky-400" /> LinkedIn</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                        <div className="p-2 rounded-lg bg-card border border-border flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><Twitter className="w-3.5 h-3.5 text-zinc-300" /> X (Twitter)</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                        <div className="p-2 rounded-lg bg-card border border-border flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><Youtube className="w-3.5 h-3.5 text-red-500" /> YouTube</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. BOTTOM BROWSER STATUS BAR */}
            <div className="px-5 py-2 border-t border-border/60 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Browser Preview • Auto-switching every 6s (hover to pause)</span>
              </div>

              {/* Progress Dots */}
              <div className="flex items-center gap-1.5">
                {tabs.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`Switch to tab ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      activeSlide === idx
                        ? "w-6 bg-primary"
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* MacBook Bottom Base Stand Bevel */}
          <div className="mt-1 h-3.5 mx-auto max-w-[420px] rounded-b-xl bg-gradient-to-b from-muted to-border/70 border-x border-b border-border/80 shadow-md" />
        </div>
      </div>

      {/* =================================================================== */}
      {/* MOBILE SCREEN: NATIVE SMARTPHONE CAROUSEL SHOWCASE                 */}
      {/* =================================================================== */}
      <div className="block sm:hidden px-2">
        <div className="relative mx-auto max-w-[340px] rounded-[2.5rem] p-3 bg-gradient-to-b from-border/90 via-muted/30 to-border/90 border-2 border-border shadow-2xl">
          {/* Smartphone Inner Screen */}
          <div className="rounded-[2rem] overflow-hidden bg-card border border-border/80 shadow-inner flex flex-col">
            {/* Dynamic Island & Status Bar */}
            <div className="pt-2 px-4 pb-1.5 flex items-center justify-between bg-card text-[11px] text-foreground font-semibold">
              <span>9:41</span>
              {/* Dynamic Island pill */}
              <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="w-1 h-1 rounded-full bg-primary" />
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* App Header */}
            <div className="px-3.5 py-2 border-b border-border/60 bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px]">
                  A
                </div>
                <span className="text-xs font-bold text-foreground">ABCD Autopilot</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                LIVE
              </span>
            </div>

            {/* Mobile Carousel Tabs */}
            <div className="flex items-center gap-1 px-2.5 py-2 overflow-x-auto no-scrollbar border-b border-border/40 bg-muted/10">
              {tabs.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSlide(idx)}
                  type="button"
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg shrink-0 cursor-pointer transition-all ${
                    activeSlide === idx
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-muted/60 text-muted-foreground"
                  }`}
                >
                  {s.shortTitle}
                </button>
              ))}
            </div>

            {/* Mobile Viewport Slide Content */}
            <div className="p-3.5 min-h-[310px] flex flex-col justify-center text-left">
              {/* Mobile Slide 0: AI Autopilot */}
              {activeSlide === 0 && (
                <div className="space-y-2.5 animate-in fade-in duration-200">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-primary flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> 1. Voice / Text Input
                    </span>
                    <p className="text-xs text-foreground leading-snug">
                      &ldquo;Weekend Mega Health Camp: Free checkup & 15% discount on family packages.&rdquo;
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-card border border-emerald-500/30 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1">
                      <Bot className="w-3 h-3" /> 2. Poster Generated (0.4s)
                    </span>
                    <div className="p-2.5 rounded-lg bg-card border border-border text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Brand Logo: Included</span>
                        <span className="text-emerald-400 font-bold">✓</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Pricing: ₹0 Free Checkup</span>
                        <span className="text-emerald-400 font-bold">✓</span>
                      </div>
                    </div>
                    <div className="py-1.5 px-3 rounded-lg bg-emerald-500 text-black text-center text-xs font-bold shadow-xs">
                      Ready for WhatsApp Review
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Slide 1: Calendar Queue */}
              {activeSlide === 1 && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> Upcoming Queue
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">14 Posts</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-card border border-border space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-[11px]">Today • 10:30 AM</span>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">PUBLISHED</span>
                    </div>
                    <p className="text-muted-foreground text-[11px] line-clamp-1">5 habits for busy founders</p>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <Instagram className="w-3 h-3 text-pink-500" />
                      <Facebook className="w-3 h-3 text-blue-500" />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-card border border-primary/30 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-[11px]">Wed • 6:00 PM</span>
                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">SCHEDULED</span>
                    </div>
                    <p className="text-foreground text-[11px] line-clamp-1">Weekend Flash Sale Offer</p>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <Instagram className="w-3 h-3 text-pink-500" />
                      <Linkedin className="w-3.5 h-3.5 text-sky-400" />
                      <Twitter className="w-3 h-3 text-zinc-300" />
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Slide 2: WhatsApp Review */}
              {activeSlide === 2 && (
                <div className="space-y-2.5 animate-in fade-in duration-200">
                  <div className="rounded-xl border border-emerald-500/40 bg-card p-3 space-y-2 shadow-md">
                    <div className="flex items-center justify-between text-xs font-bold text-foreground">
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Message
                      </span>
                      <span className="text-[9px] text-emerald-400 font-mono">10:30 AM</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      ✨ Hi Doctor/Owner, your 5 creatives are ready for this week!
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        className="py-2 px-2.5 rounded-lg bg-emerald-500 text-black font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>1-Tap Publish</span>
                      </button>
                      <button
                        type="button"
                        className="py-2 px-2.5 rounded-lg bg-muted text-foreground font-semibold text-[11px]"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground">
                    Zero login or password needed on mobile
                  </p>
                </div>
              )}

              {/* Mobile Slide 3: ROI Cockpit */}
              {activeSlide === 3 && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-bold text-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-primary" /> Monthly ROI
                    </span>
                    <span className="text-[9px] text-primary font-mono">Ledger Live</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-card border border-border">
                      <div className="text-[10px] text-muted-foreground">Posters</div>
                      <div className="text-lg font-black text-foreground">48/50</div>
                      <div className="text-[9px] text-emerald-400">96% quota</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-border">
                      <div className="text-[10px] text-muted-foreground">Reach</div>
                      <div className="text-lg font-black text-foreground">124.8K</div>
                      <div className="text-[9px] text-emerald-400">+34% growth</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-border">
                      <div className="text-[10px] text-muted-foreground">Hours Saved</div>
                      <div className="text-lg font-black text-foreground">18.5h</div>
                      <div className="text-[9px] text-primary">~4.5h/week</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-card border border-border">
                      <div className="text-[10px] text-muted-foreground">Safety</div>
                      <div className="text-lg font-black text-emerald-400">99.8%</div>
                      <div className="text-[9px] text-muted-foreground">Zero ban</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Phone Navigation Bar */}
            <div className="p-2.5 border-t border-border/60 bg-muted/20 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5">
                {tabs.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      activeSlide === idx ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
